import { SkTypeface } from '@shopify/react-native-skia';
export interface PrintElementOptions {
    x: number;
    y: number;
    width?: number;
    height?: number;
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
}
export interface TextOptions extends PrintElementOptions {
    fontSize?: number;
    typeface?: SkTypeface;
}
export interface QROptions extends PrintElementOptions {
    ecl?: 'L' | 'M' | 'Q' | 'H';
}
export interface BarcodeOptions extends PrintElementOptions {
    encoding?: 'EAN13' | 'CODE128';
}
export interface LineOptions {
    x: number;
    y: number;
    endX: number;
    endY: number;
    thickness?: number;
}
export interface ImageOptions extends PrintElementOptions {
    data: number[];
    imageWidth: number;
    imageHeight: number;
}
export interface ImageFromBufferOptions extends PrintElementOptions {
    buffer?: Uint8Array;
    threshold?: number;
}
export interface EncodedImage {
    cols: number;
    rows: number;
    rowsData: {
        dataType: 'pixels' | 'void';
        rowNumber: number;
        repeat: number;
        blackPixelsCount: number;
        rowData?: Uint8Array;
    }[];
}
/**
 * PrintPage class to build printable pages with elements like text, QR, barcode, images.
 * Mimics fabric-object from web version.
 */
export declare class PrintPage {
    private pixels;
    readonly width: number;
    readonly height: number;
    constructor(width: number, height: number);
    /**
     * Add text to the page
     * @param text - Text to render
     * @param options - Text rendering options. If typeface is not provided, system default will be used.
     */
    addText(text: string, options: TextOptions): void;
    /**
     * Add QR code to the page
     */
    addQR(text: string, options: QROptions): void;
    /**
     * Add barcode to the page
     */
    addBarcode(text: string, options: BarcodeOptions): void;
    /**
     * Add line to the page
     */
    addLine(options: LineOptions): void;
    /**
     * Add image to the page
     */
    addImage(options: ImageOptions): void;
    /**
     * Add image from buffer (PNG/JPG/BMP)
     */
    addImageFromBuffer(options: ImageFromBufferOptions): void;
    /**
     * Add image from URI (async)
     */
    addImageFromUri(uri: string, options: ImageFromBufferOptions): Promise<void>;
    /**
     * Calculate X position based on align
     */
    private calculateX;
    /**
     * Calculate Y position based on valign
     */
    private calculateY;
    /**
     * Convert page to EncodedImage for printing
     */
    toEncodedImage(): EncodedImage;
    /**
     * Convert page to base64 PNG for preview
     */
    toPreviewImage(): Promise<string>;
}
