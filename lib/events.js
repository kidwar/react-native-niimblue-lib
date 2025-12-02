"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirmwareProgressEvent = exports.PrintProgressEvent = exports.PrinterInfoFetchedEvent = exports.HeartbeatFailedEvent = exports.HeartbeatEvent = exports.RawPacketReceivedEvent = exports.RawPacketSentEvent = exports.PacketSentEvent = exports.PacketReceivedEvent = exports.DisconnectEvent = exports.ConnectEvent = exports.NiimbotEvent = void 0;
/**
 * Base client event
 * @category Events
 */
class NiimbotEvent {
    constructor(type) {
        this.type = type;
    }
}
exports.NiimbotEvent = NiimbotEvent;
/**
 * Fired when client connected to printer and fetched it's information.
 * @category Events
 */
class ConnectEvent extends NiimbotEvent {
    constructor(info) {
        super("connect");
        this.info = info;
    }
}
exports.ConnectEvent = ConnectEvent;
/**
 * Fired when client disconnected from printer.
 * @category Events
 */
class DisconnectEvent extends NiimbotEvent {
    constructor() {
        super("disconnect");
    }
}
exports.DisconnectEvent = DisconnectEvent;
/**
 * Fired when packet received, converted to object and validated (head, tail, checksum).
 * @category Events
 */
class PacketReceivedEvent extends NiimbotEvent {
    constructor(packet) {
        super("packetreceived");
        this.packet = packet;
    }
}
exports.PacketReceivedEvent = PacketReceivedEvent;
/**
 * Fired when packet object sent.
 * @category Events
 */
class PacketSentEvent extends NiimbotEvent {
    constructor(packet) {
        super("packetsent");
        this.packet = packet;
    }
}
exports.PacketSentEvent = PacketSentEvent;
/**
 * Fired when raw packet sent to printer.
 * @category Events
 */
class RawPacketSentEvent extends NiimbotEvent {
    constructor(data) {
        super("rawpacketsent");
        this.data = data;
    }
}
exports.RawPacketSentEvent = RawPacketSentEvent;
/**
 * Fired when raw packet received from printer.
 * @category Events
 */
class RawPacketReceivedEvent extends NiimbotEvent {
    constructor(data) {
        super("rawpacketreceived");
        this.data = data;
    }
}
exports.RawPacketReceivedEvent = RawPacketReceivedEvent;
/**
 * Fired when heartbeat packet received and parsed.
 * @category Events
 */
class HeartbeatEvent extends NiimbotEvent {
    constructor(data) {
        super("heartbeat");
        this.data = data;
    }
}
exports.HeartbeatEvent = HeartbeatEvent;
/**
 * Fired when no response received after heartbeat packet sent.
 * @category Events
 */
class HeartbeatFailedEvent extends NiimbotEvent {
    constructor(failedAttempts) {
        super("heartbeatfailed");
        this.failedAttempts = failedAttempts;
    }
}
exports.HeartbeatFailedEvent = HeartbeatFailedEvent;
/**
 * Fired when info fetched from printer (after {@link NiimbotAbstractClient.fetchPrinterInfo} finished).
 * @category Events
 */
class PrinterInfoFetchedEvent extends NiimbotEvent {
    constructor(info) {
        super("printerinfofetched");
        this.info = info;
    }
}
exports.PrinterInfoFetchedEvent = PrinterInfoFetchedEvent;
/**
 * Fired on print progress received during {@link AbstractPrintTask.waitForFinished}.
 * @category Events
 */
class PrintProgressEvent extends NiimbotEvent {
    constructor(page, pagesTotal, pagePrintProgress, pageFeedProgress) {
        super("printprogress");
        this.page = page;
        this.pagesTotal = pagesTotal;
        this.pagePrintProgress = pagePrintProgress;
        this.pageFeedProgress = pageFeedProgress;
    }
}
exports.PrintProgressEvent = PrintProgressEvent;
/**
 * Fired on firmware upload progress during {@link Abstraction.firmwareUpgrade}.
 * @category Events
 */
class FirmwareProgressEvent extends NiimbotEvent {
    constructor(currentChunk, totalChunks) {
        super("firmwareprogress");
        this.currentChunk = currentChunk;
        this.totalChunks = totalChunks;
    }
}
exports.FirmwareProgressEvent = FirmwareProgressEvent;
