import { AutoShutdownTime, BatteryChargeLevel, ConnectResult, LabelType, SoundSettingsItemType } from ".";
import { NiimbotAbstractClient } from "../client";
import { PrintTaskName } from "../print_tasks";
import { AbstractPrintTask, PrintOptions } from "../print_tasks/AbstractPrintTask";
import { HeartbeatData, PrinterStatusData, PrintStatus, RfidInfo } from "./dto";
import { NiimbotPacket } from "./packet";
/**
 * Packet sender and parser.
 *
 * @category Packets
 */
export declare class Abstraction {
    private readonly DEFAULT_PACKET_TIMEOUT;
    private client;
    private packetTimeout;
    private statusPollTimer;
    private statusTimeoutTimer;
    constructor(client: NiimbotAbstractClient);
    getClient(): NiimbotAbstractClient;
    getPacketTimeout(): number;
    setPacketTimeout(value: number): void;
    setDefaultPacketTimeout(): void;
    /** Send packet and wait for response */
    send(packet: NiimbotPacket, forceTimeout?: number): Promise<NiimbotPacket>;
    /** Send packet, wait for response, repeat if failed */
    sendRepeatUntilSuccess(packet: NiimbotPacket, attempts: number, forceTimeout?: number): Promise<NiimbotPacket>;
    sendAll(packets: NiimbotPacket[], forceTimeout?: number): Promise<void>;
    getPrintStatus(tries?: number): Promise<PrintStatus>;
    connectResult(): Promise<ConnectResult>;
    getPrinterStatusData(): Promise<PrinterStatusData>;
    getPrinterModel(): Promise<number>;
    private processRfidInfo;
    /** Read paper nfc tag info */
    rfidInfo(): Promise<RfidInfo>;
    /** Read ribbon nfc tag info */
    rfidInfo2(): Promise<RfidInfo>;
    heartbeat(): Promise<HeartbeatData>;
    getBatteryChargeLevel(): Promise<BatteryChargeLevel>;
    getAutoShutDownTime(): Promise<AutoShutdownTime>;
    /** May be wrong, version format varies between models */
    getSoftwareVersion(): Promise<string>;
    /** May be wrong, version format varies between models */
    getHardwareVersion(): Promise<string>;
    setAutoShutDownTime(time: AutoShutdownTime): Promise<void>;
    getLabelType(): Promise<LabelType>;
    getPrinterSerialNumber(): Promise<string>;
    getPrinterBluetoothMacAddress(): Promise<string>;
    isSoundEnabled(soundType: SoundSettingsItemType): Promise<boolean>;
    setSoundEnabled(soundType: SoundSettingsItemType, value: boolean): Promise<void>;
    /** Clear settings */
    printerReset(): Promise<void>;
    waitUntilPrintFinishedByPageIndex(pagesToPrint: number, timeoutMs?: number): Promise<void>;
    /**
     * Poll printer every {@link pollIntervalMs} and resolve when printer pages equals {@link pagesToPrint}, pagePrintProgress=100, pageFeedProgress=100.
     *
     * printprogress event is firing during this process.
     *
     * @param pagesToPrint Total pages to print.
     * @param pollIntervalMs Poll interval in milliseconds.
     */
    waitUntilPrintFinishedByStatusPoll(pagesToPrint: number, pollIntervalMs?: number): Promise<void>;
    /**
     * Poll printer every {@link pollIntervalMs} and resolve when printer pages equals {@link pagesToPrint}.
     *
     * printprogress event is firing during this process.
     *
     * PrintEnd call is not needed after this functions is done running.
     *
     * @param pagesToPrint Total pages to print.
     * @param pollIntervalMs Poll interval in milliseconds.
     */
    waitUntilPrintFinishedByPrintEndPoll(pagesToPrint: number, pollIntervalMs?: number): Promise<void>;
    /** False returned when printEnd refused */
    printEnd(): Promise<boolean>;
    /**
     * When 1 or 2 sent to B1, it starts to throw out some, paper (~15cm)
     * @param value success
     */
    labelPositioningCalibration(value: number): Promise<boolean>;
    firmwareUpgrade(data: Uint8Array, version: string): Promise<void>;
    newPrintTask(name: PrintTaskName, options?: Partial<PrintOptions>): AbstractPrintTask;
}
