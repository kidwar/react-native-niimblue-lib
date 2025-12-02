"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validators = exports.Utils = void 0;
const buffer_1 = require("buffer");
/**
 * Utility class for various common operations.
 * @category Helpers
 */
class Utils {
    /**
     * Converts a given number to its hexadecimal representation.
     */
    static numberToHex(n) {
        const hex = n.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }
    /**
     * Converts a DataView, Uint8Array, or number array to a hexadecimal string with byte separator.
     */
    static bufToHex(buf, separator = " ") {
        const arr = buf instanceof DataView ? this.dataViewToNumberArray(buf) : Array.from(buf);
        return arr.map((n) => Utils.numberToHex(n)).join(separator);
    }
    /**
     * Converts a hexadecimal string to a Uint8Array.
     */
    static hexToBuf(hex) {
        const cleanHex = hex.replace(/\s+/g, '');
        const bytes = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes.push(parseInt(cleanHex.substr(i, 2), 16));
        }
        return new Uint8Array(bytes);
    }
    /**
     * Converts a base64 string to a Uint8Array.
     */
    static bufFromBase64(str) {
        // React Native doesn't have atob, use Buffer
        return buffer_1.Buffer.from(str, 'base64');
    }
    /**
     * Converts a Uint8Array to a base64 string.
     */
    static bufToBase64(buf) {
        // React Native doesn't have btoa, use Buffer
        return buffer_1.Buffer.from(buf).toString('base64');
    }
    /**
     * Converts a DataView object to an array of numbers.
     */
    static dataViewToNumberArray(dw) {
        const a = [];
        for (let i = 0; i < dw.byteLength; i++) {
            a.push(dw.getUint8(i));
        }
        return a;
    }
    /**
     * Converts a DataView object to a Uint8Array
     */
    static dataViewToU8Array(dw) {
        return Uint8Array.from(this.dataViewToNumberArray(dw));
    }
    /**
     * Converts a Uint8Array to a string using TextDecoder.
     */
    static u8ArrayToString(arr) {
        return buffer_1.Buffer.from(arr).toString('utf8');
    }
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
    static countPixelsForBitmapPacket(buf, printheadPixels, mode = "auto") {
        let total = 0;
        const parts = [0, 0, 0];
        const chunkSize = Math.floor(printheadPixels / 8 / 3); // Every byte can store 8 pixels
        let split = buf.byteLength <= chunkSize * 3; // Is data fits to the three chunks
        if (mode === "total") {
            split = false;
        }
        else if (mode === "split") {
            if (buf.byteLength > chunkSize * 3) {
                console.warn(`Can't use split mode: buffer size (${buf.byteLength}) is large than chunk size * 3 (${chunkSize * 3}), ` +
                    "maybe printheadPixels is set incorrectly");
            }
            else {
                split = true;
            }
        }
        buf.forEach((value, byteN) => {
            const chunkIdx = Math.floor(byteN / chunkSize);
            for (let bitN = 0; bitN < 8; bitN++) {
                // is black
                if ((value & (1 << bitN)) !== 0) {
                    total++;
                    if (!split) {
                        continue;
                    }
                    if (chunkIdx > 2) {
                        console.warn(`Overflow (chunk index ${chunkIdx})`);
                        continue;
                    }
                    parts[chunkIdx]++;
                    if (parts[chunkIdx] > 255) {
                        console.warn("Pixel count overflow");
                    }
                }
            }
        });
        if (split) {
            return { total, parts };
        }
        const [c, b] = this.u16ToBytes(total);
        return { total, parts: [0, b, c] };
    }
    /**
     * Converts a 16-bit unsigned integer to an array of two bytes (big endian).
     */
    static u16ToBytes(n) {
        const h = (n >> 8) & 0xff;
        const l = n % 256 & 0xff;
        return [h, l];
    }
    /**
     * Converts a 32-bit unsigned integer to an array of two bytes (big endian).
     */
    static u32ToBytes(n) {
        return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
    }
    /**
     * Converts a Uint8Array of length 2 to a 16-bit signed integer (big endian).
     */
    static bytesToI16(arr) {
        Validators.u8ArrayLengthEquals(arr, 2);
        return new DataView(arr.buffer).getInt16(0, false);
    }
    /**
     * Converts a Uint8Array of length 2 to a 16-bit signed integer (big endian).
     */
    static bytesToI32(arr) {
        Validators.u8ArrayLengthEquals(arr, 4);
        return new DataView(arr.buffer).getInt32(0, false);
    }
    /**
     * Compares two Uint8Arrays to check if they are equal.
     */
    static u8ArraysEqual(a, b) {
        return a.length === b.length && a.every((el, i) => el === b[i]);
    }
    static u8ArrayAppend(src, data) {
        const newBuf = new Uint8Array(src.length + data.length);
        newBuf.set(src, 0);
        newBuf.set(data, src.length);
        return newBuf;
    }
    /**
     * Asynchronously pauses the execution for the specified amount of time.
     */
    static sleep(ms) {
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
    }
    /** Find check array has subarray at index */
    static hasSubarrayAtPos(arr, sub, pos) {
        if (pos > arr.length - sub.length) {
            return false;
        }
        for (let i = 0; i < sub.length; i++) {
            if (arr[pos + i] !== sub[i]) {
                return false;
            }
        }
        return true;
    }
}
exports.Utils = Utils;
/**
 * Utility class for validating objects.
 * @category Helpers
 */
class Validators {
    /**
     * Compares two Uint8Arrays for equality and throws an error if they are not equal.
     */
    static u8ArraysEqual(arr, b, message) {
        if (!Utils.u8ArraysEqual(arr, b)) {
            throw new Error(message ?? "Arrays must be equal");
        }
    }
    /**
     * Checks if the length of a Uint8Array equals a specified length and throws an error if the lengths do not match.
     */
    static u8ArrayLengthEquals(arr, len, message) {
        if (arr.length !== len) {
            throw new Error(message ?? `Array length must be ${len}`);
        }
    }
    /**
     * Checks if the length of a Uint8Array is at least a specified length.
     * Throws an error if the length is less than the specified length.
     */
    static u8ArrayLengthAtLeast(arr, len, message) {
        if (arr.length < len) {
            throw new Error(message ?? `Array length must be at least ${len}`);
        }
    }
}
exports.Validators = Validators;
