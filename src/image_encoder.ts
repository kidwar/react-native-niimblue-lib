import { Utils } from ".";

/** @category Image encoder */
export type ImageRow = {
  dataType: "void" | "pixels" | "check";
  rowNumber: number;
  repeat: number;
  blackPixelsCount: number;
  rowData?: Uint8Array;
};

/** @category Image encoder */
export type EncodedImage = {
  cols: number;
  rows: number;
  rowsData: ImageRow[];
};

/** @category Image encoder */
export type PrintDirection = "left" | "top";

/**
 * @category Helpers
 * @category Image encoder
 */
export class ImageEncoder {
  /** printDirection = "left" rotates image for 90 degrees clockwise */

  /**
   * @param data Pixels encoded by {@link encodeCanvas} (byte is 8 pixels)
   * @returns Array of indexes where every index stored in two bytes (big endian)
   */
  public static indexPixels(data: Uint8Array): Uint8Array {
    const result: number[] = [];

    for (let bytePos = 0; bytePos < data.byteLength; bytePos++) {
      const b: number = data[bytePos];
      for (let bitPos = 0; bitPos < 8; bitPos++) {
        // iterate from most significant bit of byte
        if (b & (1 << (7 - bitPos))) {
          result.push(...Utils.u16ToBytes(bytePos * 8 + bitPos));
        }
      }
    }

    return new Uint8Array(result);
  }
}
