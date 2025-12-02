import { ConnectionInfo, PrinterInfo, NiimbotPacket, HeartbeatData } from ".";
/**
 * Base client event
 * @category Events
 */
export declare class NiimbotEvent {
    readonly type: string;
    constructor(type: string);
}
/**
 * Fired when client connected to printer and fetched it's information.
 * @category Events
 */
export declare class ConnectEvent extends NiimbotEvent {
    readonly info: ConnectionInfo;
    constructor(info: ConnectionInfo);
}
/**
 * Fired when client disconnected from printer.
 * @category Events
 */
export declare class DisconnectEvent extends NiimbotEvent {
    constructor();
}
/**
 * Fired when packet received, converted to object and validated (head, tail, checksum).
 * @category Events
 */
export declare class PacketReceivedEvent extends NiimbotEvent {
    readonly packet: NiimbotPacket;
    constructor(packet: NiimbotPacket);
}
/**
 * Fired when packet object sent.
 * @category Events
 */
export declare class PacketSentEvent extends NiimbotEvent {
    readonly packet: NiimbotPacket;
    constructor(packet: NiimbotPacket);
}
/**
 * Fired when raw packet sent to printer.
 * @category Events
 */
export declare class RawPacketSentEvent extends NiimbotEvent {
    readonly data: Uint8Array;
    constructor(data: Uint8Array);
}
/**
 * Fired when raw packet received from printer.
 * @category Events
 */
export declare class RawPacketReceivedEvent extends NiimbotEvent {
    readonly data: Uint8Array;
    constructor(data: Uint8Array);
}
/**
 * Fired when heartbeat packet received and parsed.
 * @category Events
 */
export declare class HeartbeatEvent extends NiimbotEvent {
    readonly data: HeartbeatData;
    constructor(data: HeartbeatData);
}
/**
 * Fired when no response received after heartbeat packet sent.
 * @category Events
 */
export declare class HeartbeatFailedEvent extends NiimbotEvent {
    readonly failedAttempts: number;
    constructor(failedAttempts: number);
}
/**
 * Fired when info fetched from printer (after {@link NiimbotAbstractClient.fetchPrinterInfo} finished).
 * @category Events
 */
export declare class PrinterInfoFetchedEvent extends NiimbotEvent {
    readonly info: PrinterInfo;
    constructor(info: PrinterInfo);
}
/**
 * Fired on print progress received during {@link AbstractPrintTask.waitForFinished}.
 * @category Events
 */
export declare class PrintProgressEvent extends NiimbotEvent {
    /** 0 – n */
    readonly page: number;
    readonly pagesTotal: number;
    /** 0 – 100 */
    readonly pagePrintProgress: number;
    /** 0 – 100 */
    readonly pageFeedProgress: number;
    constructor(page: number, pagesTotal: number, pagePrintProgress: number, pageFeedProgress: number);
}
/**
 * Fired on firmware upload progress during {@link Abstraction.firmwareUpgrade}.
 * @category Events
 */
export declare class FirmwareProgressEvent extends NiimbotEvent {
    readonly currentChunk: number;
    readonly totalChunks: number;
    constructor(currentChunk: number, totalChunks: number);
}
/**
 * Event list for {@link NiimbotAbstractClient}.
 * @category Events
 */
export type ClientEventMap = {
    connect: (event: ConnectEvent) => void;
    disconnect: (event: DisconnectEvent) => void;
    rawpacketsent: (event: RawPacketSentEvent) => void;
    rawpacketreceived: (event: RawPacketReceivedEvent) => void;
    packetreceived: (event: PacketReceivedEvent) => void;
    packetsent: (event: PacketSentEvent) => void;
    heartbeat: (event: HeartbeatEvent) => void;
    heartbeatfailed: (event: HeartbeatFailedEvent) => void;
    printerinfofetched: (event: PrinterInfoFetchedEvent) => void;
    printprogress: (event: PrintProgressEvent) => void;
    firmwareprogress: (event: FirmwareProgressEvent) => void;
};
