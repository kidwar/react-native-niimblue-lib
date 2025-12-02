/**
 * Convert 12 or 13 digit numbers to EAN13 barcode
 * @param data string of 12 or 13 digits
 * @returns string of EAN13 barcode, it is an array of 95 characters, each character is either 0 or 1, representing a white or black stripe, respectively.
 */
export declare function ean13(data: string): {
    text: string;
    bandcode: string;
};
/**
 * Converts a string to Code128B barcode
 * @param data string to convert
 * @returns string of Code128B barcode, it is a sequence of 0 and 1, representing a white or black stripe, respectively.
 */
export declare function code128b(data: string): string;
