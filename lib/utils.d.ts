export interface PixelCountResult {
    total: number;
    parts: [number, number, number];
}
/**
 * Utility class for various common operations.
 * @category Helpers
 */
export declare class Utils {
    /**
     * Converts a given number to its hexadecimal representation.
     */
    static numberToHex(n: number): string;
    /**
     * Converts a DataView, Uint8Array, or number array to a hexadecimal string with byte separator.
     */
    static bufToHex(buf: DataView | Uint8Array | number[], separator?: string): string;
    /**
     * Converts a hexadecimal string to a Uint8Array.
     */
    static hexToBuf(hex: string): Uint8Array;
    /**
     * Converts a base64 string to a Uint8Array.
     */
    static bufFromBase64(str: string): Uint8Array;
    /**
     * Converts a Uint8Array to a base64 string.
     */
    static bufToBase64(buf: Uint8Array): string;
    /**
     * Converts a DataView object to an array of numbers.
     */
    static dataViewToNumberArray(dw: DataView): number[];
    /**
     * Converts a DataView object to a Uint8Array
     */
    static dataViewToU8Array(dw: DataView): Uint8Array;
    /**
     * Converts a Uint8Array to a string using TextDecoder.
     */
    static u8ArrayToString(arr: Uint8Array): string;
    /**
     * Count `non-zero` bits in the byte array.
     *
     * For `split` mode:
     *
     * Data splitted to the three chunks (last chunk sizes can be lesser, base chunk size is `printhead size / 8 / 3`)
     * and `non-zero` bit count calculated from each chunk.
     *
     * If data size is more than `printheadPixels / 8`, only `total` mode can be used.
     *
     * For `total` mode:
     *
     * Return total number of pixel in little-endian format: `[0, LL, HH]`
     *
     * For `auto` mode:
     *
     * By default `split` mode used. If it is not available, `total` mode used.
     *
     **/
    static countPixelsForBitmapPacket(buf: Uint8Array, printheadPixels: number, mode?: "auto" | "split" | "total"): PixelCountResult;
    /**
     * Converts a 16-bit unsigned integer to an array of two bytes (big endian).
     */
    static u16ToBytes(n: number): [number, number];
    /**
     * Converts a 32-bit unsigned integer to an array of two bytes (big endian).
     */
    static u32ToBytes(n: number): [number, number, number, number];
    /**
     * Converts a Uint8Array of length 2 to a 16-bit signed integer (big endian).
     */
    static bytesToI16(arr: Uint8Array): number;
    /**
     * Converts a Uint8Array of length 2 to a 16-bit signed integer (big endian).
     */
    static bytesToI32(arr: Uint8Array): number;
    /**
     * Compares two Uint8Arrays to check if they are equal.
     */
    static u8ArraysEqual(a: Uint8Array, b: Uint8Array): boolean;
    static u8ArrayAppend(src: Uint8Array, data: Uint8Array): Uint8Array;
    /**
     * Asynchronously pauses the execution for the specified amount of time.
     */
    static sleep(ms: number): Promise<void>;
    /** Find check array has subarray at index */
    static hasSubarrayAtPos<T>(arr: ArrayLike<T>, sub: ArrayLike<T>, pos: number): boolean;
}
/**
 * Utility class for validating objects.
 * @category Helpers
 */
export declare class Validators {
    /**
     * Compares two Uint8Arrays for equality and throws an error if they are not equal.
     */
    static u8ArraysEqual(arr: Uint8Array, b: Uint8Array, message?: string): void;
    /**
     * Checks if the length of a Uint8Array equals a specified length and throws an error if the lengths do not match.
     */
    static u8ArrayLengthEquals(arr: Uint8Array, len: number, message?: string): void;
    /**
     * Checks if the length of a Uint8Array is at least a specified length.
     * Throws an error if the length is less than the specified length.
     */
    static u8ArrayLengthAtLeast(arr: Uint8Array, len: number, message?: string): void;
}
