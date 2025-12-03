import QRCodeFactory from 'qrcode-generator';
import { ean13, code128b } from '../utils/barcode';
import * as UPNG from 'upng-js';
import * as jpeg from 'jpeg-js';
import * as bmp from 'bmp-js';
import { Buffer } from 'buffer';
import { FontStyle, Skia, SkTypeface } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

// Polyfill Buffer for jpeg-js in React Native
if (typeof global !== 'undefined' && !global.Buffer) {
  global.Buffer = Buffer;
}

export interface PrintElementOptions {
  x: number;
  y: number;
  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
  vAlign?: 'top' | 'middle' | 'bottom';
}

export interface TextOptions extends PrintElementOptions {
  fontSize?: number;
  typeface?: SkTypeface; // Optional custom typeface, defaults to system font if not provided
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
  thickness?: number; // Default 1
}

export interface ImageOptions extends PrintElementOptions {
  data: number[]; // 1D array of 0/1 pixels
  imageWidth: number;
  imageHeight: number;
}

export interface ImageFromBufferOptions extends PrintElementOptions {
  buffer?: Uint8Array;
  threshold?: number; // Grayscale threshold for binary conversion (default 128)
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
export class PrintPage {
  private pixels: number[][]; // 2D array: 0 = white, 1 = black
  public readonly width: number;
  public readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));
  }

  /**
   * Add text to the page
   * @param text - Text to render
   * @param options - Text rendering options. If typeface is not provided, system default will be used.
   */
  addText(text: string, options: TextOptions): void {
    // Early return for empty text
    if (!text || text.trim().length === 0) {
      return;
    }

    const fontSize = options.fontSize || 12;
    
    // Use provided typeface or create default system font
    let typeface = options.typeface;
    
    if (!typeface) {
      const familyName = Platform.select({
        ios: 'Helvetica',
        android: 'sans-serif',
        default: 'serif',
      });
      
      const fontMgr = Skia.FontMgr.System();
      if (fontMgr) {
        typeface = fontMgr.matchFamilyStyle(familyName, FontStyle.Normal);
      }
      
      // Final fallback if still null
      if (!typeface) {
        throw new Error('Failed to create typeface for text rendering');
      }
    }
    
    const font = Skia.Font(typeface, fontSize);
    
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
    } else if (options.width) {
      scaledWidth = options.width;
      scaledHeight = naturalHeight > 0 
        ? Math.floor((options.width * naturalHeight) / naturalWidth)
        : options.width;
    } else if (options.height) {
      scaledHeight = options.height;
      scaledWidth = naturalWidth > 0
        ? Math.floor((options.height * naturalWidth) / naturalHeight)
        : options.height;
    }

    // Calculate position based on SCALED dimensions for proper alignment
    const x = Math.floor(this.calculateX(options.x, scaledWidth, options.align));
    const y = Math.floor(this.calculateY(options.y, scaledHeight, options.vAlign));

    // Create temporary surface to render text at natural size
    const surface = Skia.Surface.Make(
      Math.ceil(naturalWidth),
      Math.ceil(naturalHeight),
    );
    if (!surface) {
      throw new Error('Failed to create Skia surface for text rendering');
    }
    const canvas = surface.getCanvas();
    const paint = Skia.Paint();
    paint.setColor(Skia.Color('black'));
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

        const px = x + col;
        const py = y + row;
        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.pixels[py][px] = isBlack ? 1 : 0;
        }
      }
    }
  }

  /**
   * Add QR code to the page
   */
  addQR(text: string, options: QROptions): void {
    const ecl = options.ecl || 'M';
    const qr = QRCodeFactory(0, ecl);
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
    } else if (options.width) {
      scaledWidth = options.width;
      scaledHeight = Math.floor((options.width * qrHeight) / qrWidth);
    } else if (options.height) {
      scaledHeight = options.height;
      scaledWidth = Math.floor((options.height * qrWidth) / qrHeight);
    }

    const x = Math.floor(this.calculateX(options.x, scaledWidth, options.align));
    const y = Math.floor(this.calculateY(options.y, scaledHeight, options.vAlign));

    for (let row = 0; row < scaledHeight; row++) {
      for (let col = 0; col < scaledWidth; col++) {
        const srcRow = Math.floor((row * qrHeight) / scaledHeight);
        const srcCol = Math.floor((col * qrWidth) / scaledWidth);
        const isBlack = qr.isDark(srcRow, srcCol);

        const px = x + col;
        const py = y + row;
        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.pixels[py][px] = isBlack ? 1 : 0;
        }
      }
    }
  }

  /**
   * Add barcode to the page
   */
  addBarcode(text: string, options: BarcodeOptions): void {
    const encoding = options.encoding || 'EAN13';
    let bandcode: string;

    if (encoding === 'EAN13') {
      const result = ean13(text);
      bandcode = result.bandcode;
    } else {
      bandcode = code128b(text);
    }

    let barcodeWidth = bandcode.length;
    let barcodeHeight = 40; // Default height
    let scaledWidth = barcodeWidth;
    let scaledHeight = barcodeHeight;

    if (options.width && options.height) {
      scaledWidth = options.width;
      scaledHeight = options.height;
    } else if (options.width) {
      scaledWidth = options.width;
      scaledHeight = Math.floor((options.width * barcodeHeight) / barcodeWidth);
    } else if (options.height) {
      scaledHeight = options.height;
      scaledWidth = Math.floor((options.height * barcodeWidth) / barcodeHeight);
    }

    const x = Math.floor(this.calculateX(options.x, scaledWidth, options.align));
    const y = Math.floor(this.calculateY(options.y, scaledHeight, options.vAlign));

    for (let row = 0; row < scaledHeight; row++) {
      for (let col = 0; col < scaledWidth; col++) {
        const srcRow = Math.floor((row * barcodeHeight) / scaledHeight);
        const srcCol = Math.floor((col * barcodeWidth) / scaledWidth);
        const isBlack = bandcode[srcCol] === '1';

        const px = x + col;
        const py = y + row;
        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.pixels[py][px] = isBlack ? 1 : 0;
        }
      }
    }
  }

  /**
   * Add line to the page
   */
  addLine(options: LineOptions): void {
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
      for (
        let tx = -Math.floor(thickness / 2);
        tx <= Math.floor(thickness / 2);
        tx++
      ) {
        for (
          let ty = -Math.floor(thickness / 2);
          ty <= Math.floor(thickness / 2);
          ty++
        ) {
          const drawPx = px + tx;
          const drawPy = py + ty;
          if (
            drawPx >= 0 &&
            drawPx < this.width &&
            drawPy >= 0 &&
            drawPy < this.height
          ) {
            this.pixels[drawPy][drawPx] = 1; // Black
          }
        }
      }

      if (px === endX && py === endY) break;
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
  addPixelData(options: ImageOptions): void {
    const { data, imageWidth, imageHeight } = options;

    let scaledWidth = imageWidth;
    let scaledHeight = imageHeight;

    if (options.width && options.height) {
      scaledWidth = options.width;
      scaledHeight = options.height;
    } else if (options.width) {
      scaledWidth = options.width;
      scaledHeight = Math.floor((options.width * imageHeight) / imageWidth);
    } else if (options.height) {
      scaledHeight = options.height;
      scaledWidth = Math.floor((options.height * imageWidth) / imageHeight);
    }

    const x = Math.floor(this.calculateX(options.x, scaledWidth, options.align));
    const y = Math.floor(this.calculateY(options.y, scaledHeight, options.vAlign));

    for (let row = 0; row < scaledHeight; row++) {
      for (let col = 0; col < scaledWidth; col++) {
        const srcRow = Math.floor((row * imageHeight) / scaledHeight);
        const srcCol = Math.floor((col * imageWidth) / scaledWidth);
        const srcIndex = srcRow * imageWidth + srcCol;
        const isBlack = data[srcIndex] === 1;

        const px = x + col;
        const py = y + row;
        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.pixels[py][px] = isBlack ? 1 : 0;
        }
      }
    }
  }

  /**
   * Add image from buffer (PNG/JPG/BMP)
   */
  addImageFromBuffer(options: ImageFromBufferOptions): void {
    const { buffer, threshold = 128 } = options;
    let decoded: { width: number; height: number; data: Uint8Array };

    if (!buffer) {
      throw new Error('Buffer is required for addImageFromBuffer');
    }

    // Detect format by magic bytes
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      // PNG
      const png = UPNG.decode(Buffer.from(buffer));
      const frames = UPNG.toRGBA8(png);
      decoded = {
        width: png.width,
        height: png.height,
        data: new Uint8Array(frames[0]),
      };
    } else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      // JPG
      decoded = jpeg.decode(buffer);
    } else if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
      // BMP
      // Note: bmp-js library already handles bottom-up BMP format automatically
      // The decoded data is already in top-down format, no manual flip needed
      const bmpData = bmp.decode(Buffer.from(buffer));
      decoded = {
        width: bmpData.width,
        height: Math.abs(bmpData.height),
        data: bmpData.data,
      };
    } else {
      throw new Error(
        'Unsupported image format. Only PNG, JPG, and BMP are supported.',
      );
    }

    // Convert RGBA to binary (0/1) using threshold
    const pixelData: number[] = [];
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
    });
  }

  /**
   * Add image from URI (async)
   */
  async addImageFromUri(
    uri: string,
    options: ImageFromBufferOptions,
  ): Promise<void> {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image from ${uri}: ${response.statusText}`,
      );
    }
    const buffer = new Uint8Array(await response.arrayBuffer());
    this.addImageFromBuffer({ ...options, buffer });
  }

  /**
   * Calculate X position based on align
   */
  private calculateX(x: number, elementWidth: number, align?: string): number {
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
  private calculateY(
    y: number,
    elementHeight: number,
    vAlign?: string,
  ): number {
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
  toEncodedImage(): EncodedImage {
    const rowsData: EncodedImage['rowsData'] = [];

    for (let row = 0; row < this.height; row++) {
      const rowPixels = this.pixels[row];
      let blackCount = 0;
      const rowData = new Uint8Array(Math.ceil(this.width / 8));

      for (let col = 0; col < this.width; col++) {
        if (rowPixels[col]) {
          blackCount++;
          const byteIndex = Math.floor(col / 8);
          const bitIndex = col % 8;
          rowData[byteIndex] |= 1 << (7 - bitIndex);
        }
      }

      const newPart = {
        dataType: blackCount > 0 ? ('pixels' as const) : ('void' as const),
        rowNumber: row,
        repeat: 1,
        blackPixelsCount: blackCount,
        rowData: blackCount > 0 ? rowData : undefined,
      };

      if (rowsData.length === 0) {
        rowsData.push(newPart);
      } else {
        const lastPacket = rowsData[rowsData.length - 1];
        let same = newPart.dataType === lastPacket.dataType;

        if (same && newPart.dataType === 'pixels') {
          same = !!(
            newPart.rowData &&
            lastPacket.rowData &&
            newPart.rowData.length === lastPacket.rowData.length &&
            newPart.rowData.every(
              (val, idx) => val === lastPacket.rowData![idx],
            )
          );
        }

        if (same) {
          lastPacket.repeat++;
        } else {
          rowsData.push(newPart);
        }
      }
    }

    return {
      cols: this.width,
      rows: this.height,
      rowsData,
    };
  }

  /**
   * Convert page to base64 PNG for preview
   */
  async toPreviewImage(): Promise<string> {
    // Convert binary pixels to RGBA
    const rgba = new Uint8Array(this.width * this.height * 4);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (y * this.width + x) * 4;
        const color = this.pixels[y][x] ? 0 : 255; // Black = 0, White = 255
        rgba[idx] = color; // R
        rgba[idx + 1] = color; // G
        rgba[idx + 2] = color; // B
        rgba[idx + 3] = 255; // A
      }
    }

    // Encode to PNG
    const pngBuffer = UPNG.encode([rgba.buffer], this.width, this.height, 0);
    const base64 = Buffer.from(pngBuffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  }
}
