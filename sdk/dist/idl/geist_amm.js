"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDL = void 0;
exports.IDL = {
    "version": "0.1.0",
    "name": "geist_amm",
    "instructions": [
        {
            "name": "initializeCore",
            "accounts": [
                {
                    "name": "superadmin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "core",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "args",
                    "type": {
                        "defined": "InitializeCoreArgs"
                    }
                }
            ]
        },
        {
            "name": "addStablecoin",
            "accounts": [
                {
                    "name": "superadmin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "core",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablecoin",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "disableStablecoin",
            "accounts": [
                {
                    "name": "superadmin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "core",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablecoin",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "initializePool",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "core",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "pool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "lpToken",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "lpTokenAdminAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "args",
                    "type": {
                        "defined": "InitializePoolArgs"
                    }
                }
            ]
        },
        {
            "name": "addLiquidity",
            "accounts": [
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "core",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "pool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "lpToken",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "lpTokenUserAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "args",
                    "type": {
                        "defined": "AddLiquidityArgs"
                    }
                }
            ]
        },
        {
            "name": "withdrawLiquidity",
            "accounts": [
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "core",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "pool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "lpToken",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "lpTokenUserAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "args",
                    "type": {
                        "defined": "WithdrawLiquidityArgs"
                    }
                }
            ]
        },
        {
            "name": "getVirtualPrice",
            "accounts": [
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "pool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "lpToken",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "args",
                    "type": {
                        "defined": "GetVirtualPriceArgs"
                    }
                }
            ],
            "returns": "u64"
        },
        {
            "name": "swap",
            "accounts": [
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "core",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "pool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablecoinInput",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablecoinOutput",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablecoinInputVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablecoinOutputVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablecoinInputUserAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablecoinOutputUserAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "args",
                    "type": {
                        "defined": "SwapArgs"
                    }
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "core",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "nextPoolId",
                        "type": "u64"
                    },
                    {
                        "name": "superadmin",
                        "type": "publicKey"
                    },
                    {
                        "name": "platformFeeBps",
                        "type": "u64"
                    },
                    {
                        "name": "supportedStablecoins",
                        "type": {
                            "vec": "publicKey"
                        }
                    },
                    {
                        "name": "withdrawOnlyStablecoins",
                        "type": {
                            "vec": "publicKey"
                        }
                    },
                    {
                        "name": "isFrozen",
                        "type": "bool"
                    }
                ]
            }
        },
        {
            "name": "pool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "index",
                        "type": "u64"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "admin",
                        "type": "publicKey"
                    },
                    {
                        "name": "stablecoins",
                        "type": {
                            "vec": "publicKey"
                        }
                    },
                    {
                        "name": "isFrozen",
                        "type": "bool"
                    },
                    {
                        "name": "lpToken",
                        "type": "publicKey"
                    },
                    {
                        "name": "swap",
                        "type": {
                            "defined": "StableSwap"
                        }
                    },
                    {
                        "name": "fees",
                        "type": {
                            "defined": "Fees"
                        }
                    },
                    {
                        "name": "tokenMode",
                        "type": {
                            "defined": "TokenMode"
                        }
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "InitializeCoreArgs",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "platformFeeBps",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "GetVirtualPriceArgs",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "poolId",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "InitializePoolArgs",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "amp",
                        "type": "u64"
                    },
                    {
                        "name": "nTokens",
                        "type": "u64"
                    },
                    {
                        "name": "deposits",
                        "type": {
                            "vec": "u64"
                        }
                    },
                    {
                        "name": "fees",
                        "type": {
                            "defined": "Fees"
                        }
                    }
                ]
            }
        },
        {
            "name": "AddLiquidityArgs",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "poolId",
                        "type": "u64"
                    },
                    {
                        "name": "deposits",
                        "type": {
                            "vec": "u64"
                        }
                    }
                ]
            }
        },
        {
            "name": "WithdrawLiquidityArgs",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "poolId",
                        "type": "u64"
                    },
                    {
                        "name": "lpTokenBurn",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "ExactIn",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "minimumReceived",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "ExactOut",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "maximumTaken",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "SwapArgs",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "poolId",
                        "type": "u64"
                    },
                    {
                        "name": "fromId",
                        "type": "u8"
                    },
                    {
                        "name": "toId",
                        "type": "u8"
                    },
                    {
                        "name": "amount",
                        "type": "u64"
                    },
                    {
                        "name": "mode",
                        "type": {
                            "defined": "SwapMode"
                        }
                    }
                ]
            }
        },
        {
            "name": "SwapMode",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "ExactIn",
                        "fields": [
                            {
                                "defined": "ExactIn"
                            }
                        ]
                    },
                    {
                        "name": "ExactOut",
                        "fields": [
                            {
                                "defined": "ExactOut"
                            }
                        ]
                    }
                ]
            }
        },
        {
            "name": "Fees",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "swapFeeBps",
                        "type": "u64"
                    },
                    {
                        "name": "liquidityRemovalFeeBps",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "TokenMode",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "SPL"
                    },
                    {
                        "name": "COMPRESSED"
                    }
                ]
            }
        },
        {
            "name": "StableSwap",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "amp",
                        "type": "u64"
                    },
                    {
                        "name": "nTokens",
                        "type": "u64"
                    },
                    {
                        "name": "mode",
                        "type": {
                            "defined": "StableSwapMode"
                        }
                    }
                ]
            }
        },
        {
            "name": "StableSwapMode",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "BINARY"
                    },
                    {
                        "name": "MULTI"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidCallbackError",
            "msg": "InvalidCallbackError"
        },
        {
            "code": 6001,
            "name": "StablecoinNotSupported",
            "msg": "StablecoinNotSupported"
        },
        {
            "code": 6002,
            "name": "StablecoinAlreadySupported",
            "msg": "StablecoinAlreadySupported"
        },
        {
            "code": 6003,
            "name": "Frozen",
            "msg": "Frozen"
        },
        {
            "code": 6004,
            "name": "InvalidOracle",
            "msg": "InvalidOracle"
        },
        {
            "code": 6005,
            "name": "DuplicatedMints",
            "msg": "DuplicatedMints"
        },
        {
            "code": 6006,
            "name": "NotEnoughTokens",
            "msg": "NotEnoughTokens"
        },
        {
            "code": 6007,
            "name": "CastFailed",
            "msg": "CastFailed"
        },
        {
            "code": 6008,
            "name": "MathOverflow",
            "msg": "MathOverflow"
        },
        {
            "code": 6009,
            "name": "InvariantPrecisionNotFound",
            "msg": "InvariantPrecisionNotFound"
        },
        {
            "code": 6010,
            "name": "DivisionByZero",
            "msg": "DivisionByZero"
        },
        {
            "code": 6011,
            "name": "PoolTokensCountOutOfBound",
            "msg": "PoolTokensCountOutOfBound"
        },
        {
            "code": 6012,
            "name": "InvalidInputLength",
            "msg": "InvalidInputLength"
        },
        {
            "code": 6013,
            "name": "AmplificationCoefficientOutOfBound",
            "msg": "AmplificationCoefficientOutOfBound"
        },
        {
            "code": 6014,
            "name": "LpTokenPreMinted",
            "msg": "LpTokenPreMinted"
        },
        {
            "code": 6015,
            "name": "InvalidMintAuthority",
            "msg": "InvalidMintAuthority"
        },
        {
            "code": 6016,
            "name": "InvalidFreezeAuthority",
            "msg": "InvalidFreezeAuthority"
        },
        {
            "code": 6017,
            "name": "LpTokenNotInitialized",
            "msg": "LpTokenNotInitialized"
        },
        {
            "code": 6018,
            "name": "InvalidRemainingAccountsSchema",
            "msg": "InvalidRemainingAccountsSchema"
        },
        {
            "code": 6019,
            "name": "InvalidTokenAccountOwner",
            "msg": "InvalidTokenAccountOwner"
        },
        {
            "code": 6020,
            "name": "InvalidTokenAccountMint",
            "msg": "InvalidTokenAccountMint"
        },
        {
            "code": 6021,
            "name": "InvalidVault",
            "msg": "InvalidVault"
        },
        {
            "code": 6022,
            "name": "InvalidTokenAccount",
            "msg": "InvalidTokenAccount"
        },
        {
            "code": 6023,
            "name": "AtaNotInitialized",
            "msg": "AtaNotInitialized"
        },
        {
            "code": 6024,
            "name": "NotEnoughFunds",
            "msg": "NotEnoughFunds"
        },
        {
            "code": 6025,
            "name": "InvalidInput",
            "msg": "InvalidInput"
        },
        {
            "code": 6026,
            "name": "PoolIdMismatch",
            "msg": "PoolIdMismatch"
        },
        {
            "code": 6027,
            "name": "PoolFrozen",
            "msg": "PoolFrozen"
        },
        {
            "code": 6028,
            "name": "NotEnoughLiquidity",
            "msg": "NotEnoughLiquidity"
        },
        {
            "code": 6029,
            "name": "ProtocolFrozen",
            "msg": "ProtocolFrozen"
        },
        {
            "code": 6030,
            "name": "SlippageExceeded",
            "msg": "SlippageExceeded"
        },
        {
            "code": 6031,
            "name": "SuperadminMismatch",
            "msg": "InvalidSuperadmin"
        },
        {
            "code": 6032,
            "name": "StablecoinWithdrawOnly",
            "msg": "StablecoinWithdrawOnly"
        },
        {
            "code": 6033,
            "name": "InsufficientBalanceForWithdrawal",
            "msg": "InsufficientBalanceForWithdrawal"
        },
        {
            "code": 6034,
            "name": "ZeroBalance",
            "msg": "ZeroBalance"
        },
        {
            "code": 6035,
            "name": "ZeroInitialDeposit",
            "msg": "ZeroInitialDeposit"
        },
        {
            "code": 6036,
            "name": "InvalidLpTokenDecimals",
            "msg": "InvalidLpTokenDecimals"
        }
    ]
};
