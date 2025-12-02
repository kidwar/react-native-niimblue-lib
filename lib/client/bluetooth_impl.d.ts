import { Device } from 'react-native-ble-plx';
import { ConnectionInfo, NiimbotAbstractClient } from "./abstract_client";
/**
 * @category Client
 */
export declare class BleDefaultConfiguration {
    static readonly SERVICES: string[];
    static readonly NAME_FILTERS: string[];
}
/**
 * Uses [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx)
 *
 * @category Client
 */
export declare class NiimbotBluetoothClient extends NiimbotAbstractClient {
    private bleManager;
    private device?;
    private notifyCharacteristic?;
    private writeCharacteristic?;
    private monitorSubscription?;
    private serviceUuidFilter;
    private onDisconnectCallback?;
    constructor();
    getServiceUuidFilter(): string[];
    setServiceUuidFilter(ids: string[]): void;
    setOnDisconnect(callback: () => void): void;
    listDevices(scanDurationMs?: number): Promise<Device[]>;
    getConnectedDevices(): Promise<Device[]>;
    connect(device?: Device): Promise<ConnectionInfo>;
    private connectToDevice;
    isConnected(): boolean;
    disconnect(): Promise<void>;
    sendRaw(data: Uint8Array, force?: boolean): Promise<void>;
}
