"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NiimbotBluetoothClient = exports.BleDefaultConfiguration = void 0;
const react_native_ble_plx_1 = require("react-native-ble-plx");
const events_1 = require("../events");
const abstract_client_1 = require("./abstract_client");
const packets_1 = require("../packets");
const utils_1 = require("../utils");
const printer_models_1 = require("../printer_models");
const getAllModelPrefixes = (length = 2) => [...new Set(printer_models_1.modelsLibrary.map((m) => m.model.substring(0, length)))];
/**
 * @category Client
 */
class BleDefaultConfiguration {
}
exports.BleDefaultConfiguration = BleDefaultConfiguration;
BleDefaultConfiguration.SERVICES = ["e7810a71-73ae-499d-8c15-faa9aef0c3f2"];
BleDefaultConfiguration.NAME_FILTERS = getAllModelPrefixes();
/**
 * Uses [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx)
 *
 * @category Client
 */
class NiimbotBluetoothClient extends abstract_client_1.NiimbotAbstractClient {
    constructor() {
        super();
        this.device = undefined;
        this.notifyCharacteristic = undefined;
        this.writeCharacteristic = undefined;
        this.monitorSubscription = undefined; // Subscription from monitor
        this.serviceUuidFilter = BleDefaultConfiguration.SERVICES;
        this.bleManager = new react_native_ble_plx_1.BleManager();
    }
    getServiceUuidFilter() {
        return this.serviceUuidFilter;
    }
    setServiceUuidFilter(ids) {
        this.serviceUuidFilter = ids;
    }
    setOnDisconnect(callback) {
        this.onDisconnectCallback = callback;
    }
    async listDevices(scanDurationMs = 5000) {
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
            const devices = [];
            const timeout = setTimeout(() => {
                this.bleManager.stopDeviceScan();
                resolve(devices);
            }, scanDurationMs);
            this.bleManager.startDeviceScan(null, // Scan all devices
            { allowDuplicates: false }, (error, scannedDevice) => {
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
            });
        });
    }
    async listConnectedDevices() {
        const connectedDevices = await this.bleManager.connectedDevices(this.serviceUuidFilter);
        // Filter by name prefixes
        return connectedDevices.filter(device => BleDefaultConfiguration.NAME_FILTERS.some(prefix => device.name?.startsWith(prefix)));
    }
    async connect(device) {
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
            this.bleManager.startDeviceScan(null, // Scan all devices
            { allowDuplicates: false }, (error, scannedDevice) => {
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
            });
        });
    }
    async connectToDevice(device) {
        console.log('Connecting to device:', device.name);
        this.device = device;
        await device.connect();
        console.log('Connected, discovering services...');
        await device.discoverAllServicesAndCharacteristics();
        const services = await device.services();
        console.log('Services found:', services.length);
        let notifyCharacteristic;
        let writeCharacteristic;
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
        this.monitorSubscription = this.device.monitorCharacteristicForService(this.notifyCharacteristic.serviceUUID, this.notifyCharacteristic.uuid, (error, char) => {
            if (!this.device || !this.device.isConnected)
                return; // Disconnected
            if (error) {
                if (error.message?.includes('cancel') || error.message?.includes('Cancel') || error.message?.includes('disconnected') || error.message?.includes('not connected')) {
                    return; // Ignore cancellation and disconnect errors
                }
                console.error('Monitor error:', error);
                return;
            }
            if (char?.value) {
                const buffer = utils_1.Utils.bufFromBase64(char.value);
                this.processRawPacket(buffer);
            }
        });
        console.log('Monitoring started, negotiating...');
        try {
            await this.initialNegotiate();
            await this.fetchPrinterInfo();
            console.log('Negotiation complete');
        }
        catch (e) {
            console.error("Unable to negotiate:", e);
        }
        const result = {
            deviceName: device.name || 'Unknown',
            result: this.info.connectResult ?? packets_1.ConnectResult.FirmwareErrors,
        };
        this.emit("connect", new events_1.ConnectEvent(result));
        return result;
    }
    isConnected() {
        return this.device !== undefined && this.notifyCharacteristic !== undefined && this.writeCharacteristic !== undefined;
    }
    async disconnect() {
        this.stopHeartbeat();
        this.monitorSubscription?.remove(); // Remove subscription to avoid errors
        this.monitorSubscription = undefined;
        if (this.device?.isConnected) {
            try {
                await this.device.cancelConnection();
            }
            catch (e) {
                if (e instanceof Error && (e.message?.includes('cancelled') || e.message?.includes('Cancelled') || e.message?.includes('disconnected') || e.message?.includes('not connected'))) {
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
    async sendRaw(data, force) {
        const send = async () => {
            if (this.writeCharacteristic === undefined) {
                throw new Error("Write characteristic is not available");
            }
            await utils_1.Utils.sleep(this.packetIntervalMs);
            const base64 = utils_1.Utils.bufToBase64(data);
            if (this.writeCharacteristic.isWritableWithResponse) {
                await this.writeCharacteristic.writeWithResponse(base64);
            }
            else {
                await this.writeCharacteristic.writeWithoutResponse(base64);
            }
            this.emit("rawpacketsent", new events_1.RawPacketSentEvent(data));
        };
        if (force) {
            await send();
        }
        else {
            await this.mutex.runExclusive(send);
        }
    }
}
exports.NiimbotBluetoothClient = NiimbotBluetoothClient;
