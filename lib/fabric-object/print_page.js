"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintPage = void 0;
const qrcode_generator_1 = __importDefault(require("qrcode-generator"));
const barcode_1 = require("../utils/barcode");
const UPNG = __importStar(require("upng-js"));
const jpeg = __importStar(require("jpeg-js"));
const bmp = __importStar(require("bmp-js"));
const buffer_1 = require("buffer");
const react_native_skia_1 = require("@shopify/react-native-skia");
const react_native_1 = require("react-native");
// Polyfill Buffer for jpeg-js in React Native
if (typeof global !== 'undefined' && !global.Buffer) {
    global.Buffer = buffer_1.Buffer;
}
/**
 * PrintPage class to build printable pages with elements like text, QR, barcode, images.
 * Mimics fabric-object from web version.
 */
class PrintPage {
    constructor(width, height, orientation = 'portrait') {
        // Auto-swap dimensions for landscape mode
        // This allows using same coordinates as portrait with automatic rotation
        if (orientation === 'landscape') {
            this.width = height;
            this.height = width;
        }
        else {
            this.width = width;
            this.height = height;
        }
        this.orientation = orientation;
        this.pixels = Array(this.height)
            .fill(null)
            .map(() => Array(this.width).fill(0));
    }
    /**
     * Add text to the page
     * @param text - Text to render
     * @param options - Text rendering options. If typeface is not provided, system default will be used.
     */
    addText(text, options) {
        // Early return for empty text
        if (!text || text.trim().length === 0) {
            return;
        }
        const fontSize = options.fontSize || 12;
        // Use provided typeface or create default system font
        let typeface = options.typeface;
        if (!typeface) {
            const familyName = react_native_1.Platform.select({
                ios: 'Helvetica',
                android: 'sans-serif',
                default: 'serif',
            });
            // Use provided fontStyle or default to Normal
            const fontStyle = options.fontStyle || react_native_skia_1.FontStyle.Normal;
            const fontMgr = react_native_skia_1.Skia.FontMgr.System();
            if (fontMgr) {
                typeface = fontMgr.matchFamilyStyle(familyName, fontStyle);
            }
            // Final fallback if still null
            if (!typeface) {
                throw new Error('Failed to create typeface for text rendering');
            }
        }
        const font = react_native_skia_1.Skia.Font(typeface, fontSize);
        // Measure text to get natural dimensions
        const measureText = font.measureText(text);
        const metrics = font.getMetrics();
        // Ensure dimensions are at least 1px to avoid division by zero
        const naturalWidth = Math.max(1, Math.ceil(measureText.width));
        const naturalHeight = Math.max(1, Math.ceil(metrics.descent - metrics.ascent));
        // Calculate scaled dimensions (same logic as addQR/addBarcode/addImage)
        let scaledWidth = naturalWidth;
        let scaledHeight = naturalHeight;
        if (options.width && options.height) {
            scaledWidth = options.width;
            scaledHeight = options.height;
        }
        else if (options.width) {
            scaledWidth = options.width;
            scaledHeight = naturalHeight > 0
                ? Math.floor((options.width * naturalHeight) / naturalWidth)
                : options.width;
        }
        else if (options.height) {
            scaledHeight = options.height;
            scaledWidth = naturalWidth > 0
                ? Math.floor((options.height * naturalWidth) / naturalHeight)
                : options.height;
        }
        // Calculate position based on SCALED dimensions for proper alignment
        const x = Math.floor(this.calculateX(options.x, scaledWidth, options.align));
        const y = Math.floor(this.calculateY(options.y, scaledHeight, options.vAlign));
        // Create temporary surface to render text at natural size
        const surface = react_native_skia_1.Skia.Surface.Make(Math.ceil(naturalWidth), Math.ceil(naturalHeight));
        if (!surface) {
            throw new Error('Failed to create Skia surface for text rendering');
        }
        const canvas = surface.getCanvas();
        const paint = react_native_skia_1.Skia.Paint();
        paint.setColor(react_native_skia_1.Skia.Color('black'));
        paint.setAntiAlias(true);
        // Draw text on canvas (y position adjusted for baseline)
        canvas.drawText(text, 0, -metrics.ascent, paint, font);
        // Get image data
        const image = surface.makeImageSnapshot();
        const pixelData = image.readPixels();
        if (!pixelData) {
            throw new Error('Failed to read pixels from rendered text');
        }
        // Convert RGBA to binary and merge into page pixels with scaling
        const imgWidth = Math.ceil(naturalWidth);
        const imgHeight = Math.ceil(naturalHeight);
        // Calculate element center for rotation
        const centerX = x + scaledWidth / 2;
        const centerY = y + scaledHeight / 2;
        const rotate = options.rotate || 0;
        for (let row = 0; row < scaledHeight; row++) {
            for (let col = 0; col < scaledWidth; col++) {
                // Map scaled coordinates back to natural coordinates
                const srcRow = Math.floor((row * imgHeight) / scaledHeight);
                const srcCol = Math.floor((col * imgWidth) / scaledWidth);
                const pixelIndex = (srcRow * imgWidth + srcCol) * 4;
                const r = pixelData[pixelIndex];
                const g = pixelData[pixelIndex + 1];
                const b = pixelData[pixelIndex + 2];
                const a = pixelData[pixelIndex + 3];
                // Convert to grayscale and check if pixel is dark enough
                const gray = (r + g + b) / 3;
                const isBlack = a > 128 && gray < 128; // Consider alpha and brightness
                let px = x + col;
                let py = y + row;
                // Apply rotation if specified
                if (rotate !== 0) {
                    const rotated = this.rotatePoint(px, py, centerX, centerY, rotate);
                    px = Math.round(rotated.x);
                    py = Math.round(rotated.y);
                }
                if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                    this.pixels[py][px] = isBlack ? 1 : 0;
                }
            }
        }
    }
    /**
     * Add QR code to the page
     */
    addQR(text, options) {
        const ecl = options.ecl || 'M';
        const qr = (0, qrcode_generator_1.default)(0, ecl);
        qr.addData(text);
        qr.make();
        const moduleCount = qr.getModuleCount();
        let qrWidth = moduleCount;
        let qrHeight = moduleCount;
        let scaledWidth = qrWidth;
        let scaledHeight = qrHeight;
        if (options.width && options.height) {
            scaledWidth = options.width;
            scaledHeight = options.height;
        }
        else if (options.width) {
            scaledWidth = options.width;
            scaledHeight = Math.floor((options.width * qrHeight) / qrWidth);
        }
        else if (options.height) {
            scaledHeight = options.height;
            scaledWidth = Math.floor((options.height * qrWidth) / qrHeight);
        }
        const x = Math.floor(this.calculateX(options.x, scaledWidth, options.align));
        const y = Math.floor(this.calculateY(options.y, scaledHeight, options.vAlign));
        // Calculate element center for rotation
        const centerX = x + scaledWidth / 2;
        const centerY = y + scaledHeight / 2;
        const rotate = options.rotate || 0;
        for (let row = 0; row < scaledHeight; row++) {
            for (let col = 0; col < scaledWidth; col++) {
                const srcRow = Math.floor((row * qrHeight) / scaledHeight);
                const srcCol = Math.floor((col * qrWidth) / scaledWidth);
                const isBlack = qr.isDark(srcRow, srcCol);
                let px = x + col;
                let py = y + row;
                // Apply rotation if specified
                if (rotate !== 0) {
                    const rotated = this.rotatePoint(px, py, centerX, centerY, rotate);
                    px = Math.round(rotated.x);
                    py = Math.round(rotated.y);
                }
                if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                    this.pixels[py][px] = isBlack ? 1 : 0;
                }
            }
        }
    }
    /**
     * Add barcode to the page
     */
    addBarcode(text, options) {
        const encoding = options.encoding || 'EAN13';
        let bandcode;
        if (encoding === 'EAN13') {
            const result = (0, barcode_1.ean13)(text);
            bandcode = result.bandcode;
        }
        else {
            bandcode = (0, barcode_1.code128b)(text);
        }
        let barcodeWidth = bandcode.length;
        let barcodeHeight = 40; // Default height
        let scaledWidth = barcodeWidth;
        let scaledHeight = barcodeHeight;
        if (options.width && options.height) {
            scaledWidth = options.width;
            scaledHeight = options.height;
        }
        else if (options.width) {
            scaledWidth = options.width;
            scaledHeight = Math.floor((options.width * barcodeHeight) / barcodeWidth);
        }
        else if (options.height) {
            scaledHeight = options.height;
            scaledWidth = Math.floor((options.height * barcodeWidth) / barcodeHeight);
        }
        const x = Math.floor(this.calculateX(options.x, scaledWidth, options.align));
        const y = Math.floor(this.calculateY(options.y, scaledHeight, options.vAlign));
        // Calculate element center for rotation
        const centerX = x + scaledWidth / 2;
        const centerY = y + scaledHeight / 2;
        const rotate = options.rotate || 0;
        for (let row = 0; row < scaledHeight; row++) {
            for (let col = 0; col < scaledWidth; col++) {
                const srcRow = Math.floor((row * barcodeHeight) / scaledHeight);
                const srcCol = Math.floor((col * barcodeWidth) / scaledWidth);
                const isBlack = bandcode[srcCol] === '1';
                let px = x + col;
                let py = y + row;
                // Apply rotation if specified
                if (rotate !== 0) {
                    const rotated = this.rotatePoint(px, py, centerX, centerY, rotate);
                    px = Math.round(rotated.x);
                    py = Math.round(rotated.y);
                }
                if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                    this.pixels[py][px] = isBlack ? 1 : 0;
                }
            }
        }
    }
    /**
     * Add line to the page
     */
    addLine(options) {
        const { x, y, endX, endY, thickness = 1 } = options;
        // Bresenham's line algorithm
        const dx = Math.abs(endX - x);
        const dy = Math.abs(endY - y);
        const sx = x < endX ? 1 : -1;
        const sy = y < endY ? 1 : -1;
        let err = dx - dy;
        let px = x;
        let py = y;
        while (true) {
            // Draw pixel with thickness
            for (let tx = -Math.floor(thickness / 2); tx <= Math.floor(thickness / 2); tx++) {
                for (let ty = -Math.floor(thickness / 2); ty <= Math.floor(thickness / 2); ty++) {
                    const drawPx = px + tx;
                    const drawPy = py + ty;
                    if (drawPx >= 0 &&
                        drawPx < this.width &&
                        drawPy >= 0 &&
                        drawPy < this.height) {
                        this.pixels[drawPy][drawPx] = 1; // Black
                    }
                }
            }
            if (px === endX && py === endY)
                break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                px += sx;
            }
            if (e2 < dx) {
                err += dx;
                py += sy;
            }
        }
    }
    /**
     * Add pixel data to the page
     */
    addPixelData(options) {
        const { data, imageWidth, imageHeight } = options;
        let scaledWidth = imageWidth;
        let scaledHeight = imageHeight;
        if (options.width && options.height) {
            scaledWidth = options.width;
            scaledHeight = options.height;
        }
        else if (options.width) {
            scaledWidth = options.width;
            scaledHeight = Math.floor((options.width * imageHeight) / imageWidth);
        }
        else if (options.height) {
            scaledHeight = options.height;
            scaledWidth = Math.floor((options.height * imageWidth) / imageHeight);
        }
        const x = Math.floor(this.calculateX(options.x, scaledWidth, options.align));
        const y = Math.floor(this.calculateY(options.y, scaledHeight, options.vAlign));
        // Calculate element center for rotation
        const centerX = x + scaledWidth / 2;
        const centerY = y + scaledHeight / 2;
        const rotate = options.rotate || 0;
        for (let row = 0; row < scaledHeight; row++) {
            for (let col = 0; col < scaledWidth; col++) {
                const srcRow = Math.floor((row * imageHeight) / scaledHeight);
                const srcCol = Math.floor((col * imageWidth) / scaledWidth);
                const srcIndex = srcRow * imageWidth + srcCol;
                const isBlack = data[srcIndex] === 1;
                let px = x + col;
                let py = y + row;
                // Apply rotation if specified
                if (rotate !== 0) {
                    const rotated = this.rotatePoint(px, py, centerX, centerY, rotate);
                    px = Math.round(rotated.x);
                    py = Math.round(rotated.y);
                }
                if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                    this.pixels[py][px] = isBlack ? 1 : 0;
                }
            }
        }
    }
    /**
     * Add image from buffer (PNG/JPG/BMP)
     */
    addImageFromBuffer(options) {
        const { buffer, threshold = 128 } = options;
        let decoded;
        if (!buffer) {
            throw new Error('Buffer is required for addImageFromBuffer');
        }
        // Detect format by magic bytes
        if (buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47) {
            // PNG
            const png = UPNG.decode(buffer_1.Buffer.from(buffer));
            const frames = UPNG.toRGBA8(png);
            decoded = {
                width: png.width,
                height: png.height,
                data: new Uint8Array(frames[0]),
            };
        }
        else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
            // JPG
            decoded = jpeg.decode(buffer);
        }
        else if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
            // BMP
            // Note: bmp-js library already handles bottom-up BMP format automatically
            // The decoded data is already in top-down format, no manual flip needed
            const bmpData = bmp.decode(buffer_1.Buffer.from(buffer));
            decoded = {
                width: bmpData.width,
                height: Math.abs(bmpData.height),
                data: bmpData.data,
            };
        }
        else {
            throw new Error('Unsupported image format. Only PNG, JPG, and BMP are supported.');
        }
        // Convert RGBA to binary (0/1) using threshold
        const pixelData = [];
        for (let i = 0; i < decoded.data.length; i += 4) {
            const r = decoded.data[i];
            const g = decoded.data[i + 1];
            const b = decoded.data[i + 2];
            // Grayscale: (r + g + b) / 3
            const gray = (r + g + b) / 3;
            pixelData.push(gray < threshold ? 1 : 0); // 1 = black, 0 = white
        }
        // Call addPixelData with the decoded data
        this.addPixelData({
            data: pixelData,
            imageWidth: decoded.width,
            imageHeight: decoded.height,
            x: options.x,
            y: options.y,
            width: options.width,
            height: options.height,
            align: options.align,
            vAlign: options.vAlign,
            rotate: options.rotate,
        });
    }
    /**
     * Add image from URI (async)
     */
    async addImageFromUri(uri, options) {
        const response = await fetch(uri);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from ${uri}: ${response.statusText}`);
        }
        const buffer = new Uint8Array(await response.arrayBuffer());
        this.addImageFromBuffer({ ...options, buffer });
    }
    /**
     * Rotate a point around a center
     * @param px Point x coordinate
     * @param py Point y coordinate
     * @param cx Center x coordinate
     * @param cy Center y coordinate
     * @param angleDegrees Rotation angle in degrees
     * @returns Rotated point coordinates
     */
    rotatePoint(px, py, cx, cy, angleDegrees) {
        const angleRadians = (angleDegrees * Math.PI) / 180;
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);
        // Translate to origin
        const translatedX = px - cx;
        const translatedY = py - cy;
        // Rotate
        const rotatedX = translatedX * cos - translatedY * sin;
        const rotatedY = translatedX * sin + translatedY * cos;
        // Translate back
        return {
            x: rotatedX + cx,
            y: rotatedY + cy,
        };
    }
    /**
     * Calculate X position based on align
     */
    calculateX(x, elementWidth, align) {
        switch (align) {
            case 'center':
                return x - Math.floor(elementWidth / 2);
            case 'right':
                return x - elementWidth;
            default:
                return x;
        }
    }
    /**
     * Calculate Y position based on vAlign
     */
    calculateY(y, elementHeight, vAlign) {
        switch (vAlign) {
            case 'middle':
                return y - Math.floor(elementHeight / 2);
            case 'bottom':
                return y - elementHeight;
            default:
                return y;
        }
    }
    /**
     * Convert page to EncodedImage for printing
     */
    toEncodedImage() {
        // For landscape mode, we need to rotate the canvas 90° counter-clockwise for printing
        // because the canvas is already rotated for preview, but printer expects portrait orientation
        const shouldRotate = this.orientation === 'landscape';
        const outputWidth = shouldRotate ? this.height : this.width;
        const outputHeight = shouldRotate ? this.width : this.height;
        const rowsData = [];
        for (let row = 0; row < outputHeight; row++) {
            let blackCount = 0;
            const rowData = new Uint8Array(Math.ceil(outputWidth / 8));
            for (let col = 0; col < outputWidth; col++) {
                // For landscape, rotate 90° counter-clockwise
                // Output (col, row) ← Canvas (width-1-row, col)
                // pixels[y][x] so: pixels[col][width-1-row]
                const srcX = shouldRotate ? (this.width - 1 - row) : col;
                const srcY = shouldRotate ? col : row;
                if (this.pixels[srcY][srcX]) {
                    blackCount++;
                    const byteIndex = Math.floor(col / 8);
                    const bitIndex = col % 8;
                    rowData[byteIndex] |= 1 << (7 - bitIndex);
                }
            }
            const newPart = {
                dataType: blackCount > 0 ? 'pixels' : 'void',
                rowNumber: row,
                repeat: 1,
                blackPixelsCount: blackCount,
                rowData: blackCount > 0 ? rowData : undefined,
            };
            if (rowsData.length === 0) {
                rowsData.push(newPart);
            }
            else {
                const lastPacket = rowsData[rowsData.length - 1];
                let same = newPart.dataType === lastPacket.dataType;
                if (same && newPart.dataType === 'pixels') {
                    same = !!(newPart.rowData &&
                        lastPacket.rowData &&
                        newPart.rowData.length === lastPacket.rowData.length &&
                        newPart.rowData.every((val, idx) => val === lastPacket.rowData[idx]));
                }
                if (same) {
                    lastPacket.repeat++;
                }
                else {
                    rowsData.push(newPart);
                }
            }
        }
        return {
            cols: outputWidth,
            rows: outputHeight,
            rowsData,
        };
    }
    /**
     * Convert page to base64 PNG for preview
     */
    async toPreviewImage() {
        // For landscape mode, rotate canvas to match physical paper orientation
        // Preview should show 320×480 (portrait) with rotated content, not 480×320
        const shouldRotate = this.orientation === 'landscape';
        const outputWidth = shouldRotate ? this.height : this.width;
        const outputHeight = shouldRotate ? this.width : this.height;
        const rgba = new Uint8Array(outputWidth * outputHeight * 4);
        for (let y = 0; y < outputHeight; y++) {
            for (let x = 0; x < outputWidth; x++) {
                // For landscape, rotate 90° counter-clockwise to match print output
                const srcX = shouldRotate ? (this.width - 1 - y) : x;
                const srcY = shouldRotate ? x : y;
                const idx = (y * outputWidth + x) * 4;
                const color = this.pixels[srcY][srcX] ? 0 : 255; // Black = 0, White = 255
                rgba[idx] = color; // R
                rgba[idx + 1] = color; // G
                rgba[idx + 2] = color; // B
                rgba[idx + 3] = 255; // A
            }
        }
        // Encode to PNG
        const pngBuffer = UPNG.encode([rgba.buffer], outputWidth, outputHeight, 0);
        const base64 = buffer_1.Buffer.from(pngBuffer).toString('base64');
        return `data:image/png;base64,${base64}`;
    }
}
exports.PrintPage = PrintPage;
