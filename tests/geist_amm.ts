import * as anchor from "@coral-xyz/anchor";
import {BN, Program} from "@coral-xyz/anchor";
import {GeistAmm} from "../target/types/geist_amm";
import {LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction} from "@solana/web3.js";
import {BinaryPool, Core, StableSwapMode} from "../sdk";
import {assert, expect} from "chai";
import createToken from "./helpers/createToken";
import {
    AuthorityType,
    createAssociatedTokenAccountInstruction, getAccount,
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import mintTokens from "./helpers/mintTokens";
import transferAuthority from "./helpers/transferAuthority";
import checkLPTokens from "./stable_swap/checkLPTokens";
import calculateLPTokens from "./stable_swap/calculateLPTokens";

describe("geist_amm", () => {
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
            .initializeCore(
                new BN(0),
                new BN(0)
            )
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
            swapFeeBps,
            totalPools,
            withdrawFeeBps,
            withdrawOnlyStablecoins
        } = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        expect(superadmin.toString()).eq(provider.publicKey.toString());
        expect(nextPoolId.toString()).eq("0");
        expect(isFrozen).eq(false);
        expect(supportedStablecoins.length).eq(0);
        expect(swapFeeBps.toString()).eq("0");
        expect(totalPools.toString()).eq("0");
        expect(withdrawFeeBps.toString()).eq("0");
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
                swapFeeBps,
                totalPools,
                withdrawFeeBps,
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

    it("Sets half of the stablecoins in withdraw-only mode.", async () => {
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

    it('Initializes binary pool.', async () => {
        let coreData = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        const [binaryPool] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("binary_pool"),
                (new BN(coreData.nextPoolId)).toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );

        let lpToken = await createToken(
            provider.connection,
            provider
        );

        let stablecoinA = coreData.supportedStablecoins[0];
        let stablecoinB = coreData.supportedStablecoins[1];

        await mintTokens(
            stablecoinA,
            provider,
            100_000 * LAMPORTS_PER_SOL
        );

        await mintTokens(
            stablecoinB,
            provider,
            100_000 * LAMPORTS_PER_SOL
        );

        await transferAuthority(
            lpToken,
            provider,
            AuthorityType.MintTokens,
            binaryPool
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

        const stablecoinBAdminAta = getAssociatedTokenAddressSync(
            stablecoinB,
            provider.publicKey
        );

        const stablecoinAAdminAta = getAssociatedTokenAddressSync(
            stablecoinA,
            provider.publicKey
        );

        const [stablecoinAVault] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("vault"),
                binaryPool.toBuffer(),
                stablecoinA.toBuffer()
            ],
            program.programId
        );

        const [stablecoinBVault] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("vault"),
                binaryPool.toBuffer(),
                stablecoinB.toBuffer()
            ],
            program.programId
        );

        const lpTokenAtaIx = createAssociatedTokenAccountInstruction(
            provider.publicKey,
            lpTokenUserAta,
            provider.publicKey,
            lpToken
        );

        const ix = await program
            .methods
            .initializeBinaryPool(
                new BN(500_000),
                new BN(80_000 * LAMPORTS_PER_SOL),
                new BN(80_000 * LAMPORTS_PER_SOL),
                {
                    swapFeeBps: new BN(50), // 50 bps = 0.5%
                    liquidityProvisionFeeBps: new BN(0), // 50 bps = 0.5%
                    liquidityRemovalFeeBps: new BN(0), // 50 bps = 0.5%
                }
            )
            .accounts({
                core,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                admin: provider.publicKey,
                binaryPool,
                lpToken,
                stablecoinB,
                stablecoinA,
                lpTokenUserAta,
                stablecoinBAdminAta,
                stablecoinAAdminAta,
                stablecoinAVault,
                stablecoinBVault
            })
            .instruction();

        const transaction = new Transaction();
        transaction.add(
            lpTokenAtaIx,
            ix
        );

        const {
            lastValidBlockHeight,
            blockhash
        } = await provider.connection.getLatestBlockhash();

        transaction.feePayer = provider.publicKey;
        transaction.recentBlockhash = blockhash;

        const signed = await provider.wallet.signTransaction(transaction);
        const txid = await provider.connection.sendRawTransaction(
            signed.serialize(),
            { skipPreflight: false }
        );
        await provider.connection.confirmTransaction({
            lastValidBlockHeight,
            blockhash,
            signature: txid
        }, "confirmed");

        coreData = await Core.fromAccountAddress(
            provider.connection,
            core
        );

        expect(coreData.totalPools.toString()).eq("1");
        expect(coreData.nextPoolId.toString()).eq("1");

        const userLpTokenAccountData = await getAccount(
            provider.connection,
            lpTokenUserAta
        );

        let lpTokensShouldReceive = calculateLPTokens(
            [
                new BN(80_000 * LAMPORTS_PER_SOL),
                new BN(80_000 * LAMPORTS_PER_SOL),
            ],
            {
                amplificationCoefficient: new BN(500_000),
                reserves: [
                    new BN(0),
                    new BN(0)
                ],
                totalSupply: new BN(0)
            }
        );

        expect(lpTokensShouldReceive.toString()).eq(userLpTokenAccountData.amount.toString());

        const userStablecoinATokenAccountData = await getAccount(
            provider.connection,
            stablecoinAAdminAta
        );

        expect(userStablecoinATokenAccountData.amount.toString())
            .eq(`${ 20000 * LAMPORTS_PER_SOL }`);

        const userStablecoinBTokenAccountData = await getAccount(
            provider.connection,
            stablecoinBAdminAta
        );

        expect(userStablecoinBTokenAccountData.amount.toString())
            .eq(`${ 20000 * LAMPORTS_PER_SOL }`);

        const binaryPoolData = await BinaryPool.fromAccountAddress(
            provider.connection,
            binaryPool
        );

        expect(binaryPoolData.admin.toString()).eq(provider.publicKey.toString());
        expect(binaryPoolData.lpToken.toString()).eq(lpToken.toString());
        expect(binaryPoolData.index.toString()).eq("0");
        expect(binaryPoolData.isFrozen).eq(false);
        expect(binaryPoolData.amp.toString()).eq("500000");
        expect(binaryPoolData.swap.amp.toString()).eq("500000");
        expect(binaryPoolData.swap.mode).eq(StableSwapMode.BINARY);
        expect(binaryPoolData.swap.nTokens.toString()).eq("2");
    });
});
