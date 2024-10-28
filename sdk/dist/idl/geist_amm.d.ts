/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/geist_amm.json`.
 */
export type GeistAmm = {
    "address": string;
    "metadata": {
        "name": "geistAmm";
        "version": "0.1.0";
        "spec": "0.1.0";
        "description": "Created with Anchor";
    };
    "instructions": [
        {
            "name": "addLiquidity";
            "discriminator": [
                181,
                157,
                89,
                67,
                143,
                182,
                52,
                72
            ];
            "accounts": [
                {
                    "name": "user";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "core";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    99,
                                    111,
                                    114,
                                    101
                                ];
                            }
                        ];
                    };
                },
                {
                    "name": "pool";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    98,
                                    105,
                                    110,
                                    97,
                                    114,
                                    121,
                                    95,
                                    112,
                                    111,
                                    111,
                                    108
                                ];
                            },
                            {
                                "kind": "arg";
                                "path": "args.pool_id";
                            }
                        ];
                    };
                },
                {
                    "name": "lpToken";
                    "writable": true;
                },
                {
                    "name": "lpTokenUserAta";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account";
                                "path": "user";
                            },
                            {
                                "kind": "const";
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "lpToken";
                            }
                        ];
                        "program": {
                            "kind": "const";
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ];
                        };
                    };
                },
                {
                    "name": "tokenProgram";
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                }
            ];
            "args": [
                {
                    "name": "args";
                    "type": {
                        "defined": {
                            "name": "addLiquidityArgs";
                        };
                    };
                }
            ];
        },
        {
            "name": "addStablecoin";
            "discriminator": [
                184,
                160,
                218,
                168,
                41,
                5,
                46,
                54
            ];
            "accounts": [
                {
                    "name": "superadmin";
                    "writable": true;
                    "signer": true;
                    "relations": [
                        "core"
                    ];
                },
                {
                    "name": "core";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    99,
                                    111,
                                    114,
                                    101
                                ];
                            }
                        ];
                    };
                },
                {
                    "name": "stablecoin";
                    "writable": true;
                },
                {
                    "name": "rent";
                    "address": "SysvarRent111111111111111111111111111111111";
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [];
        },
        {
            "name": "disableStablecoin";
            "discriminator": [
                166,
                47,
                238,
                242,
                60,
                220,
                52,
                54
            ];
            "accounts": [
                {
                    "name": "superadmin";
                    "writable": true;
                    "signer": true;
                    "relations": [
                        "core"
                    ];
                },
                {
                    "name": "core";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    99,
                                    111,
                                    114,
                                    101
                                ];
                            }
                        ];
                    };
                },
                {
                    "name": "stablecoin";
                    "writable": true;
                }
            ];
            "args": [];
        },
        {
            "name": "getVirtualPrice";
            "discriminator": [
                41,
                165,
                98,
                171,
                1,
                184,
                61,
                157
            ];
            "accounts": [
                {
                    "name": "user";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "pool";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    98,
                                    105,
                                    110,
                                    97,
                                    114,
                                    121,
                                    95,
                                    112,
                                    111,
                                    111,
                                    108
                                ];
                            },
                            {
                                "kind": "arg";
                                "path": "args.pool_id";
                            }
                        ];
                    };
                },
                {
                    "name": "lpToken";
                    "writable": true;
                }
            ];
            "args": [
                {
                    "name": "args";
                    "type": {
                        "defined": {
                            "name": "getVirtualPriceArgs";
                        };
                    };
                }
            ];
            "returns": "u64";
        },
        {
            "name": "initializeCore";
            "discriminator": [
                26,
                107,
                177,
                14,
                71,
                136,
                11,
                91
            ];
            "accounts": [
                {
                    "name": "superadmin";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "core";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    99,
                                    111,
                                    114,
                                    101
                                ];
                            }
                        ];
                    };
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [
                {
                    "name": "args";
                    "type": {
                        "defined": {
                            "name": "initializeCoreArgs";
                        };
                    };
                }
            ];
        },
        {
            "name": "initializePool";
            "discriminator": [
                95,
                180,
                10,
                172,
                84,
                174,
                232,
                40
            ];
            "accounts": [
                {
                    "name": "admin";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "core";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    99,
                                    111,
                                    114,
                                    101
                                ];
                            }
                        ];
                    };
                },
                {
                    "name": "pool";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    98,
                                    105,
                                    110,
                                    97,
                                    114,
                                    121,
                                    95,
                                    112,
                                    111,
                                    111,
                                    108
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "core.next_pool_id";
                                "account": "core";
                            }
                        ];
                    };
                },
                {
                    "name": "lpToken";
                    "writable": true;
                },
                {
                    "name": "lpTokenAdminAta";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account";
                                "path": "admin";
                            },
                            {
                                "kind": "const";
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "lpToken";
                            }
                        ];
                        "program": {
                            "kind": "const";
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ];
                        };
                    };
                },
                {
                    "name": "rent";
                    "address": "SysvarRent111111111111111111111111111111111";
                },
                {
                    "name": "tokenProgram";
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [
                {
                    "name": "args";
                    "type": {
                        "defined": {
                            "name": "initializePoolArgs";
                        };
                    };
                }
            ];
        },
        {
            "name": "swap";
            "discriminator": [
                248,
                198,
                158,
                145,
                225,
                117,
                135,
                200
            ];
            "accounts": [
                {
                    "name": "user";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "core";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    99,
                                    111,
                                    114,
                                    101
                                ];
                            }
                        ];
                    };
                },
                {
                    "name": "pool";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    98,
                                    105,
                                    110,
                                    97,
                                    114,
                                    121,
                                    95,
                                    112,
                                    111,
                                    111,
                                    108
                                ];
                            },
                            {
                                "kind": "arg";
                                "path": "args.pool_id";
                            }
                        ];
                    };
                },
                {
                    "name": "stablecoinInput";
                    "writable": true;
                },
                {
                    "name": "stablecoinOutput";
                    "writable": true;
                },
                {
                    "name": "stablecoinInputVault";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "pool";
                            },
                            {
                                "kind": "account";
                                "path": "stablecoinInput";
                            }
                        ];
                    };
                },
                {
                    "name": "stablecoinOutputVault";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "pool";
                            },
                            {
                                "kind": "account";
                                "path": "stablecoinOutput";
                            }
                        ];
                    };
                },
                {
                    "name": "stablecoinInputUserAta";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account";
                                "path": "user";
                            },
                            {
                                "kind": "const";
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "stablecoinInput";
                            }
                        ];
                        "program": {
                            "kind": "const";
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ];
                        };
                    };
                },
                {
                    "name": "stablecoinOutputUserAta";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account";
                                "path": "user";
                            },
                            {
                                "kind": "const";
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "stablecoinOutput";
                            }
                        ];
                        "program": {
                            "kind": "const";
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ];
                        };
                    };
                },
                {
                    "name": "tokenProgram";
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                }
            ];
            "args": [
                {
                    "name": "args";
                    "type": {
                        "defined": {
                            "name": "swapArgs";
                        };
                    };
                }
            ];
        },
        {
            "name": "withdrawLiquidity";
            "discriminator": [
                149,
                158,
                33,
                185,
                47,
                243,
                253,
                31
            ];
            "accounts": [
                {
                    "name": "user";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "core";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    99,
                                    111,
                                    114,
                                    101
                                ];
                            }
                        ];
                    };
                },
                {
                    "name": "pool";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    98,
                                    105,
                                    110,
                                    97,
                                    114,
                                    121,
                                    95,
                                    112,
                                    111,
                                    111,
                                    108
                                ];
                            },
                            {
                                "kind": "arg";
                                "path": "args.pool_id";
                            }
                        ];
                    };
                },
                {
                    "name": "lpToken";
                    "writable": true;
                },
                {
                    "name": "lpTokenUserAta";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account";
                                "path": "user";
                            },
                            {
                                "kind": "const";
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "lpToken";
                            }
                        ];
                        "program": {
                            "kind": "const";
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ];
                        };
                    };
                },
                {
                    "name": "tokenProgram";
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                }
            ];
            "args": [
                {
                    "name": "args";
                    "type": {
                        "defined": {
                            "name": "withdrawLiquidityArgs";
                        };
                    };
                }
            ];
        }
    ];
    "accounts": [
        {
            "name": "core";
            "discriminator": [
                90,
                167,
                99,
                154,
                192,
                227,
                13,
                62
            ];
        },
        {
            "name": "pool";
            "discriminator": [
                241,
                154,
                109,
                4,
                17,
                177,
                109,
                188
            ];
        }
    ];
    "errors": [
        {
            "code": 6000;
            "name": "invalidCallbackError";
            "msg": "invalidCallbackError";
        },
        {
            "code": 6001;
            "name": "stablecoinNotSupported";
            "msg": "stablecoinNotSupported";
        },
        {
            "code": 6002;
            "name": "stablecoinAlreadySupported";
            "msg": "stablecoinAlreadySupported";
        },
        {
            "code": 6003;
            "name": "frozen";
            "msg": "frozen";
        },
        {
            "code": 6004;
            "name": "invalidOracle";
            "msg": "invalidOracle";
        },
        {
            "code": 6005;
            "name": "duplicatedMints";
            "msg": "duplicatedMints";
        },
        {
            "code": 6006;
            "name": "notEnoughTokens";
            "msg": "notEnoughTokens";
        },
        {
            "code": 6007;
            "name": "castFailed";
            "msg": "castFailed";
        },
        {
            "code": 6008;
            "name": "mathOverflow";
            "msg": "mathOverflow";
        },
        {
            "code": 6009;
            "name": "invariantPrecisionNotFound";
            "msg": "invariantPrecisionNotFound";
        },
        {
            "code": 6010;
            "name": "divisionByZero";
            "msg": "divisionByZero";
        },
        {
            "code": 6011;
            "name": "poolTokensCountOutOfBound";
            "msg": "poolTokensCountOutOfBound";
        },
        {
            "code": 6012;
            "name": "invalidInputLength";
            "msg": "invalidInputLength";
        },
        {
            "code": 6013;
            "name": "amplificationCoefficientOutOfBound";
            "msg": "amplificationCoefficientOutOfBound";
        },
        {
            "code": 6014;
            "name": "lpTokenPreMinted";
            "msg": "lpTokenPreMinted";
        },
        {
            "code": 6015;
            "name": "invalidMintAuthority";
            "msg": "invalidMintAuthority";
        },
        {
            "code": 6016;
            "name": "invalidFreezeAuthority";
            "msg": "invalidFreezeAuthority";
        },
        {
            "code": 6017;
            "name": "lpTokenNotInitialized";
            "msg": "lpTokenNotInitialized";
        },
        {
            "code": 6018;
            "name": "invalidRemainingAccountsSchema";
            "msg": "invalidRemainingAccountsSchema";
        },
        {
            "code": 6019;
            "name": "invalidTokenAccountOwner";
            "msg": "invalidTokenAccountOwner";
        },
        {
            "code": 6020;
            "name": "invalidTokenAccountMint";
            "msg": "invalidTokenAccountMint";
        },
        {
            "code": 6021;
            "name": "invalidVault";
            "msg": "invalidVault";
        },
        {
            "code": 6022;
            "name": "invalidTokenAccount";
            "msg": "invalidTokenAccount";
        },
        {
            "code": 6023;
            "name": "ataNotInitialized";
            "msg": "ataNotInitialized";
        },
        {
            "code": 6024;
            "name": "notEnoughFunds";
            "msg": "notEnoughFunds";
        },
        {
            "code": 6025;
            "name": "invalidInput";
            "msg": "invalidInput";
        },
        {
            "code": 6026;
            "name": "poolIdMismatch";
            "msg": "poolIdMismatch";
        },
        {
            "code": 6027;
            "name": "poolFrozen";
            "msg": "poolFrozen";
        },
        {
            "code": 6028;
            "name": "notEnoughLiquidity";
            "msg": "notEnoughLiquidity";
        },
        {
            "code": 6029;
            "name": "protocolFrozen";
            "msg": "protocolFrozen";
        },
        {
            "code": 6030;
            "name": "slippageExceeded";
            "msg": "slippageExceeded";
        },
        {
            "code": 6031;
            "name": "superadminMismatch";
            "msg": "invalidSuperadmin";
        },
        {
            "code": 6032;
            "name": "stablecoinWithdrawOnly";
            "msg": "stablecoinWithdrawOnly";
        },
        {
            "code": 6033;
            "name": "insufficientBalanceForWithdrawal";
            "msg": "insufficientBalanceForWithdrawal";
        },
        {
            "code": 6034;
            "name": "zeroBalance";
            "msg": "zeroBalance";
        },
        {
            "code": 6035;
            "name": "zeroInitialDeposit";
            "msg": "zeroInitialDeposit";
        }
    ];
    "types": [
        {
            "name": "addLiquidityArgs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "poolId";
                        "type": "u64";
                    },
                    {
                        "name": "deposits";
                        "type": {
                            "vec": "u64";
                        };
                    }
                ];
            };
        },
        {
            "name": "core";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "nextPoolId";
                        "type": "u64";
                    },
                    {
                        "name": "superadmin";
                        "type": "pubkey";
                    },
                    {
                        "name": "platformFeeBps";
                        "type": "u64";
                    },
                    {
                        "name": "supportedStablecoins";
                        "type": {
                            "vec": "pubkey";
                        };
                    },
                    {
                        "name": "withdrawOnlyStablecoins";
                        "type": {
                            "vec": "pubkey";
                        };
                    },
                    {
                        "name": "isFrozen";
                        "type": "bool";
                    }
                ];
            };
        },
        {
            "name": "exactIn";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "minimumReceived";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "exactOut";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "maximumTaken";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "fees";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "swapFeeBps";
                        "type": "u64";
                    },
                    {
                        "name": "liquidityRemovalFeeBps";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "getVirtualPriceArgs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "poolId";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "initializeCoreArgs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "platformFeeBps";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "initializePoolArgs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amp";
                        "type": "u64";
                    },
                    {
                        "name": "nTokens";
                        "type": "u64";
                    },
                    {
                        "name": "deposits";
                        "type": {
                            "vec": "u64";
                        };
                    },
                    {
                        "name": "fees";
                        "type": {
                            "defined": {
                                "name": "fees";
                            };
                        };
                    }
                ];
            };
        },
        {
            "name": "pool";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "index";
                        "type": "u64";
                    },
                    {
                        "name": "bump";
                        "type": "u8";
                    },
                    {
                        "name": "admin";
                        "type": "pubkey";
                    },
                    {
                        "name": "stablecoins";
                        "type": {
                            "vec": "pubkey";
                        };
                    },
                    {
                        "name": "isFrozen";
                        "type": "bool";
                    },
                    {
                        "name": "lpToken";
                        "type": "pubkey";
                    },
                    {
                        "name": "swap";
                        "type": {
                            "defined": {
                                "name": "stableSwap";
                            };
                        };
                    },
                    {
                        "name": "fees";
                        "type": {
                            "defined": {
                                "name": "fees";
                            };
                        };
                    },
                    {
                        "name": "tokenMode";
                        "type": {
                            "defined": {
                                "name": "tokenMode";
                            };
                        };
                    }
                ];
            };
        },
        {
            "name": "stableSwap";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amp";
                        "type": "u64";
                    },
                    {
                        "name": "nTokens";
                        "type": "u64";
                    },
                    {
                        "name": "mode";
                        "type": {
                            "defined": {
                                "name": "stableSwapMode";
                            };
                        };
                    }
                ];
            };
        },
        {
            "name": "stableSwapMode";
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "binary";
                    },
                    {
                        "name": "multi";
                    }
                ];
            };
        },
        {
            "name": "swapArgs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "poolId";
                        "type": "u64";
                    },
                    {
                        "name": "fromId";
                        "type": "u8";
                    },
                    {
                        "name": "toId";
                        "type": "u8";
                    },
                    {
                        "name": "amount";
                        "type": "u64";
                    },
                    {
                        "name": "mode";
                        "type": {
                            "defined": {
                                "name": "swapMode";
                            };
                        };
                    }
                ];
            };
        },
        {
            "name": "swapMode";
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "exactIn";
                        "fields": [
                            {
                                "defined": {
                                    "name": "exactIn";
                                };
                            }
                        ];
                    },
                    {
                        "name": "exactOut";
                        "fields": [
                            {
                                "defined": {
                                    "name": "exactOut";
                                };
                            }
                        ];
                    }
                ];
            };
        },
        {
            "name": "tokenMode";
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "spl";
                    },
                    {
                        "name": "compressed";
                    }
                ];
            };
        },
        {
            "name": "withdrawLiquidityArgs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "poolId";
                        "type": "u64";
                    },
                    {
                        "name": "lpTokenBurn";
                        "type": "u64";
                    }
                ];
            };
        }
    ];
    "constants": [
        {
            "name": "binaryPoolSeed";
            "type": "string";
            "value": "\"binary_pool\"";
        },
        {
            "name": "coreSeed";
            "type": "string";
            "value": "\"core\"";
        },
        {
            "name": "vaultSeed";
            "type": "string";
            "value": "\"vault\"";
        }
    ];
};
