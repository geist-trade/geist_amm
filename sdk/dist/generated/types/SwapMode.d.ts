/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
import * as beet from '@metaplex-foundation/beet';
import { ExactIn } from './ExactIn';
import { ExactOut } from './ExactOut';
/**
 * This type is used to derive the {@link SwapMode} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link SwapMode} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type SwapModeRecord = {
    ExactIn: {
        fields: [ExactIn];
    };
    ExactOut: {
        fields: [ExactOut];
    };
};
/**
 * Union type respresenting the SwapMode data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isSwapMode*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type SwapMode = beet.DataEnumKeyAsKind<SwapModeRecord>;
export declare const isSwapModeExactIn: (x: SwapMode) => x is SwapMode & {
    __kind: "ExactIn";
};
export declare const isSwapModeExactOut: (x: SwapMode) => x is SwapMode & {
    __kind: "ExactOut";
};
/**
 * @category userTypes
 * @category generated
 */
export declare const swapModeBeet: beet.FixableBeet<SwapMode, SwapMode>;
