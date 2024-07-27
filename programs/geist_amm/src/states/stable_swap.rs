use anchor_lang::prelude::*;
use crate::{errors::GeistError, math::U256};

pub const MAX_ITERATIONS: u8 = 255;

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

}