use anchor_lang::prelude::*;
use crate::{errors::GeistError, math::{u256, U256}};

pub const MAX_ITERATIONS: u8 = 255;
pub const PRECISION: u64 = 1_000_000_000;

pub struct SwapOut {
    out_amount: U256,
    fee: U256,
}

pub struct SwapIn {
    in_amount: U256,
    fee: U256,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct StableSwap {
    // Amplification coefficient
    amp: u64, // 8
    
    // Number of tokens in the pool.
    n_tokens: u64, // 8
}

impl StableSwap {
    pub const SIZE: u64 = 8 + 2 * 8;

    pub fn new(
        amp: u64,
        n_tokens: u64,
    ) -> Self {
        Self {
            amp,
            n_tokens
        }
    }

    pub fn new_binary(
        amp: u64,
    ) -> Self {
        Self {
            amp,
            n_tokens: 2
        }
    }

    pub fn compute_d_next(
        &self,
        d_prev: U256,
        n: u32,
        nn: u32,
        balances: &Vec<u64>,
        ann_sum: U256,
        ann_minus_one: U256,
        n_plus_one: u32,
    ) -> Result<U256> {
        let mut d_prod = d_prev;
        
        for &balance in balances {
            d_prod = d_prod
                .checked_mul(d_prev)
                .ok_or(GeistError::MathOverflow)?
                .checked_div(balance.into())
                .ok_or(GeistError::MathOverflow)?;
        }

        d_prod = d_prod
            .checked_div(nn.into())
            .unwrap();

        let numerator = d_prev
            .checked_mul(
                d_prod
                    .checked_mul(n.into())
                    .ok_or(GeistError::MathOverflow)?
                    .checked_add(ann_sum)
                    .ok_or(GeistError::MathOverflow)?,
            )
            .ok_or(GeistError::MathOverflow)?;

        let denominator = d_prev
            .checked_mul(ann_minus_one)
            .ok_or(GeistError::MathOverflow)?
            .checked_add(
                d_prod
                    .checked_mul(n_plus_one.into())
                    .ok_or(GeistError::MathOverflow)?,
            )
            .ok_or(GeistError::MathOverflow)?;

        numerator
            .checked_div(denominator)
            .ok_or(GeistError::MathOverflow.into())
    }

    pub fn compute_d(
        &self,
        balances: &Vec<u64>,
    ) -> Result<U256> {
        let sum = balances
            .iter()
            .try_fold(U256::zero(),
            |accumulator, &balance| {
                    accumulator.checked_add(balance.into())
                    .ok_or(GeistError::MathOverflow)
                }
            )?;

        if (sum == 0.into()) {
            return Ok(U256::zero());
        }

        let n = balances.len() as u32;
        let nn = n
            .checked_pow(n)
            .ok_or(GeistError::MathOverflow)?;
        let ann = U256::from(self.amp) * U256::from(nn);


        let ann_sum = ann
            .checked_mul(sum)
            .ok_or(GeistError::MathOverflow)?;

        let ann_minus_one = ann
            .checked_sub(1.into())
            .ok_or(GeistError::MathOverflow)?;

        let n_plus_one = n
            .checked_add(1)
            .ok_or(GeistError::MathOverflow)?;

        let mut D = sum;

        for _ in 0..MAX_ITERATIONS {
            let d_next = self.compute_d_next(
                D, 
                n, 
                nn, 
                balances, 
                ann_sum, 
                ann_minus_one, 
                n_plus_one
            )?;

            if d_next.abs_diff(D) <= 1.into() {
                return Ok(D);
            }

            D = d_next;
        }
        
        Err(GeistError::InvariantPrecisionNotFound.into())
    }

    fn compute_i_from_j(
        &self,
        // Vector of all balances in the pool.
        balances: &Vec<u64>,
        // Index of the X balance in the vec above.
        i: usize,
        // Index of the Y balance in the vec above
        j: usize,
        // New X balance
        new_j_balance: u64,
    ) -> Result<U256> {
        let n_balances = U256::from(balances.len() as u32);

        let nn = n_balances
            .checked_pow(n_balances)
            .ok_or(GeistError::MathOverflow)?.into();

        let ann = U256::from(self.amp)
            .checked_mul(nn)
            .ok_or(GeistError::MathOverflow)?;

        let d: U256 = self.compute_d(balances)?;

        let mut product_term = d
            .checked_mul(d)
            .ok_or(GeistError::MathOverflow)?
            .checked_div(new_j_balance.into())
            .ok_or(GeistError::DivisionByZero)?;

        let mut total_balances = U256::from(new_j_balance);

        for (k, &balance) in balances.iter().enumerate() {
            if k != i && k != j {
                total_balances = total_balances
                    .checked_add(balance.into())
                    .ok_or(GeistError::MathOverflow)?;

                product_term = product_term
                    .checked_mul(d)
                    .ok_or(GeistError::MathOverflow)?
                    .checked_div(balance.into())
                    .ok_or(GeistError::DivisionByZero)?;
            }
        }
        
        product_term = product_term
            .checked_mul(d)
            .ok_or(GeistError::MathOverflow)?
            .checked_div(
                ann
                    .checked_mul(n_balances)
                    .ok_or(GeistError::MathOverflow)?
            )
            .ok_or(GeistError::DivisionByZero)?;

        let sum_term: U256 = d
            .checked_div(ann)
            .ok_or(GeistError::MathOverflow)?
            .checked_add(total_balances)
            .ok_or(GeistError::MathOverflow)?;
    
        let mut y_prev = d;
        for _ in 0..MAX_ITERATIONS {
            let y = self.compute_i_from_j_next(
                y_prev, 
                sum_term, 
                product_term, 
                d
            )?;

            if y.abs_diff(y_prev) <= 1.into() {
                return Ok(y);
            }

            y_prev = y;
        }
        Err(GeistError::InvariantPrecisionNotFound.into())
    }

    fn compute_i_from_j_next(
        &self,
        y_prev: U256, 
        b: U256, 
        c: U256, 
        d: U256
    ) -> Result<U256> {
        let numerator = y_prev
            .checked_pow(2.into())
            .ok_or(GeistError::MathOverflow)?
            .checked_add(c)
            .ok_or(GeistError::MathOverflow)?;

        let denominator = y_prev
            .checked_mul(2.into())
            .ok_or(GeistError::MathOverflow)?
            .checked_add(b)
            .ok_or(GeistError::MathOverflow)?
            .checked_sub(d)
            .ok_or(GeistError::MathOverflow)?;

        numerator
            .checked_div(denominator)
            .ok_or(GeistError::DivisionByZero.into())
    }

    // Calculates output `to` amount after a swap, given `from` input.
    fn swap_exact_in(
        &self,
        // Vector of all balances in the pool.
        balances: &Vec<u64>,
        // Index in the balances array. Token to be deposited.
        from: usize,
        // Index in the balances array. Token to be withdrawn.
        to: usize,
        // Amount of `from` coming into the swap.
        from_amount: u64,
    ) -> Result<SwapOut> {
        // Calculate new balance of `from`.
        let new_from = balances[from]
            .checked_add(from_amount)
            .ok_or(GeistError::MathOverflow)?;

        // Calculate how much Y token will be left in the pool after swap.
        let y = self.compute_i_from_j(
            balances,
            to,
            from,
            new_from
        )?;

        // Calculate difference between initial and after-swap balances of the output token.
        // The difference is essentially how much token will be returned from the pool.
        let dy = U256::from(balances[to])
            .checked_sub(y)
            .ok_or(GeistError::MathOverflow)?
            .checked_sub(1.into())
            .ok_or(GeistError::MathOverflow)?;

        let fee = U256::from(0);
        let out_amount = dy
            .checked_sub(fee)
            .ok_or(GeistError::MathOverflow)?;
        
        Ok(SwapOut {
            fee,
            out_amount
        })
    }

    // Returns amount of input tokens necessary in order to get
    // specified amount of output tokens as a result.
    fn swap_exact_out(
        &self,
        // Vector of all balances in the pool.
        balances: &Vec<u64>,
        // Index in the balances array. Token to be deposited.
        in_id: usize,
        // Index in the balances array. Token to be withdrawn.
        out_id: usize,
        // Amount of `from` coming into the swap.
        out_amount: u64,
        // Fee taken on the swap, in basepoints.
        fee_bps: u64,
    ) -> Result<SwapIn> {
        let fee = out_amount
            .checked_mul(fee_bps)
            .ok_or(GeistError::MathOverflow)?
            .checked_div(10_000 as u64)
            .ok_or(GeistError::MathOverflow)?;

        // This is real out amount that we need to swap into. Users will
        // still get `out_amount`, the fee will go to the pool.
        let total_out = out_amount
            .checked_add(fee)
            .ok_or(GeistError::MathOverflow)?;

        let y = self.compute_i_from_j(
            balances,
            in_id,
            out_id,
            balances[out_id]
                .checked_sub(total_out)
                .ok_or(GeistError::MathOverflow)?,
        )?;

        let dy = y
            .checked_sub(U256::from(balances[in_id]))
            .ok_or(GeistError::MathOverflow)?;

        Ok(SwapIn {
            fee: fee.into(),
            in_amount: dy
        })
    }

    // Get virtual price of the LP token vs underlying assets.
    fn get_virtual_price(
        &self, 
        balances: &Vec<u64>,
        lp_token_supply: u64
    ) -> Result<U256> {
        let d = self.compute_d(balances)?;
        let n = balances.len() as u64;
    
        let virtual_price = d
            .checked_mul(U256::from(PRECISION))
            .and_then(|x| x.checked_div(U256::from(n)))
            .and_then(|x| x.checked_div(U256::from(lp_token_supply)))
            .ok_or(GeistError::MathOverflow)?;
    
        Ok(virtual_price)
    }

    // Simulate swap & return price given exact input.
    fn get_spot_price(
        &self,
        // Vector of all balances in the pool.
        balances: &Vec<u64>,
        // Index in the balances array. Token to be deposited.
        from: usize,
        // Index in the balances array. Token to be withdrawn.
        to: usize,
        // Amount of `from` coming into the swap.
        from_amount: u64,
    ) -> Result<U256> {
        let SwapOut {
            fee: _,
            out_amount
        } = self.swap_exact_in(
            balances,
            from,
            to,
            from_amount
        )?;

        let price = U256::from(from_amount)
            .checked_div(out_amount)
            .ok_or(GeistError::MathOverflow)?;

        Ok(price)
    }

}