# Geist AMM
#### Automated Market Maker for co-integrated assets, particularly stablecoins.

# TODO
- rescale all balances up to 9 decimals for calculations, then rescale back to real decimals.
- simplify binary_pool to just be implementation of multi_pool with 2 tokens.
- tests, tests, tests.
- organize & cleanup codebase.

### TL:DR
Geist AMM is an Automated Market Maker for cointegrated assets.

### Cointegrated assets
Cointegrated assets are simply assets that oscillate around the same prices in the long term, with short term deviations. Examples of cointegrated assets are:
- stablecoins,
- LSTs,
- wrapped & bridged tokens,
- etc.

### Implementation
Geist AMM uses StableSwap algorithm to maximalize liquidity and improve swap efficiency for groups of cointegrated assets. StableSwap is the same algorithm that is used by Curve on Ethereum, or Saber on Solana.

### Features
Geist enables hyper efficient stablecoin swaps, minimizing slippage and effectively minimizing swaps slippage to zero. It supports up to 8 tokens in one Liquidity Pool, allowing greater capital efficiency and enabling complex swaps involving multiple tokens at once. Geist offers Smart Callbacks, which are additional instructions atomically executed after the stablecoin swap. 