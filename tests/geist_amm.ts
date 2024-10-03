import * as anchor from "@coral-xyz/anchor";
import {BN, Program} from "@coral-xyz/anchor";
import {GeistAmm} from "../target/types/geist_amm";
import {
    AccountMeta,
    Keypair,
    LAMPORTS_PER_SOL, MessageV0,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction, TransactionInstruction,
    TransactionMessage, VersionedTransaction
} from "@solana/web3.js";
import {BinaryPool, Core, coreBeet, Pool, StableSwapMode} from "../sdk";
import {assert, expect} from "chai";
import createToken from "./helpers/createToken";
import {
    AuthorityType, createAccount,
    createAssociatedTokenAccountInstruction, createInitializeAccountInstruction, getAccount,
    getAssociatedTokenAddressSync, getMint, MINT_SIZE,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import mintTokens from "./helpers/mintTokens";
import transferAuthority from "./helpers/transferAuthority";
import checkLPTokens from "./stable_swap/checkLPTokens";
import calculateLPTokens from "./stable_swap/calculateLPTokens";
import createLookupTables from "./helpers/createLookupTables";
import sleep from "./helpers/sleep";
import signAndSendTransaction from "./helpers/signAndSendTransaction";
import requestComputeUnits from "./helpers/requestComputeUnits";
import parseBn from "./helpers/parseBn";
import {calculateLPTokensMulti} from "./stable_swap/calculateLPTokensMulti";
import {getExactOutSwapPrice} from "./stable_swap/getSwapPrice";

describe("Basic Tests", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);

    const program = anchor.workspace.GeistAmm as Program<GeistAmm>;

    const [core] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("core")
        ],
        program.programId
    );

    it("Initializes core Geist AMM settings.", async () => {
        await program
            .methods
            .initializeCore({
                platformFeeBps: new BN(0)
            })
            .accounts({
                core,
                superadmin: provider.publicKey,
                systemProgram: SystemProgram.programId
            })
            .rpc();

        const {
            superadmin,
            nextPoolId,
            isFrozen,
            supportedStablecoins,
            platformFeeBps,
            withdrawOnlyStablecoins
        } = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        expect(superadmin.toString()).eq(provider.publicKey.toString());
        expect(nextPoolId.toString()).eq("0");
        expect(isFrozen).eq(false);
        expect(supportedStablecoins.length).eq(0);
        expect(platformFeeBps.toString()).eq("0");
        expect(withdrawOnlyStablecoins.length).eq(0);
    });

    it("Adds support for multiple stablecoins and correctly resizes the account.", async () => {
        let initialSize = (await provider.connection.getAccountInfo(core)).data.byteLength;

        for (let i = 0; i < 10; i++) {
            const stablecoin = await createToken(
                provider.connection,
                provider
            );

            await program
                .methods
                .addStablecoin()
                .accounts({
                    core,
                    superadmin: provider.publicKey,
                    stablecoin,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY
                })
                .rpc();

            const {
                superadmin,
                nextPoolId,
                isFrozen,
                supportedStablecoins,
                platformFeeBps,
                withdrawOnlyStablecoins
            } = await Core.fromAccountAddress(
                provider.connection,
                core
            );

            const currentSize = (await provider.connection.getAccountInfo(core)).data.byteLength;

            expect(currentSize == initialSize + (i + 1) * 32);
            expect(supportedStablecoins.length).eq(i + 1);
            assert(supportedStablecoins.map(s => s.toString()).includes(stablecoin.toString()));
        }
    });

    it("Sets some stablecoins in withdraw-only mode.", async () => {
        let coreData = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        for (let stablecoin of coreData.supportedStablecoins.slice(0, 5)) {
            await program
                .methods
                .disableStablecoin()
                .accounts({
                    core,
                    superadmin: provider.publicKey,
                    stablecoin
                })
                .rpc();
        }

        let newCoreData = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        expect(newCoreData.supportedStablecoins.length).eq(5);
        expect(newCoreData.withdrawOnlyStablecoins.length).eq(coreData.supportedStablecoins.length / 2);
    });

    it('Initializes pool', async () => {

        const coreData = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        const [pool] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("binary_pool"),
                new BN(coreData.nextPoolId).toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );

        const tokens: PublicKey[] = [];
        const remainingAccounts: PublicKey[] = [];

        for (let i = 0; i < 8; i++) {
            let token = await createToken(
                provider.connection,
                provider
            );

            await program
                .methods
                .addStablecoin()
                .accounts({
                    core,
                    superadmin: provider.publicKey,
                    stablecoin: token,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY
                })
                .rpc();

            await mintTokens(
                token,
                provider,
                100_000 * LAMPORTS_PER_SOL
            );

            tokens.push(token);
            remainingAccounts.push(token);

            const seeds =  [
                    Buffer.from("vault"),
                    pool.toBuffer(),
                    token.toBuffer()
            ];

            const [vault] = PublicKey.findProgramAddressSync(
                seeds,
                program.programId
            );
            remainingAccounts.push(vault);

            const ata = getAssociatedTokenAddressSync(
                token,
                provider.publicKey
            );

            remainingAccounts.push(ata);
        }

        let lpToken = await createToken(
            provider.connection,
            provider
        );

        await transferAuthority(
            lpToken,
            provider,
            AuthorityType.MintTokens,
            pool
        );

        await transferAuthority(
            lpToken,
            provider,
            AuthorityType.FreezeAccount,
            null
        );

        const lpTokenUserAta = getAssociatedTokenAddressSync(
            lpToken,
            provider.publicKey
        );

        const lpTokenAtaIx = createAssociatedTokenAccountInstruction(
            provider.publicKey,
            lpTokenUserAta,
            provider.publicKey,
            lpToken
        );

        // const deposits = Array(8).fill(0).map(_ => new BN(Math.floor(Math.random() * 50_000) * LAMPORTS_PER_SOL));
        const deposits = Array(8).fill(0).map(_ => new BN(Math.floor(50_000) * LAMPORTS_PER_SOL));

        const ix = await program
            .methods
            .initializePool({
                amp: new BN(500_000),
                nTokens: new BN(8),
                // Deposit at least 1 token.
                deposits,
                fees: {
                    swapFeeBps: new BN(15 / 1000 * 10_000), // 1.5%
                    liquidityRemovalFeeBps: new BN(1 / 1_000 * 10_000) // 0.1%
                }
            })
            .accounts({
                core,
                lpToken,
                admin: provider.publicKey,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                pool,
                lpTokenAdminAta: lpTokenUserAta
            })
            .remainingAccounts(remainingAccounts.map(acc => {
                return {
                    pubkey: acc,
                    isSigner: false,
                    isWritable: true
                }
            }))
            .instruction();

        const lookupTable = await createLookupTables(
            provider,
            [
                // Accounts that are always used
                core,
                TOKEN_PROGRAM_ID,
                SystemProgram.programId,
                // Accounts that are specific to transaction
                // We can derive first 253 pools and put them into lookup table,
                // so first 253 pools don't need to create new lookup tables.
                pool,
                ...remainingAccounts
            ]
        );

        await sleep(5);
        const lookupTableData = await provider.connection.getAddressLookupTable(lookupTable);

        const {
            lastValidBlockHeight,
            blockhash
        } = await provider.connection.getLatestBlockhash();

        // This initalizes actual LP.
        const message = new TransactionMessage({
            payerKey: provider.publicKey,
            recentBlockhash: blockhash,
            instructions: [lpTokenAtaIx, ix]
        }).compileToV0Message([lookupTableData.value]);

        await signAndSendTransaction(message, provider);

        let postTxCoreData = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        const lpTokensShouldReceive = calculateLPTokensMulti(
            Array(8).fill(0).map(_ => new BN(0)),
            deposits,
            new BN(500_000),
            new BN(0)
        );

        const lpAtaData = await getAccount(
            provider.connection,
            lpTokenUserAta
        );

        expect(
            lpTokensShouldReceive.toNumber()
        ).approximately(
            parseInt(lpAtaData.amount.toString()),
            1000
        );

        expect(postTxCoreData.nextPoolId.toString()).eq("1");
    });

    it('Adds liquidity to multi pool.', async () => {
        const preCoreData = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        const [pool] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("binary_pool"),
                new BN(0).toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );

        const prepoolData = await Pool.fromAccountAddress(
            provider.connection,
            pool
        );

        const {
            lpToken,
            stablecoins
        } = await Pool.fromAccountAddress(
            provider.connection,
            pool
        );

        const preBalances: BN[] = [];
        const atas: PublicKey[] = [];
        const preUserBalances: BN[] = [];

        const remainingAccounts = (await Promise.all(
            stablecoins.map(async (stablecoin, index) => {
                const seeds =  [
                    Buffer.from("vault"),
                    pool.toBuffer(),
                    stablecoin.toBuffer()
                ];

                const [vault] = PublicKey.findProgramAddressSync(
                    seeds,
                    program.programId
                );

                const vaultData = await getAccount(
                    provider.connection,
                    vault
                );

                preBalances[index] = new BN(vaultData.amount.toString());

                const ata = getAssociatedTokenAddressSync(
                    stablecoin,
                    provider.publicKey
                );

                atas[index] = ata;

                const ataData = await getAccount(
                    provider.connection,
                    ata
                );

                preUserBalances[index] = new BN(ataData.amount.toString());

                return [stablecoin, vault, ata];
            })
        )).flat();

        const lpTokenUserAta = getAssociatedTokenAddressSync(
            lpToken,
            provider.publicKey
        );

        const userLpTokenAccountDataPre = await getAccount(
            provider.connection,
            lpTokenUserAta
        );

        const deposits = stablecoins.map(_ => {
            return new BN(Math.floor(1000) * LAMPORTS_PER_SOL);
        });

        let lpTokensData = await getMint(
            provider.connection,
            lpToken
        );

        // Expect updated LP token balance for user
        let lpTokensShouldReceive = calculateLPTokensMulti(
            preBalances,
            deposits,
            new BN(prepoolData.swap.amp),
            new BN(lpTokensData.supply.toString())
        );

        const ix = await program
            .methods
            .addLiquidity({
                poolId: new BN(0),
                deposits
            })
            .accounts({
                core,
                pool: pool,
                lpToken,
                tokenProgram: TOKEN_PROGRAM_ID,
                lpTokenUserAta,
                user: provider.publicKey
            })
            .remainingAccounts(remainingAccounts.map(pubkey => ({
                isWritable: true,
                isSigner: false,
                pubkey
            })))
            .instruction();

        const {
            lastValidBlockHeight,
            blockhash
        } = await provider.connection.getLatestBlockhash();

        const lookupTable = await createLookupTables(
            provider,
            [
                // Accounts that are always used
                core,
                TOKEN_PROGRAM_ID,
                SystemProgram.programId,
                // Accounts that are specific to transaction
                // We can derive first 253 pools and put them into lookup table,
                // so first 253 pools don't need to create new lookup tables.
                pool,
                ...remainingAccounts
            ]
        );

        // Have to sleep, otherwise getting:
        // invalid transaction: Transaction address table lookup uses an invalid index.
        await sleep(5);
        const { value: lookupTableData } = await provider.connection.getAddressLookupTable(lookupTable);

        const message = new TransactionMessage({
            payerKey: provider.publicKey,
            recentBlockhash: blockhash,
            instructions: [ix, requestComputeUnits(2_000_000)]
        }).compileToV0Message([lookupTableData]);

        const txId = await signAndSendTransaction(message, provider);
        const {
            meta: {
                logMessages
            }
        } = await provider.connection.getParsedTransaction(txId, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });

        const postCoreData = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        lpTokensData = await getMint(
            provider.connection,
            lpToken
        );

        const userLpTokenAccountDataPost = await getAccount(
            provider.connection,
            lpTokenUserAta
        );

        expect(
            (new BN(userLpTokenAccountDataPre.amount.toString())).add(lpTokensShouldReceive).toNumber()
        ).approximately(
            parseInt(userLpTokenAccountDataPost.amount.toString()),
            1000 // accept < 0.0000001 LP tokens difference
        );

        for (let i = 0; i < atas.length; i++) {
            const ata = atas[i];

            const postTxAtaData = await getAccount(
                provider.connection,
                ata
            );

            expect(postTxAtaData.amount.toString()).eq(
                preUserBalances[i].sub(deposits[i]).toString()
            );
        }

    });

    it("Performs a simple swap.", async () => {
        const user = Keypair.generate();

        await provider.connection.confirmTransaction({
            signature: await provider.connection.requestAirdrop(
                user.publicKey,
                100 * LAMPORTS_PER_SOL
            ),
            ...(await provider.connection.getLatestBlockhash())
        });

        const poolId = new BN(0);

        const [pool] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("binary_pool"),
                poolId.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );

        const {
            lpToken,
            stablecoins,
            swap,
            fees
        } = await Pool.fromAccountAddress(
            provider.connection,
            pool
        );

        const balances: BN[] = [];
        const stablecoinIn = stablecoins[0];
        const stablecoinOut = stablecoins[2];

        await mintTokens(
            stablecoinIn,
            provider,
            100_000 * LAMPORTS_PER_SOL,
            user.publicKey
        );

        await mintTokens(
            stablecoinOut,
            provider,
            100_000 * LAMPORTS_PER_SOL,
            user.publicKey
        );

        const [stablecoinInputVault] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("vault"),
                pool.toBuffer(),
                stablecoinIn.toBuffer()
            ],
            program.programId
        );

        const [stablecoinOutputVault] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("vault"),
                pool.toBuffer(),
                stablecoinOut.toBuffer()
            ],
            program.programId
        );

        const stablecoinOutputVaultData = await getAccount(
            provider.connection,
            stablecoinOutputVault
        );

        const stablecoinInputUserAta = getAssociatedTokenAddressSync(
            stablecoinIn,
            user.publicKey
        );

        const stablecoinOutputUserAta = getAssociatedTokenAddressSync(
            stablecoinOut,
            user.publicKey
        );

        const remainingAccounts: AccountMeta[] = await Promise.all(stablecoins.map(async (stablecoin) => {
            const [vault] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("vault"),
                    pool.toBuffer(),
                    stablecoin.toBuffer()
                ],
                program.programId
            );

            const vaultData = await getAccount(
                provider.connection,
                vault
            );

            balances.push(new BN(vaultData.amount.toString()));

            return {
                pubkey: vault,
                isSigner: false,
                isWritable: true
            }
        }));

        const stablecoinOutputUserAtaDataPre = await getAccount(
            provider.connection,
            stablecoinOutputUserAta
        );

        const stablecoinInputUserAtaDataPre = await getAccount(
            provider.connection,
            stablecoinInputUserAta
        );

        const outAmount = new BN(6_000 * LAMPORTS_PER_SOL);
        const ix = await program
            .methods
            .swap({
                poolId,
                fromId: 0,
                toId: 2,
                amount: outAmount,
                mode: {
                    exactOut: [{ maximumTaken: new BN(1_000_000 * LAMPORTS_PER_SOL) }]
                }
            })
            .accounts({
                user: user.publicKey,
                core,
                pool,
                stablecoinInput: stablecoinIn,
                stablecoinOutput: stablecoinOut,
                stablecoinInputVault,
                stablecoinOutputVault,
                stablecoinInputUserAta,
                stablecoinOutputUserAta,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .remainingAccounts(remainingAccounts)
            // .preInstructions([requestComputeUnits(500_000)])
            // .signers([user])
            // .rpc();
            .instruction();

        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        const tx = new VersionedTransaction(
            new TransactionMessage({
                payerKey: user.publicKey,
                recentBlockhash: blockhash,
                instructions: [requestComputeUnits(500_000), ix]
            }).compileToV0Message()
        );

        tx.sign([user]);
        const signature = await provider.connection.sendRawTransaction(tx.serialize(), { skipPreflight: true });
        await provider.connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature
        });

        await sleep(10);

        const {
            meta: {
                logMessages
            }
        } = await provider.connection.getParsedTransaction(
            signature,
            { commitment: "confirmed", maxSupportedTransactionVersion: 0 }
        );

        console.log( logMessages );

        const stablecoinOutputUserAtaDataPost = await getAccount(
            provider.connection,
            stablecoinOutputUserAta
        );

        const stablecoinInputUserAtaDataPost = await getAccount(
            provider.connection,
            stablecoinInputUserAta
        );

        const expectedSwap = getExactOutSwapPrice(
            balances,
            0,
            2,
            outAmount,
            new BN(swap.amp)
        );

        const fee = new BN(fees.swapFeeBps.toString())
            .mul(expectedSwap)
            .div(new BN(10_000));

        expect(new BN(stablecoinInputUserAtaDataPre.amount.toString()).sub(new BN(stablecoinInputUserAtaDataPost.amount.toString())).toNumber())
            .approximately(
                fee.add(expectedSwap).toNumber(),
                0.0001 * LAMPORTS_PER_SOL
            );
    });

    it("Removes liquidity from the multi pool.", async () => {
        const poolId = new BN(0);

        const [pool] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("binary_pool"),
                poolId.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );

        const {
            lpToken,
            stablecoins
        } = await Pool.fromAccountAddress(
            provider.connection,
            pool
        );

        const lpTokenUserAta = getAssociatedTokenAddressSync(
            lpToken,
            provider.publicKey,
            false
        );

        const remainingAccounts = (await Promise.all(
            stablecoins.map(async (stablecoin, index) => {
                const seeds =  [
                    Buffer.from("vault"),
                    pool.toBuffer(),
                    stablecoin.toBuffer()
                ];

                const [vault] = PublicKey.findProgramAddressSync(
                    seeds,
                    program.programId
                );

                const vaultData = await getAccount(
                    provider.connection,
                    vault
                );

                // preBalances[index] = new BN(vaultData.amount.toString());

                const ata = getAssociatedTokenAddressSync(
                    stablecoin,
                    provider.publicKey
                );

                // atas[index] = ata;

                const ataData = await getAccount(
                    provider.connection,
                    ata
                );

                // preUserBalances[index] = new BN(ataData.amount.toString());

                return [stablecoin, vault, ata];
            })
        )).flat();

        await program
            .methods
            .withdrawLiquidity({
                poolId,
                lpTokenBurn: new BN(1)
            })
            .accounts({
                user: provider.publicKey,
                core,
                pool,
                lpToken,
                lpTokenUserAta
            })
            .remainingAccounts(remainingAccounts.map((key) => ({
                isWritable: true,
                isSigner: false,
                pubkey: key
            })))
            .rpc();
    });
});
