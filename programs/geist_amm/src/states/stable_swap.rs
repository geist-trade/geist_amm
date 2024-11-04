use anchor_lang::prelude::*;
use self::borsh;
use crate::{errors::GeistError, math::U256};

pub const MIN_AMP: u64 = 1;
pub const MAX_AMP: u64 = 1_000_000;

pub const MAX_ITERATIONS: u8 = 255;
pub const PRECISION: u64 = 1_000_000_000;
pub const RATES_PRECISION: u64 = 10_000;

#[derive(Clone, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum StableSwapMode {
    CONSTANT, // all tokens' prices are approaching 1
    RATED(Vec<u64>) // prices vary by token
}

pub struct SwapOut {
    pub out_amount: u64,
}

pub struct SwapIn {
    pub in_amount: u64,
}

#[derive(Clone, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub struct StableSwap {
    // Amplification coefficient
    pub amp: u64, // 8

    // Number of tokens in the pool.
    pub n_tokens: u64, // 8

    pub mode: StableSwapMode, // 1 + 4 + (n_tokens * 8)
}

impl StableSwap {
    pub const fn size(
        n_tokens: u64
    ) -> usize {
        return 2 * 8 + (1 + 4 + (n_tokens as usize) * 8);
    }

    pub fn new(
        amp: u64,
        n_tokens: u64,
        rates: Option<Vec<u64>>,
    ) -> Result<Self> {
        if (amp < MIN_AMP || amp > MAX_AMP) {
            return Err(GeistError::AmplificationCoefficientOutOfBound.into());
        }

        if (n_tokens < 2 || n_tokens > 8) {
            return Err(GeistError::PoolTokensCountOutOfBound.into())
        }

        if (rates.is_some()) {
            require!(
                rates.as_ref().unwrap().len() == (n_tokens as usize),
                GeistError::InvalidRates
            );

            for rate in rates.as_ref().unwrap() {
                require!(
                    *rate > 0,
                    GeistError::InvalidRates
                );
            }
        }

        Ok(Self {
            amp,
            n_tokens,
            mode: if rates.is_some() { 
                StableSwapMode::RATED(rates.unwrap())
            } else { 
                StableSwapMode::CONSTANT 
            }
        })
    }

    pub fn get_amp(&self) -> u64 {
        self.amp
    }

    pub fn add_token(
        &mut self
    ) -> () {
        self.n_tokens += 1;
    }

    pub fn remove_token(
        &mut self
    ) -> () {
        self.n_tokens -= 1;
    }

    // Helper to calculate the D invariant.
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

    // Calculate D invariant
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

    // Compute new Y balance given new X balance.
    pub fn compute_y(
        &self,
        balances: &Vec<u64>,
        i: usize,
        j: usize,
        new_j_balance: u64,
    ) -> Result<U256> {
        let n_balances = U256::from(balances.len() as u32);
    
        let nn = n_balances
            .checked_pow(n_balances)
            .ok_or(GeistError::MathOverflow)?;
    
        let ann = U256::from(self.amp)
            .checked_mul(nn)
            .ok_or(GeistError::MathOverflow)?;
    
        let d: U256 = self.compute_d(balances)?;
    
        let mut c = d
            .checked_mul(d)
            .ok_or(GeistError::MathOverflow)?
            .checked_div(U256::from(new_j_balance))
            .ok_or(GeistError::DivisionByZero)?;
    
        let mut sum = U256::from(new_j_balance);
    
        for (k, &balance) in balances.iter().enumerate() {
            if k != i && k != j {
                c = c
                    .checked_mul(d)
                    .ok_or(GeistError::MathOverflow)?
                    .checked_div(U256::from(balance))
                    .ok_or(GeistError::DivisionByZero)?;
                sum = sum
                    .checked_add(U256::from(balance))
                    .ok_or(GeistError::MathOverflow)?;
            }
        }
        
        c = c
            .checked_mul(d)
            .ok_or(GeistError::MathOverflow)?
            .checked_div(ann.checked_mul(n_balances).ok_or(GeistError::MathOverflow)?)
            .ok_or(GeistError::DivisionByZero)?;
    
        let b = sum
            .checked_add(d.checked_div(ann).ok_or(GeistError::DivisionByZero)?)
            .ok_or(GeistError::MathOverflow)?;
    
        let mut y_prev = d;
        for _ in 0..MAX_ITERATIONS {
            let y = self.compute_y_next(y_prev, b, c, d)?;
    
            if y.abs_diff(y_prev) <= U256::from(1) {
                return Ok(y);
            }
    
            y_prev = y;
        }
        Err(GeistError::InvariantPrecisionNotFound.into())
    }

    // Helper for compute_y 
    pub fn compute_y_next(
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

    // Calculates output (of `to` token) of a swap, given `from` input amount.
    pub fn swap_exact_in(
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
        let y = self.compute_y(
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

        let out_amount = dy;
        
        Ok(SwapOut {
            out_amount: out_amount.to_u64().ok_or(GeistError::MathOverflow)?
        })
    }

    // Returns amount of input tokens necessary in order to get
    // specified amount of output tokens as a result.
    pub fn swap_exact_out(
        &self,
        // Vector of all balances in the pool.
        balances: &Vec<u64>,
        // Index in the balances array. Token to be deposited.
        in_id: usize,
        // Index in the balances array. Token to be withdrawn.
        out_id: usize,
        // Amount of `from` coming into the swap.
        out_amount: u64
    ) -> Result<SwapIn> {
        // This is real out amount that we need to swap into. Users will
        // still get `out_amount`, the fee will go to the pool.
        let total_out = out_amount;

        msg!("balances: {:?}", balances);

        let y = self.compute_y(
            balances,
            in_id,
            out_id,
            balances[out_id]
                .checked_sub(total_out)
                .ok_or(GeistError::MathOverflow)?,
        )?;

        msg!("y: {}", y);

        let dy = y
            .checked_sub(U256::from(balances[in_id]))
            .ok_or(GeistError::MathOverflow)?;

        msg!("dy: {}", dy);

        Ok(SwapIn {
            in_amount: dy.to_u64().ok_or(GeistError::MathOverflow)?
        })
    }

    // Get virtual price of the LP token vs underlying assets.
    pub fn get_virtual_price(
        &self, 
        balances: &Vec<u64>,
        lp_token_supply: u64
    ) -> Result<u64> {
        let d = self.compute_d(balances)?;
        let n = balances.len() as u64;
    
        let virtual_price = d
            .checked_mul(U256::from(PRECISION))
            .and_then(|x| x.checked_div(U256::from(n)))
            .and_then(|x| x.checked_div(U256::from(lp_token_supply)))
            .ok_or(GeistError::MathOverflow)?;
    
        Ok(virtual_price.try_to_u64()?)
    }

    // Simulate output token price given exact input (specific amount).
    pub fn get_spot_price(
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
            out_amount
        } = self.swap_exact_in(
            balances,
            from,
            to,
            from_amount
        )?;

        let price = U256::from(from_amount)
            .checked_div(out_amount.into())
            .ok_or(GeistError::MathOverflow)?;

        Ok(price)
    }

    // Compute lp tokens that should be minted given specific deposit.
    pub fn compute_lp_tokens_on_deposit(
        &self,
        deposit_id: usize,
        deposit_amount: u64,
        balances: &Vec<u64>,
        lp_token_supply: u64
    ) -> Result<u64> {
        // If it's the first deposit in the pool, just calculate the invariant.
        if lp_token_supply == 0 {
            let mut new_balances = balances.clone();
            new_balances[deposit_id] += deposit_amount;

            let lp_tokens: u64 = self
                .compute_d(&new_balances)?
                .try_into()
                .map_err(|_| GeistError::MathOverflow)?;


            return Ok(lp_tokens);
        }

        let current_d = self.compute_d(balances)?;

        let mut new_balances = balances.clone();
        new_balances[deposit_id] = deposit_amount;

        let new_d = self.compute_d(&new_balances)?;
        let lp_tokens: u64 = U256::from(lp_token_supply)
                .checked_mul(
                    new_d
                        .checked_sub(current_d)
                        .ok_or(GeistError::MathOverflow)?
                )
                .ok_or(GeistError::MathOverflow)?
                .checked_div(current_d)
                .ok_or(GeistError::DivisionByZero)?
                .try_into()
                .map_err(|_| GeistError::MathOverflow)?;


        Ok(lp_tokens)
    }

    // Compute input amount of the lp token given withdrawal amount and token id.
    pub fn compute_lp_tokens_on_withdrawal(
        &self,
        withdrawal_id: usize,
        withdrawal_amount: u64,
        balances: &Vec<u64>,
        lp_token_supply: u64
    ) -> Result<u64> {
        let current_d = self.compute_d(balances)?;

        let mut new_balances = balances.clone();
        new_balances[withdrawal_id] -= withdrawal_amount;

        let new_d = self.compute_d(&new_balances)?;

        let lp_tokens: u64 = U256::from(lp_token_supply)
            .checked_mul(
                current_d
                    .checked_sub(new_d)
                    .ok_or(GeistError::MathOverflow)?
            )
            .ok_or(GeistError::MathOverflow)?
            .checked_div(current_d)
            .ok_or(GeistError::DivisionByZero)?
            .try_into()
            .map_err(|_| GeistError::CastFailed)?;

        Ok(lp_tokens)
    }

    pub fn compute_lp_tokens_on_deposit_multi(
        &self,
        deposits: &Vec<u64>,
        balances: &Vec<u64>,
        lp_token_supply: u64
    ) -> Result<u64> {
        msg!("lp token supply: {}", lp_token_supply);
        msg!("deposits: {}, balances: {}", deposits.len(), balances.len());

        if deposits.len() != balances.len() {
            return Err(GeistError::InvalidInputLength.into());
        }

        // If it's the first deposit in the pool
        if lp_token_supply == 0 {
            let new_balances: Vec<u64> = balances.iter().zip(deposits.iter())
                .map(|(&balance, &deposit)| balance
                    .checked_add(deposit)
                    .ok_or(GeistError::MathOverflow.into())
                )
                .collect::<Result<Vec<u64>>>()?;

            let lp_tokens: u64 = self.compute_d(&new_balances)?
                .try_into()
                .map_err(|_| GeistError::MathOverflow)?;

            return Ok(lp_tokens);
        }

        let current_d = self.compute_d(balances)?;
        msg!("current d: {}", current_d);

        let new_balances = balances.iter().zip(deposits.iter())
            .map(|(&balance, &deposit)| balance
                .checked_add(deposit)
                .ok_or(GeistError::MathOverflow.into())
            )
            .collect::<Result<Vec<u64>>>()?;

        let new_d = self.compute_d(&new_balances)?;
        msg!("new d: {}", new_d);

        let lp_tokens: u64 = U256::from(lp_token_supply)
            .checked_mul(
                new_d
                    .checked_sub(current_d)
                    .ok_or(GeistError::MathOverflow)?
            )
            .ok_or(GeistError::MathOverflow)?
            .checked_div(current_d)
            .ok_or(GeistError::DivisionByZero)?
            .try_into()
            .map_err(|_| GeistError::MathOverflow)?;


        Ok(lp_tokens)
    }

    pub fn compute_tokens_on_withdrawal(
        &self,
        balances: &Vec<u64>,
        lp_token_supply: u64,
        lp_token_withdrawal: u64,
    ) -> Result<Vec<u64>> { 
        let total_pool_share_bps = lp_token_withdrawal * 10_000 / lp_token_supply;
        let tokens = balances
            .iter()
            .map(| balance | balance * total_pool_share_bps / 10_000)
            .collect::<Vec<u64>>();

        Ok(tokens)
    }

    pub fn balance_to_rated(
        &self,
        balance: u64,
        rate: u64,
        rate_precision: u64
    ) -> Result<u64> {
        let rated = balance
            .checked_mul(rate)
            .ok_or(GeistError::MathOverflow)?
            .checked_div(rate_precision)
            .ok_or(GeistError::MathOverflow)?;

        Ok(rated)
    }

    pub fn balances_to_rated(
        &self,
        balances: &Vec<u64>,
        rates: &Vec<u64>,
        rate_precision: u64
    ) -> Result<Vec<u64>> {
        balances
            .iter()
            .zip(rates.iter())
            .map(|(balance, rate)| self.balance_to_rated(*balance, *rate, rate_precision))
            .collect()
    }

    pub fn swap_exact_in_rated(
        &self,
        // Vector of all balances in the pool.
        balances: &Vec<u64>,
        // Rates of all balances in the pool. MAX=1
        rates: &Vec<u64>,
        // Rate of the rates above.
        rate_precision: u64,
        // Index in the balances array. Token to be deposited.
        from: usize,
        // Index in the balances array. Token to be withdrawn.
        to: usize,
        // Amount of `from` coming into the swap.
        from_amount: u64,
    ) -> Result<SwapOut> {
        let balances_rated = self.balances_to_rated(balances, rates, rate_precision)?;
        self.swap_exact_in(&balances_rated, from, to, from_amount)
    }

    pub fn swap_exact_out_rated(
        &self,
        // Vector of all balances in the pool.
        balances: &Vec<u64>,
        // Rates of all balances in the pool. MAX=1
        rates: &Vec<u64>,
        // Rate of the rates above.
        rate_precision: u64,
        // Index in the balances array. Token to be deposited.
        from: usize,
        // Index in the balances array. Token to be withdrawn.
        to: usize,
        // Amount of `to` coming out of the swap.
        from_amount: u64,
    ) -> Result<SwapIn> {
        let balances_rated = self.balances_to_rated(balances, rates, rate_precision)?;
        self.swap_exact_out(&balances_rated, from, to, from_amount)
    }

    pub fn compute_lp_tokens_on_deposit_rated(
        &self,
        deposit_id: usize,
        deposit_amount: u64,
        balances: &Vec<u64>,
        rates: &Vec<u64>,
        rate_precision: u64,
        lp_token_supply: u64
    ) -> Result<u64> {
        let balances_rated = self.balances_to_rated(balances, rates, rate_precision)?;
        self.compute_lp_tokens_on_deposit(deposit_id, deposit_amount, &balances_rated, lp_token_supply)
    }

    pub fn compute_lp_tokens_on_withdrawal_rated(
        &self,
        withdrawal_id: usize,
        withdrawal_amount: u64,
        balances: &Vec<u64>,
        rates: &Vec<u64>,
        rate_precision: u64,
        lp_token_supply: u64
    ) -> Result<u64> {
        let balances_rated = self.balances_to_rated(balances, rates, rate_precision)?;
        self.compute_lp_tokens_on_withdrawal(withdrawal_id, withdrawal_amount, &balances_rated, lp_token_supply)
    }

    pub fn compute_lp_tokens_on_deposit_multi_rated(
        &self,
        deposits: &Vec<u64>,
        balances: &Vec<u64>,
        rates: &Vec<u64>,
        rate_precision: u64,
        lp_token_supply: u64
    ) -> Result<u64> {
        let balances_rated = self.balances_to_rated(balances, rates, rate_precision)?;
        let deposits_rated = self.balances_to_rated(deposits, rates, rate_precision)?;

        self.compute_lp_tokens_on_deposit_multi(
            &deposits_rated, 
            &balances_rated,
            lp_token_supply
        )
    }

    pub fn compute_tokens_on_withdrawal_rated(
        &self,
        balances: &Vec<u64>,
        rates: &Vec<u64>,
        rate_precision: u64,
        lp_token_supply: u64,
        lp_token_withdrawal: u64,
    ) -> Result<Vec<u64>> {
        let balances_rated = self.balances_to_rated(balances, rates, rate_precision)?;

        self.compute_tokens_on_withdrawal(
            &balances_rated, 
            lp_token_supply, 
            lp_token_withdrawal
        )
    }
}