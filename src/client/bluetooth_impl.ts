import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { ConnectEvent, RawPacketSentEvent } from "../events";
import { ConnectionInfo, NiimbotAbstractClient } from "./abstract_client";
import { ConnectResult } from "../packets";
import { Utils } from "../utils";
import { modelsLibrary } from "../printer_models";

const getAllModelPrefixes = (length: number = 2): string[] => [...new Set(modelsLibrary.map((m) => m.model.substring(0, length)))];

/**
 * @category Client
 */
export class BleDefaultConfiguration {
  public static readonly SERVICES: string[] = ["e7810a71-73ae-499d-8c15-faa9aef0c3f2"];
  public static readonly NAME_FILTERS: string[] = getAllModelPrefixes();
}

/**
 * Uses [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx)
 *
 * @category Client
 */
export class NiimbotBluetoothClient extends NiimbotAbstractClient {
  private bleManager: BleManager;
  private device?: Device = undefined;
  private notifyCharacteristic?: Characteristic = undefined;
  private writeCharacteristic?: Characteristic = undefined;
  private monitorSubscription?: any = undefined; // Subscription from monitor
  private serviceUuidFilter: string[] = BleDefaultConfiguration.SERVICES;
  private onDisconnectCallback?: () => void;

  constructor() {
    super();
    this.bleManager = new BleManager();
  }

  public getServiceUuidFilter(): string[] {
    return this.serviceUuidFilter;
  }

  public setServiceUuidFilter(ids: string[]): void {
    this.serviceUuidFilter = ids;
  }

  public setOnDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  public async listDevices(scanDurationMs: number = 5000): Promise<Device[]> {
    await this.disconnect();

    let state = await this.bleManager.state();
    // Wait for Bluetooth state to be known (not 'Unknown')
    while (state === 'Unknown') {
      await new Promise(resolve => setTimeout(resolve, 100));
      state = await this.bleManager.state();
    }
    if (state !== 'PoweredOn') {
      throw new Error('Bluetooth is not powered on');
    }

    return new Promise((resolve, reject) => {
      const devices: Device[] = [];
      const timeout = setTimeout(() => {
        this.bleManager.stopDeviceScan();
        resolve(devices);
      }, scanDurationMs);

      this.bleManager.startDeviceScan(
        null, // Scan all devices
        { allowDuplicates: false },
        (error, scannedDevice) => {
          if (error) {
            console.error('Scan error:', error);
            clearTimeout(timeout);
            this.bleManager.stopDeviceScan();
            reject(error);
            return;
          }
          if (scannedDevice) {
            if (BleDefaultConfiguration.NAME_FILTERS.some(prefix => scannedDevice.name?.startsWith(prefix))) {
              devices.push(scannedDevice);
            }
          }
        }
      );
    });
  }

  public async getConnectedDevices(): Promise<Device[]> {
    const connectedDevices = await this.bleManager.connectedDevices(this.serviceUuidFilter);
    // Filter by name prefixes
    return connectedDevices.filter(device =>
      BleDefaultConfiguration.NAME_FILTERS.some(prefix => device.name?.startsWith(prefix))
    );
  }

  public async connect(device?: Device): Promise<ConnectionInfo> {
    if (device) {
      // Connect to specific device
      return this.connectToDevice(device);
    }

    // Original auto-connect logic
    await this.disconnect();

    let state = await this.bleManager.state();
    // Wait for Bluetooth state to be known (not 'Unknown')
    while (state === 'Unknown') {
      await new Promise(resolve => setTimeout(resolve, 100));
      state = await this.bleManager.state();
    }
    console.log('Bluetooth state:', state);
    if (state !== 'PoweredOn') {
      throw new Error('Bluetooth is not powered on');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.bleManager.stopDeviceScan();
        reject(new Error('Device scan timeout or no device found'));
      }, 10000); // 10 seconds timeout

      this.bleManager.startDeviceScan(
        null, // Scan all devices
        { allowDuplicates: false },
        (error, scannedDevice) => {
          console.log('Scanning...', error, scannedDevice);
          if (error) {
            console.error('Scan error:', error);
            clearTimeout(timeout);
            this.bleManager.stopDeviceScan();
            reject(error);
            return;
          }
          if (scannedDevice) {
            console.log('Scanned device:', scannedDevice.name, scannedDevice.id);
            if (BleDefaultConfiguration.NAME_FILTERS.some(prefix => scannedDevice.name?.startsWith(prefix))) {
              console.log('Found matching device:', scannedDevice.name);
              clearTimeout(timeout);
              this.bleManager.stopDeviceScan();
              this.connectToDevice(scannedDevice).then(resolve).catch(reject);
            }
          }
        }
      );
    });
  }

  private async connectToDevice(device: Device): Promise<ConnectionInfo> {
    console.log('Connecting to device:', device.name);
    this.device = device;
    await device.connect();
    console.log('Connected, discovering services...');
    await device.discoverAllServicesAndCharacteristics();

    const services = await device.services();
    console.log('Services found:', services.length);
    let notifyCharacteristic: Characteristic | undefined;
    let writeCharacteristic: Characteristic | undefined;

    // Prefer services in BleDefaultConfiguration.SERVICES
    const preferredServices = services.filter(s => BleDefaultConfiguration.SERVICES.includes(s.uuid));
    const allServices = preferredServices.length > 0 ? preferredServices : services;

    for (const service of allServices) {
      const characteristics = await service.characteristics();
      console.log(`Service ${service.uuid}: ${characteristics.length} characteristics`);
      characteristics.forEach(c => console.log(`  Char ${c.uuid}: notifiable=${c.isNotifiable}, writableWithResp=${c.isWritableWithResponse}, writableWithoutResp=${c.isWritableWithoutResponse}`));
      if (!notifyCharacteristic) {
        notifyCharacteristic = characteristics.find(c => c.isNotifiable);
      }
      if (!writeCharacteristic) {
        writeCharacteristic = characteristics.find(c => c.isWritableWithResponse || c.isWritableWithoutResponse);
      }
      if (notifyCharacteristic && writeCharacteristic) {
        break;
      }
    }

    if (!notifyCharacteristic || !writeCharacteristic) {
      await device.cancelConnection();
      throw new Error('Suitable characteristics not found');
    }

    this.notifyCharacteristic = notifyCharacteristic;
    this.writeCharacteristic = writeCharacteristic;

    // Add disconnect listener
    this.device.onDisconnected((error, device) => {
      console.log('Device disconnected unexpectedly:', error?.message);
      this.onDisconnectCallback?.();
      this.disconnect();
    });

    this.monitorSubscription = this.device.monitorCharacteristicForService(
      this.notifyCharacteristic.serviceUUID,
      this.notifyCharacteristic.uuid,
      (error, char) => {
        if (!this.device || !this.device.isConnected) return; // Disconnected
        if (error) {
          if (error.message?.includes('cancel') || error.message?.includes('Cancel') || error.message?.includes('disconnected')) {
            return; // Ignore cancellation and disconnect errors
          }
          console.error('Monitor error:', error);
          return;
        }
        if (char?.value) {
          const buffer = Utils.bufFromBase64(char.value);
          this.processRawPacket(buffer);
        }
      }
    );

    console.log('Monitoring started, negotiating...');
    try {
      await this.initialNegotiate();
      await this.fetchPrinterInfo();
      console.log('Negotiation complete');
    } catch (e) {
      console.error("Unable to negotiate:", e);
    }

    const result: ConnectionInfo = {
      deviceName: device.name || 'Unknown',
      result: this.info.connectResult ?? ConnectResult.FirmwareErrors,
    };

    this.emit("connect", new ConnectEvent(result));

    return result;
  }

  public isConnected(): boolean {
    return this.device !== undefined && this.notifyCharacteristic !== undefined && this.writeCharacteristic !== undefined;
  }

  public async disconnect() {
    this.stopHeartbeat();
    this.monitorSubscription?.remove(); // Remove subscription to avoid errors
    this.monitorSubscription = undefined;
    if (this.device?.isConnected) {
      try {
        await this.device.cancelConnection();
      } catch (e) {
        if (e instanceof Error && (e.message?.includes('cancelled') || e.message?.includes('Cancelled'))) {
          return; // Ignore cancellation errors
        }
        console.error('Error canceling connection:', e);
      }
    }
    this.device = undefined;
    this.notifyCharacteristic = undefined;
    this.writeCharacteristic = undefined;
    this.info = {};
  }

  public async sendRaw(data: Uint8Array, force?: boolean) {
    const send = async () => {
      if (this.writeCharacteristic === undefined) {
        throw new Error("Write characteristic is not available");
      }
      await Utils.sleep(this.packetIntervalMs);
      const base64 = Utils.bufToBase64(data);
      if (this.writeCharacteristic.isWritableWithResponse) {
        await this.writeCharacteristic.writeWithResponse(base64);
      } else {
        await this.writeCharacteristic.writeWithoutResponse(base64);
      }
      this.emit("rawpacketsent", new RawPacketSentEvent(data));
    };

    if (force) {
      await send();
    } else {
      await this.mutex.runExclusive(send);
    }
  }
}
