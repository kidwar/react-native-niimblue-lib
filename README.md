# React Native NiimBlue Library

A React Native library for Bluetooth LE printing with NIIMBOT thermal printers. Features automatic printer model detection, rich content rendering (text, QR codes, barcodes, images), and comprehensive print control.

## ✨ Features

- 🔍 **Auto-detect printer models** - Automatically selects the correct print task based on connected printer
- 📱 **BLE Communication** - Direct Bluetooth Low Energy connection to NIIMBOT printers
- 🎨 **Rich Content Support**:
  - Text rendering with Skia (custom fonts, alignment, scaling)
  - QR codes with error correction levels
  - Barcodes (EAN13, CODE128)
  - Images from buffers or URIs (PNG, JPG, BMP)
  - Lines and custom pixel data
- 🖼️ **Print Preview** - Generate base64 PNG previews before printing
- 📏 **Flexible Layout** - Pixel-perfect positioning with alignment options
- 🔄 **Multiple Printer Support** - B1, B21, D110, D11 and more

## 📦 Installation

```bash
npm install react-native-niimblue-lib
```

### Install Required Peer Dependencies

**Always required** for Bluetooth connectivity:
```bash
npm install react-native-ble-plx
```

**Optional** - only needed if you use `PrintPage.addText()` for text rendering:
```bash
npm install @shopify/react-native-skia
```

> **Note**: If you only print QR codes, barcodes, or images without text, you don't need Skia.
>
> **Alternative**: Instead of using Skia, you can render text to image/pixel data using any method (Canvas, SVG, native views, etc.) and add it via `addPixelData()` or `addImageFromBuffer()`.
>
> **Important**: These dependencies have native code and require proper linking/building. They cannot work as transitive dependencies.

### Expo Setup

If using Expo, add the BLE plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-ble-plx",
        {
          "isBackgroundEnabled": true,
          "modes": ["peripheral", "central"],
          "bluetoothAlwaysPermission": "App needs Bluetooth to connect to NIIMBOT printers"
        }
      ]
    ]
  }
}
```

Then create a **development build**:

```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

> **Note**: If you use `PrintPage.addText()`, Skia requires a development build and does NOT work in Expo Go. However, QR codes, barcodes, and images work fine without Skia.

### iOS Setup

1. Install CocoaPods dependencies:
```bash
cd ios && pod install
```

2. Add to `Info.plist`:
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>App needs Bluetooth to connect to NIIMBOT printers</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Required for Bluetooth device scanning</string>
```

3. **Note**: If you installed `@shopify/react-native-skia` for text rendering, run `pod install` again after installation.

### Android Setup

Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" 
                 android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.INTERNET" />
```

## 🚀 Quick Start

### Basic Printing

```typescript
import { NiimbotBluetoothClient, PrintPage } from 'react-native-niimblue-lib';

// 1. Connect to printer
const client = new NiimbotBluetoothClient();
await client.connect(); // Auto-scans and connects to first NIIMBOT device

// 2. Create print task (auto-detects printer model)
client.stopHeartbeat();
client.setPacketInterval(0); // Fast printing
const task = client.createPrintTask({
  totalPages: 1,
  density: 3,
  labelType: 1,
});

if (!task) {
  throw new Error('Printer model not detected');
}

// 3. Build page content
const page = new PrintPage(384, 200); // width x height in pixels

page.addText('Hello NIIMBOT!', {
  x: 192,
  y: 100,
  fontSize: 24,
  align: 'center',
  vAlign: 'middle',
});

// 4. Print
await task.printInit();
await task.printPage(page.toEncodedImage(), 1);
await task.waitForFinished();
client.startHeartbeat();
```

## 📖 Usage Examples

### Text Rendering

**Option 1: Using Skia (requires @shopify/react-native-skia)**

```typescript
const page = new PrintPage(384, 200);

// Simple text with default font
page.addText('NIIMBOT PRINTER', {
  x: 192,
  y: 50,
  fontSize: 24,
  align: 'center',
  vAlign: 'middle',
});

// Custom font (user loads Typeface separately)
import { Skia } from '@shopify/react-native-skia';
const fontData = await Skia.Data.fromURI('file://path/to/font.ttf');
const customTypeface = Skia.Typeface.MakeFreeTypeFaceFromData(fontData);

page.addText('Custom Font Text', {
  x: 100,
  y: 100,
  fontSize: 16,
  typeface: customTypeface, // Optional
  align: 'left',
});
```

**Option 2: Without Skia - Convert text to image first**

```typescript
// Example: Using react-native-view-shot to capture text as image
import { captureRef } from 'react-native-view-shot';

// 1. Render text in a hidden View with ref
const textRef = useRef();

// 2. Capture as base64
const uri = await captureRef(textRef, {
  format: 'png',
  quality: 1,
});

// 3. Convert to buffer and add to page
const response = await fetch(uri);
const arrayBuffer = await response.arrayBuffer();
const buffer = new Uint8Array(arrayBuffer);

page.addImageFromBuffer({
  buffer,
  x: 192,
  y: 100,
  align: 'center',
  vAlign: 'middle',
});

// Or use any other method: Canvas, SVG to PNG, native rendering, etc.
```

### QR Code

```typescript
page.addQR('https://github.com', {
  x: 192,
  y: 100,
  width: 150,
  height: 150,
  align: 'center',
  vAlign: 'middle',
  ecl: 'M', // Error correction: L, M, Q, H
});
```

### Barcode

```typescript
page.addBarcode('123456789012', {
  encoding: 'EAN13', // or 'CODE128'
  x: 192,
  y: 150,
  width: 200,
  height: 60,
  align: 'center',
  vAlign: 'middle',
});
```

### Image from Buffer (PNG/JPG/BMP)

```typescript
const imageBuffer = await fetch('https://example.com/image.jpg')
  .then(res => res.arrayBuffer())
  .then(buf => new Uint8Array(buf));

page.addImageFromBuffer({
  buffer: imageBuffer,
  x: 192,
  y: 100,
  width: 200,
  height: 150,
  align: 'center',
  vAlign: 'middle',
  threshold: 128, // Grayscale to binary threshold
});
```

### Image from URI

```typescript
await page.addImageFromUri('https://example.com/logo.png', {
  x: 192,
  y: 100,
  width: 150,
  height: 150,
  align: 'center',
  vAlign: 'middle',
  threshold: 128,
});
```

### Custom Pixel Data

```typescript
const heartPixels = [
  0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,
  0,0,1,1,1,1,1,0,0,1,1,1,1,0,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
  // ... (1 = black, 0 = white)
];

page.addPixelData({
  data: heartPixels,
  imageWidth: 16,
  imageHeight: 11,
  x: 192,
  y: 100,
  width: 128, // Scaled width
  height: 88,
  align: 'center',
  vAlign: 'middle',
});
```

### Line Drawing

```typescript
page.addLine({
  x: 10,
  y: 100,
  endX: 374,
  endY: 100,
  thickness: 2,
});
```

### Print Preview

```typescript
const page = new PrintPage(384, 200);
page.addQR('Preview Test', { x: 192, y: 100, align: 'center', vAlign: 'middle' });

// Generate base64 PNG
const base64Uri = await page.toPreviewImage();
// Display in <Image source={{ uri: base64Uri }} />
```

## 🔧 API Reference

### NiimbotBluetoothClient

#### Methods

- `connect(device?: Device)`: Connect to printer (auto-scan or specific device)
- `disconnect()`: Disconnect from printer
- `listDevices(scanDurationMs: number)`: Scan for available printers
- `listConnectedDevices()`: List already connected devices
- `createPrintTask(options: PrintOptions)`: Create print task with auto-detection
- `setPacketInterval(ms: number)`: Set delay between packets (0 = fastest)
- `startHeartbeat()` / `stopHeartbeat()`: Control heartbeat

### PrintPage

#### Constructor

```typescript
new PrintPage(width: number, height: number)
```

#### Methods

- `addText(text: string, options: TextOptions): void`
- `addQR(text: string, options: QROptions): void`
- `addBarcode(text: string, options: BarcodeOptions): void`
- `addPixelData(options: ImageOptions): void`
- `addImageFromBuffer(options: ImageFromBufferOptions): void`
- `addImageFromUri(uri: string, options: ImageFromBufferOptions): Promise<void>`
- `addLine(options: LineOptions): void`
- `toEncodedImage(): EncodedImage` - Convert to printer format
- `toPreviewImage(): Promise<string>` - Generate base64 PNG preview

### Type Definitions

#### PrintOptions
- `totalPages?: number` - Number of pages to print
- `density?: number` - Print density (1-5, default: 3, higher = darker)
- `labelType?: number` - Label type identifier (printer-specific)
- `statusPollIntervalMs?: number` - Status polling interval in ms (default: 100)
- `statusTimeoutMs?: number` - Status check timeout in ms (default: 8000)
- `pageTimeoutMs?: number` - Timeout for printing each page in ms

#### PrintElementOptions (Base)
All positioning options support:
- `x: number` - X coordinate in pixels
- `y: number` - Y coordinate in pixels
- `width?: number` - Optional width (auto-scales if only one dimension provided)
- `height?: number` - Optional height (auto-scales if only one dimension provided)
- `align?: 'left' | 'center' | 'right'` - Horizontal alignment relative to x coordinate
- `vAlign?: 'top' | 'middle' | 'bottom'` - Vertical alignment relative to y coordinate

#### TextOptions
Extends `PrintElementOptions` with:
- `fontSize?: number` - Font size in pixels (default: 12)
- `typeface?: SkTypeface` - Custom Skia typeface (optional, uses system font if not provided)

#### QROptions
Extends `PrintElementOptions` with:
- `ecl?: 'L' | 'M' | 'Q' | 'H'` - Error correction level (default: 'M')
  - L: Low (~7% correction)
  - M: Medium (~15% correction)
  - Q: Quartile (~25% correction)
  - H: High (~30% correction)

#### BarcodeOptions
Extends `PrintElementOptions` with:
- `encoding?: 'EAN13' | 'CODE128'` - Barcode encoding format (default: 'EAN13')

#### ImageOptions
Extends `PrintElementOptions` with:
- `data: number[]` - 1D array of pixel data (1 = black, 0 = white)
- `imageWidth: number` - Original image width in pixels
- `imageHeight: number` - Original image height in pixels

#### ImageFromBufferOptions
Extends `PrintElementOptions` with:
- `buffer: Uint8Array` - Image file buffer (supports PNG/JPG/BMP formats)
- `threshold?: number` - Grayscale to binary conversion threshold (0-255, default: 128, lower = darker)

#### LineOptions
- `x: number` - Start X coordinate in pixels
- `y: number` - Start Y coordinate in pixels
- `endX: number` - End X coordinate in pixels
- `endY: number` - End Y coordinate in pixels
- `thickness?: number` - Line thickness in pixels (default: 1)

## 🎯 Alignment System

The library uses **reference point alignment**:

```typescript
// Center text at position (192, 100)
page.addText('Centered', {
  x: 192,    // Reference X
  y: 100,    // Reference Y
  align: 'center',   // Text center aligns to x
  vAlign: 'middle',  // Text middle aligns to y
});

// Right-bottom align at position (350, 180)
page.addText('Corner', {
  x: 350,
  y: 180,
  align: 'right',   // Right edge at x=350
  vAlign: 'bottom', // Bottom edge at y=180
});
```

## 🐛 Troubleshooting

### Bluetooth Connection Issues
- **Problem**: Cannot find or connect to printer
- **Solution**: 
  - Ensure Bluetooth is enabled on your device
  - Make sure printer is powered on and in pairing mode
  - Check that all required permissions are granted (Bluetooth, Location on Android)
  - Try `listDevices()` to scan for available printers

### Text Not Rendering
- **Problem**: Text appears blank or crashes
- **Solution**: 
  - If using `addText()`, make sure `@shopify/react-native-skia` is installed
  - Use Expo development build (not Expo Go) when using Skia
  - Alternatively, use `addImageFromBuffer()` with pre-rendered text images

### Print Quality Issues
- **Problem**: Print is too light or too dark
- **Solution**: Adjust the `density` parameter (1-5, default 3) in `createPrintTask()`

### Image Not Printing Correctly
- **Problem**: Image appears distorted or incorrect colors
- **Solution**: 
  - Ensure image dimensions are multiples of 8 pixels for width
  - Adjust `threshold` parameter (default 128) in `addImageFromBuffer()`
  - Images are converted to black & white - use high contrast images

### Android Crash on Disconnect
- **Problem**: App crashes when disconnecting from printer on Android
- **Solution**: This is a known issue with `react-native-ble-plx`. See workaround: https://github.com/dotintent/react-native-ble-plx/issues/1303#issuecomment-3367559459

### Build Errors
- **Problem**: Native module errors during build
- **Solution**:
  - Run `pod install` in iOS directory after installing dependencies
  - For Android, sync gradle after adding dependencies
  - Clean build: `cd ios && rm -rf Pods && pod install` or `cd android && ./gradlew clean`

## 🔄 Migration from Web Version

Key changes from `niimbluelib` web version:

1. **No Canvas API** - Use `PrintPage` class instead
2. **Skia for Text** - Requires `@shopify/react-native-skia` and Expo dev build
3. **Auto Print Tasks** - Use `createPrintTask()` instead of manual model selection
4. **Sync Text Rendering** - `addText()` is now synchronous (load fonts externally)
5. **Buffer Polyfill** - Uses `buffer` package for image decoding

## 📄 License

MIT

## 🙏 Credits

Based on [niimbluelib](https://github.com/MultiMote/niimblue) by MultiMote.
