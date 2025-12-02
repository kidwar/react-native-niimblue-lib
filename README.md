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

> **Note**: All required dependencies (react-native-ble-plx, @shopify/react-native-skia, etc.) will be installed automatically.

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

Then create a **development build** (Skia does NOT work in Expo Go):

```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

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

3. **Important**: For `@shopify/react-native-skia`, you need an Expo development build or custom native build. Skia does NOT work in Expo Go.

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
const task = client.newPrintTaskAuto({
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
  valign: 'middle',
});

// 4. Print
await task.printInit();
await task.printPage(page.toEncodedImage(), 1);
await task.waitForFinished();
client.startHeartbeat();
```

## 📖 Usage Examples

### Text Rendering

```typescript
const page = new PrintPage(384, 200);

// Simple text with default font
page.addText('NIIMBOT PRINTER', {
  x: 192,
  y: 50,
  fontSize: 24,
  align: 'center',
  valign: 'middle',
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

### QR Code

```typescript
page.addQR('https://github.com', {
  x: 192,
  y: 100,
  width: 150,
  height: 150,
  align: 'center',
  valign: 'middle',
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
  valign: 'middle',
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
  valign: 'middle',
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
  valign: 'middle',
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

page.addImage({
  data: heartPixels,
  imageWidth: 16,
  imageHeight: 11,
  x: 192,
  y: 100,
  width: 128, // Scaled width
  height: 88,
  align: 'center',
  valign: 'middle',
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
page.addQR('Preview Test', { x: 192, y: 100, align: 'center', valign: 'middle' });

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
- `getConnectedDevices()`: Get already connected devices
- `newPrintTaskAuto(options: PrintOptions)`: Create print task with auto-detection
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
- `addImage(options: ImageOptions): void`
- `addImageFromBuffer(options: ImageFromBufferOptions): void`
- `addImageFromUri(uri: string, options: ImageFromBufferOptions): Promise<void>`
- `addLine(options: LineOptions): void`
- `toEncodedImage(): EncodedImage` - Convert to printer format
- `toPreviewImage(): Promise<string>` - Generate base64 PNG preview

### Common Options

All positioning options support:
- `x`, `y`: Position in pixels
- `width`, `height`: Optional size (auto-scales if only one provided)
- `align`: `'left' | 'center' | 'right'`
- `valign`: `'top' | 'middle' | 'bottom'`

## 🎯 Alignment System

The library uses **reference point alignment**:

```typescript
// Center text at position (192, 100)
page.addText('Centered', {
  x: 192,    // Reference X
  y: 100,    // Reference Y
  align: 'center',   // Text center aligns to x
  valign: 'middle',  // Text middle aligns to y
});

// Right-bottom align at position (350, 180)
page.addText('Corner', {
  x: 350,
  y: 180,
  align: 'right',   // Right edge at x=350
  valign: 'bottom', // Bottom edge at y=180
});
```

## 🐛 Troubleshooting

### Text Rendering Issues
- **Problem**: Font not loading or crashes
- **Solution**: Users should load `Typeface` externally with proper error handling, then pass to `addText()`

### BMP Images Appear Flipped
- **Fixed**: Library automatically handles BMP bottom-up format

### Empty Text Not Rendering
- **Fixed**: Library checks for empty/whitespace text and skips rendering

### Division by Zero Errors
- **Fixed**: All dimensions guaranteed to be at least 1px

## 🔄 Migration from Web Version

Key changes from `niimbluelib` web version:

1. **No Canvas API** - Use `PrintPage` class instead
2. **Skia for Text** - Requires `@shopify/react-native-skia` and Expo dev build
3. **Auto Print Tasks** - Use `newPrintTaskAuto()` instead of manual model selection
4. **Sync Text Rendering** - `addText()` is now synchronous (load fonts externally)
5. **Buffer Polyfill** - Uses `buffer` package for image decoding

## 📄 License

MIT

## 🙏 Credits

Based on [niimbluelib](https://github.com/MultiMote/niimblue) by MultiMote.
