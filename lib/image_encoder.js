"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageEncoder = void 0;
const _1 = require(".");
/**
 * @category Helpers
 * @category Image encoder
 */
class ImageEncoder {
    /** printDirection = "left" rotates image for 90 degrees clockwise */
    /**
     * @param data Pixels encoded by {@link encodeCanvas} (byte is 8 pixels)
     * @returns Array of indexes where every index stored in two bytes (big endian)
     */
    static indexPixels(data) {
        const result = [];
        for (let bytePos = 0; bytePos < data.byteLength; bytePos++) {
            const b = data[bytePos];
            for (let bitPos = 0; bitPos < 8; bitPos++) {
                // iterate from most significant bit of byte
                if (b & (1 << (7 - bitPos))) {
                    result.push(..._1.Utils.u16ToBytes(bytePos * 8 + bitPos));
                }
            }
        }
        return new Uint8Array(result);
    }
}
exports.ImageEncoder = ImageEncoder;
