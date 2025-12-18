import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Device } from 'react-native-ble-plx';
import { NiimbotBluetoothClient, PrintPage } from 'react-native-niimblue-lib';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [client, setClient] = useState<NiimbotBluetoothClient | null>(null);
  const [status, setStatus] = useState('Disconnected');
  const [devices, setDevices] = useState<Device[]>([]);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingPrintAction, setPendingPrintAction] = useState<
    (() => Promise<void>) | null
  >(null);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED,
      );
    }
    return true; // iOS permissions handled in Info.plist
  };

  const handleConnect = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Error', 'Bluetooth permissions are required');
      return;
    }

    try {
      const newClient = new NiimbotBluetoothClient();
      setClient(newClient);
      setStatus('Scanning for devices...');
      const foundDevices = await newClient.listDevices(3000); // Scan for 5 seconds
      const connectedDevices = await newClient.listConnectedDevices(); // List already connected devices
      if (foundDevices.length === 0 && connectedDevices.length === 0) {
        Alert.alert(
          'No Devices Found',
          'No compatible printers found. Make sure your printer is turned on and in pairing mode.',
        );
        setStatus('No devices found');
        return;
      }
      // Combine scanned and connected devices, filter duplicates by ID
      const allDevices = [...foundDevices, ...connectedDevices];
      const uniqueDevices = allDevices.filter(
        (device, index, self) =>
          index === self.findIndex(d => d.id === device.id),
      );
      setDevices(uniqueDevices);
      setShowDeviceList(true);
      setStatus('Select a device');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Bluetooth is not powered on') {
          Alert.alert(
            'Bluetooth Required',
            'Please enable Bluetooth in your device settings and try connecting again.',
          );
        } else if (
          error.message.includes('BleError') ||
          error.message.includes('Unknown error')
        ) {
          Alert.alert(
            'Scan Failed',
            'Please ensure Location Services are enabled in Settings > Privacy & Security > Location Services, and try again.',
          );
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert('Error', String(error));
      }
      setStatus('Scan failed');
    }
  };

  const connectToDevice = async (device: Device) => {
    if (!client) {
      return;
    }
    setShowDeviceList(false);
    setStatus('Connecting...');
    try {
      const result = await client.connect(device);
      setStatus(`Connected to ${result.deviceName}`);
      client.startHeartbeat();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Bluetooth is not powered on') {
          Alert.alert(
            'Bluetooth Required',
            'Please enable Bluetooth in your device settings and try connecting again.',
          );
        } else if (
          error.message.includes('BleError') ||
          error.message.includes('Unknown error')
        ) {
          Alert.alert(
            'Connection Failed',
            'Please ensure Location Services are enabled in Settings > Privacy & Security > Location Services, and try again.',
          );
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert('Error', String(error));
      }
      setStatus('Connection failed');
    }
  };

  const handleDisconnect = async () => {
    if (!client) {
      return;
    }
    try {
      await client.abstraction.printEnd();
      await client.disconnect();
      setStatus('Disconnected');
      setClient(null);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to disconnect: ' +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  };

  const showPreviewAndPrint = async (
    page: PrintPage,
    printAction: () => Promise<void>,
  ) => {
    try {
      const uri = await page.toPreviewImage();
      setPreviewUri(uri);
      setPendingPrintAction(() => printAction);
      setShowPreview(true);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to generate preview: ' +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  };

  const executePrint = async () => {
    setShowPreview(false);

    if (!client || !client.isConnected()) {
      Alert.alert('Error', 'Not connected');
      setPendingPrintAction(null);
      return;
    }

    if (pendingPrintAction) {
      await pendingPrintAction();
      setPendingPrintAction(null);
    }
  };

  const executePrintTask = async (page: PrintPage, successMessage: string) => {
    if (!client || !client.isConnected()) {
      throw new Error('Not connected');
    }
    try {
      client.stopHeartbeat();
      client.setPacketInterval(0);
      const task = client.createPrintTask({
        totalPages: 1,
        density: 3,
        labelType: 1,
        statusPollIntervalMs: 100,
        statusTimeoutMs: 8000,
      });

      if (!task) {
        throw new Error(
          'Failed to create print task - printer model not detected',
        );
      }

      await task.printInit();
      await task.printPage(page.toEncodedImage(), 1);
      await task.waitForFinished();
      client.startHeartbeat();
      Alert.alert('Success', successMessage);
    } catch (error) {
      client.startHeartbeat();
      Alert.alert(
        'Error',
        'Failed to print: ' +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  };

  const handlePrint = async () => {
    if (!client || !client.isConnected()) {
      Alert.alert('Error', 'Not connected');
      return;
    }

    const page = new PrintPage(8, 1);
    for (let i = 0; i < 8; i++) {
      page.addLine({ x: i, y: 0, endX: i, endY: 0, thickness: 1 });
    }

    await executePrintTask(page, 'Print sent');
  };

  const handlePrintBoldText = async () => {
    const page = new PrintPage(400, 240);
    const { FontStyle } = require('@shopify/react-native-skia');

    page.addText('Normal Text', {
      x: 200,
      y: 60,
      fontSize: 18,
      align: 'center',
      vAlign: 'middle',
    });

    page.addText('Bold Text', {
      x: 200,
      y: 120,
      fontSize: 18,
      fontStyle: FontStyle.Bold,
      align: 'center',
      vAlign: 'middle',
    });

    page.addText('Italic Text', {
      x: 200,
      y: 180,
      fontSize: 18,
      fontStyle: FontStyle.Italic,
      align: 'center',
      vAlign: 'middle',
    });

    await showPreviewAndPrint(page, async () => {
      await executePrintTask(page, 'Styled text printed');
    });
  };

  const handlePrintLandscape = async () => {
    const page = new PrintPage(320, 480, 'landscape');

    page.addText('LANDSCAPE MODE', {
      x: 240,
      y: 160,
      fontSize: 24,
      align: 'center',
      vAlign: 'middle',
    });

    page.addQR('Landscape', {
      x: 240,
      y: 240,
      width: 80,
      height: 80,
      align: 'center',
      vAlign: 'middle',
    });

    page.addBarcode('987654321098', {
      encoding: 'CODE128',
      x: 240,
      y: 40,
      align: 'center',
      vAlign: 'middle',
      width: 200,
      height: 60,
    });

    page.addLine({ x: 40, y: 300, endX: 440, endY: 300, thickness: 2 });

    const heartData = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ];

    page.addPixelData({
      data: heartData,
      imageWidth: 16,
      imageHeight: 11,
      x: 480,
      y: 0,
      width: 80,
      height: 80,
      align: 'right',
      vAlign: 'top',
    });

    await page.addImageFromUri(
      'https://fastly.picsum.photos/id/1/100/100.jpg?hmac=ZFE9J9JWYx84uJzvjw4GTuagMzN4FAmaKE4XeJDMZTY',
      {
        x: 0,
        y: 0,
        width: 100,
        height: 70,
        align: 'left',
        vAlign: 'top',
        threshold: 128,
        buffer: undefined,
      },
    );

    await showPreviewAndPrint(page, async () => {
      await executePrintTask(page, 'Landscape page printed');
    });
  };

  const handlePrintComprehensive = async () => {
    const page = new PrintPage(400, 240);

    // QR Code top left with rotation
    page.addQR('Hello QR', {
      x: 60,
      y: 60,
      width: 80,
      height: 80,
      align: 'center',
      vAlign: 'middle',
      rotate: 15,
    });

    // Title text
    page.addText('NIIMBOT', {
      x: 200,
      y: 30,
      fontSize: 20,
      align: 'center',
      vAlign: 'middle',
    });

    // Heart image center
    const heartData = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ];
    page.addPixelData({
      data: heartData,
      imageWidth: 16,
      imageHeight: 11,
      x: 200,
      y: 80,
      width: 50,
      height: 35,
      align: 'center',
      vAlign: 'middle',
      rotate: 30,
    });

    // Barcode bottom
    page.addBarcode('123456789012', {
      encoding: 'EAN13',
      x: 200,
      y: 180,
      align: 'center',
      vAlign: 'middle',
      width: 150,
      height: 40,
    });

    // Small rotated text top right
    page.addText('v1.0', {
      x: 350,
      y: 30,
      fontSize: 12,
      align: 'center',
      vAlign: 'middle',
      rotate: 45,
    });

    await page.addImageFromUri(
      'https://fastly.picsum.photos/id/1/100/100.jpg?hmac=ZFE9J9JWYx84uJzvjw4GTuagMzN4FAmaKE4XeJDMZTY',
      {
        x: 400,
        y: 240,
        width: 100,
        height: 70,
        align: 'right',
        vAlign: 'bottom',
        threshold: 128,
        buffer: undefined,
      },
    );

    await showPreviewAndPrint(page, async () => {
      await executePrintTask(page, 'Comprehensive demo printed');
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>NiimBlueLibRN</Text>
      <Text style={styles.status}>Status: {status}</Text>

      <TouchableOpacity style={styles.button} onPress={handleConnect}>
        <Text style={styles.buttonText}>🔌 Connect to Printer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleDisconnect}>
        <Text style={styles.buttonText}>⏏️ Disconnect</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handlePrint}>
        <Text style={styles.buttonText}>🖨️ Quick Print Test</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonGroup}
        onPress={handlePrintComprehensive}
      >
        <Text style={styles.buttonText}>📋 All-in-One Demo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonNew} onPress={handlePrintBoldText}>
        <Text style={styles.buttonText}>🅱️ Text Styles Demo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonNew} onPress={handlePrintLandscape}>
        <Text style={styles.buttonText}>📄 Landscape Mode</Text>
      </TouchableOpacity>

      <DeviceSelectionModal
        devices={devices}
        showDeviceList={showDeviceList}
        setShowDeviceList={setShowDeviceList}
        connectToDevice={connectToDevice}
      />
      <PreviewModal
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        previewUri={previewUri}
        onPrint={executePrint}
      />
    </SafeAreaView>
  );
}

const PreviewModal = ({
  showPreview,
  setShowPreview,
  previewUri,
  onPrint,
}: {
  showPreview: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  previewUri: string | null;
  onPrint: () => void;
}) => {
  return (
    <Modal
      visible={showPreview}
      animationType="slide"
      onRequestClose={() => setShowPreview(false)}
    >
      <SafeAreaView style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Preview</Text>
        {previewUri && (
          <Image
            source={{ uri: previewUri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        )}
        <TouchableOpacity style={styles.printButton} onPress={onPrint}>
          <Text style={styles.buttonText}>🖨️ Print</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowPreview(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const DeviceSelectionModal = ({
  showDeviceList,
  setShowDeviceList,
  devices,
  connectToDevice,
}: {
  showDeviceList: boolean;
  setShowDeviceList: React.Dispatch<React.SetStateAction<boolean>>;
  devices: Device[];
  connectToDevice: (device: Device) => Promise<void>;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={showDeviceList}
      animationType="slide"
      onRequestClose={() => setShowDeviceList(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <Text style={styles.modalTitle}>Select Printer</Text>
        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceItem}
              onPress={() => connectToDevice(item)}
            >
              <Text style={styles.deviceName}>
                {item.name || 'Unknown Device'}
              </Text>
              <Text style={styles.deviceId}>{item.id}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowDeviceList(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'red',
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonGroup: {
    backgroundColor: '#5856D6',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonNew: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'red',
  },
  deviceItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 14,
    color: '#666666',
  },
  demoItem: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  demoLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  printButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    width: '80%',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    width: '80%',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'red',
  },
  previewImage: {
    width: 300,
    height: 200,
    marginBottom: 20,
  },
});

export default App;
