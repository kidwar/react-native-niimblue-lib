"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Abstraction = void 0;
const _1 = require(".");
const events_1 = require("../events");
const print_tasks_1 = require("../print_tasks");
const utils_1 = require("../utils");
const data_reader_1 = require("./data_reader");
const dto_1 = require("./dto");
const packet_1 = require("./packet");
const packet_generator_1 = require("./packet_generator");
const crc_32_1 = __importDefault(require("crc-32"));
/**
 * Packet sender and parser.
 *
 * @category Packets
 */
class Abstraction {
    constructor(client) {
        this.DEFAULT_PACKET_TIMEOUT = 1000;
        this.packetTimeout = this.DEFAULT_PACKET_TIMEOUT;
        this.client = client;
    }
    getClient() {
        return this.client;
    }
    getPacketTimeout() {
        return this.packetTimeout;
    }
    setPacketTimeout(value) {
        this.packetTimeout = value;
    }
    setDefaultPacketTimeout() {
        this.packetTimeout = this.DEFAULT_PACKET_TIMEOUT;
    }
    /** Send packet and wait for response */
    async send(packet, forceTimeout) {
        return this.client.sendPacketWaitResponse(packet, forceTimeout ?? this.packetTimeout);
    }
    /** Send packet, wait for response, repeat if failed */
    async sendRepeatUntilSuccess(packet, attempts, forceTimeout) {
        let lastError = new Error("Unknown error");
        for (let attempt = 0; attempt < attempts; attempt++) {
            try {
                return await this.client.sendPacketWaitResponse(packet, forceTimeout ?? this.packetTimeout);
            }
            catch (e) {
                console.warn(`Attempt ${attempt + 1} failed:`, e);
                lastError = e;
            }
        }
        throw lastError;
    }
    async sendAll(packets, forceTimeout) {
        for (const p of packets) {
            await this.send(p, forceTimeout);
        }
    }
    async getPrintStatus(tries = 1) {
        const packet = await this.sendRepeatUntilSuccess(packet_generator_1.PacketGenerator.printStatus(), tries ?? 1);
        utils_1.Validators.u8ArrayLengthAtLeast(packet.data, 4); // can be 8, 10, but ignore it for now
        const r = new data_reader_1.SequentialDataReader(packet.data);
        const page = r.readI16();
        const pagePrintProgress = r.readI8();
        const pageFeedProgress = r.readI8();
        if (packet.dataLength === 10) {
            r.skip(2);
            const error = r.readI8();
            if (error !== 0) {
                throw new dto_1.PrintError(`Print error (${_1.ResponseCommandId[packet.command]} packet flag)`, error);
            }
        }
        return { page, pagePrintProgress, pageFeedProgress };
    }
    async connectResult() {
        const packet = await this.send(packet_generator_1.PacketGenerator.connect());
        utils_1.Validators.u8ArrayLengthAtLeast(packet.data, 1);
        return packet.data[0];
    }
    async getPrinterStatusData() {
        let protocolVersion = 0;
        const packet = await this.send(packet_generator_1.PacketGenerator.getPrinterStatusData());
        let supportColor = 0;
        if (packet.dataLength > 12) {
            supportColor = packet.data[10];
            const n = packet.data[11] * 100 + packet.data[12];
            if (n >= 204 && n < 300) {
                protocolVersion = 3;
            }
            else if (n < 300 || n >= 302) {
                protocolVersion = n >= 302 ? 5 : 0;
            }
            else {
                protocolVersion = 4;
            }
        }
        return {
            supportColor,
            protocolVersion,
        };
    }
    async getPrinterModel() {
        const packet = await this.send(packet_generator_1.PacketGenerator.getPrinterInfo(_1.PrinterInfoType.PrinterModelId));
        utils_1.Validators.u8ArrayLengthAtLeast(packet.data, 1);
        if (packet.data.length === 1) {
            return packet.data[0] << 8;
        }
        utils_1.Validators.u8ArrayLengthEquals(packet.data, 2);
        return utils_1.Utils.bytesToI16(packet.data);
    }
    processRfidInfo(packet) {
        const info = {
            tagPresent: false,
            uuid: "",
            barCode: "",
            serialNumber: "",
            allPaper: -1,
            usedPaper: -1,
            consumablesType: _1.LabelType.Invalid,
        };
        if (packet.dataLength === 1) {
            return info;
        }
        const r = new data_reader_1.SequentialDataReader(packet.data);
        info.tagPresent = true;
        info.uuid = utils_1.Utils.bufToHex(r.readBytes(8), "");
        info.barCode = r.readVString();
        info.serialNumber = r.readVString();
        info.allPaper = r.readI16();
        info.usedPaper = r.readI16();
        info.consumablesType = r.readI8();
        if (r.canRead(2)) {
            info.capacity = r.readI16();
        }
        r.end();
        return info;
    }
    /** Read paper nfc tag info */
    async rfidInfo() {
        const packet = await this.send(packet_generator_1.PacketGenerator.rfidInfo());
        return this.processRfidInfo(packet);
    }
    /** Read ribbon nfc tag info */
    async rfidInfo2() {
        const packet = await this.send(packet_generator_1.PacketGenerator.rfidInfo2());
        return this.processRfidInfo(packet);
    }
    async heartbeat() {
        const packet = await this.send(packet_generator_1.PacketGenerator.heartbeat(_1.HeartbeatType.Advanced1), 500);
        const info = {
            paperState: -1,
            rfidReadState: -1,
            lidClosed: false,
            powerLevel: _1.BatteryChargeLevel.Charge0,
        };
        // originally expected packet length is bound to model id, but we make it more robust and simple
        const len = packet.dataLength;
        const r = new data_reader_1.SequentialDataReader(packet.data);
        if (len === 10) {
            // d110
            r.skip(8);
            info.lidClosed = r.readBool();
            info.powerLevel = r.readI8();
        }
        else if (len === 20) {
            r.skip(18);
            info.paperState = r.readI8();
            info.rfidReadState = r.readI8();
        }
        else if (len === 19) {
            r.skip(15);
            info.lidClosed = r.readBool();
            info.powerLevel = r.readI8();
            info.paperState = r.readI8();
            info.rfidReadState = r.readI8();
        }
        else if (len === 13) {
            // b1
            r.skip(9);
            info.lidClosed = r.readBool();
            info.powerLevel = r.readI8();
            info.paperState = r.readI8();
            info.rfidReadState = r.readI8();
        }
        else {
            throw new Error("Invalid heartbeat length");
        }
        r.end();
        const model = this.client.getPrinterInfo().modelId;
        if (model !== undefined && ![512, 514, 513, 2304, 1792, 3584, 5120, 2560, 3840, 4352, 272].includes(model)) {
            info.lidClosed = !info.lidClosed;
        }
        return info;
    }
    async getBatteryChargeLevel() {
        const packet = await this.send(packet_generator_1.PacketGenerator.getPrinterInfo(_1.PrinterInfoType.BatteryChargeLevel));
        utils_1.Validators.u8ArrayLengthEquals(packet.data, 1);
        return packet.data[0];
    }
    async getAutoShutDownTime() {
        const packet = await this.send(packet_generator_1.PacketGenerator.getPrinterInfo(_1.PrinterInfoType.AutoShutdownTime));
        utils_1.Validators.u8ArrayLengthEquals(packet.data, 1);
        return packet.data[0];
    }
    /** May be wrong, version format varies between models */
    async getSoftwareVersion() {
        const packet = await this.send(packet_generator_1.PacketGenerator.getPrinterInfo(_1.PrinterInfoType.SoftWareVersion));
        utils_1.Validators.u8ArrayLengthEquals(packet.data, 2);
        // todo: find how to determine format
        const v1 = packet.data[1] / 100 + packet.data[0];
        const v2 = (packet.data[0] * 256 + packet.data[1]) / 100.0;
        return `0x${utils_1.Utils.bufToHex(packet.data, "")} (${v1.toFixed(2)} or ${v2.toFixed(2)})`;
    }
    /** May be wrong, version format varies between models */
    async getHardwareVersion() {
        const packet = await this.send(packet_generator_1.PacketGenerator.getPrinterInfo(_1.PrinterInfoType.HardWareVersion));
        utils_1.Validators.u8ArrayLengthEquals(packet.data, 2);
        // todo: find how to determine format
        const v1 = packet.data[1] / 100 + packet.data[0];
        const v2 = (packet.data[0] * 256 + packet.data[1]) / 100.0;
        return `0x${utils_1.Utils.bufToHex(packet.data, "")} (${v1.toFixed(2)} or ${v2.toFixed(2)})`;
    }
    async setAutoShutDownTime(time) {
        await this.send(packet_generator_1.PacketGenerator.setAutoShutDownTime(time));
    }
    async getLabelType() {
        const packet = await this.send(packet_generator_1.PacketGenerator.getPrinterInfo(_1.PrinterInfoType.LabelType));
        utils_1.Validators.u8ArrayLengthEquals(packet.data, 1);
        return packet.data[0];
    }
    async getPrinterSerialNumber() {
        const packet = await this.send(packet_generator_1.PacketGenerator.getPrinterInfo(_1.PrinterInfoType.SerialNumber));
        utils_1.Validators.u8ArrayLengthAtLeast(packet.data, 1);
        if (packet.data.length < 4) {
            return "-1";
        }
        if (packet.data.length >= 8) {
            return utils_1.Utils.u8ArrayToString(packet.data);
        }
        return utils_1.Utils.bufToHex(packet.data.slice(0, 4), "").toUpperCase();
    }
    async getPrinterBluetoothMacAddress() {
        const packet = await this.send(packet_generator_1.PacketGenerator.getPrinterInfo(_1.PrinterInfoType.BluetoothAddress));
        utils_1.Validators.u8ArrayLengthAtLeast(packet.data, 1);
        return utils_1.Utils.bufToHex(packet.data.reverse(), ":");
    }
    async isSoundEnabled(soundType) {
        const packet = await this.send(packet_generator_1.PacketGenerator.getSoundSettings(soundType));
        utils_1.Validators.u8ArrayLengthEquals(packet.data, 3);
        const value = !!packet.data[2];
        return value;
    }
    async setSoundEnabled(soundType, value) {
        await this.send(packet_generator_1.PacketGenerator.setSoundSettings(soundType, value));
    }
    /** Clear settings */
    async printerReset() {
        await this.send(packet_generator_1.PacketGenerator.printerReset());
    }
    async waitUntilPrintFinishedByPageIndex(pagesToPrint, timeoutMs = 5000) {
        return new Promise((resolve, reject) => {
            const listener = (evt) => {
                if (evt.packet.command === _1.ResponseCommandId.In_PrinterPageIndex) {
                    utils_1.Validators.u8ArrayLengthEquals(evt.packet.data, 2);
                    const page = utils_1.Utils.bytesToI16(evt.packet.data);
                    this.client.emit("printprogress", new events_1.PrintProgressEvent(page, pagesToPrint, 100, 100));
                    clearTimeout(this.statusTimeoutTimer);
                    this.statusTimeoutTimer = setTimeout(() => {
                        this.client.off("packetreceived", listener);
                        reject(new Error("Timeout waiting print status"));
                    }, timeoutMs ?? 5000);
                    if (page === pagesToPrint) {
                        clearTimeout(this.statusTimeoutTimer);
                        this.client.off("packetreceived", listener);
                        resolve();
                    }
                }
            };
            clearTimeout(this.statusTimeoutTimer);
            this.statusTimeoutTimer = setTimeout(() => {
                this.client.off("packetreceived", listener);
                reject(new Error("Timeout waiting print status"));
            }, timeoutMs);
            this.client.emit("printprogress", new events_1.PrintProgressEvent(1, pagesToPrint, 0, 0));
            this.client.on("packetreceived", listener);
        });
    }
    /**
     * Poll printer every {@link pollIntervalMs} and resolve when printer pages equals {@link pagesToPrint}, pagePrintProgress=100, pageFeedProgress=100.
     *
     * printprogress event is firing during this process.
     *
     * @param pagesToPrint Total pages to print.
     * @param pollIntervalMs Poll interval in milliseconds.
     */
    async waitUntilPrintFinishedByStatusPoll(pagesToPrint, pollIntervalMs = 300) {
        return new Promise((resolve, reject) => {
            this.client.emit("printprogress", new events_1.PrintProgressEvent(1, pagesToPrint, 0, 0));
            this.statusPollTimer = setInterval(() => {
                this.getPrintStatus(2)
                    .then((status) => {
                    this.client.emit("printprogress", new events_1.PrintProgressEvent(status.page, pagesToPrint, status.pagePrintProgress, status.pageFeedProgress));
                    if (status.page === pagesToPrint && status.pagePrintProgress === 100 && status.pageFeedProgress === 100) {
                        clearInterval(this.statusPollTimer);
                        resolve();
                    }
                })
                    .catch((e) => {
                    clearInterval(this.statusPollTimer);
                    reject(e);
                });
            }, pollIntervalMs ?? 300);
        });
    }
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
    async waitUntilPrintFinishedByPrintEndPoll(pagesToPrint, pollIntervalMs = 500) {
        return new Promise((resolve, reject) => {
            this.client.emit("printprogress", new events_1.PrintProgressEvent(1, pagesToPrint, 0, 0));
            this.statusPollTimer = setInterval(() => {
                this.printEnd()
                    .then((printEndDone) => {
                    if (!printEndDone) {
                        this.client.emit("printprogress", new events_1.PrintProgressEvent(1, pagesToPrint, 0, 0));
                    }
                    else {
                        this.client.emit("printprogress", new events_1.PrintProgressEvent(pagesToPrint, pagesToPrint, 100, 100));
                        clearInterval(this.statusPollTimer);
                        resolve();
                    }
                })
                    .catch((e) => {
                    clearInterval(this.statusPollTimer);
                    reject(e);
                });
            }, pollIntervalMs ?? 500);
        });
    }
    /** False returned when printEnd refused */
    async printEnd() {
        const response = await this.send(packet_generator_1.PacketGenerator.printEnd());
        utils_1.Validators.u8ArrayLengthEquals(response.data, 1);
        return response.data[0] === 1;
    }
    /**
     * When 1 or 2 sent to B1, it starts to throw out some, paper (~15cm)
     * @param value success
     */
    async labelPositioningCalibration(value) {
        const response = await this.send(packet_generator_1.PacketGenerator.labelPositioningCalibration(value));
        utils_1.Validators.u8ArrayLengthEquals(response.data, 1);
        return response.data[0] === 1;
    }
    async firmwareUpgrade(data, version) {
        const crc = crc_32_1.default.buf(data);
        await this.send(packet_generator_1.PacketGenerator.startFirmwareUpgrade(version));
        await this.client.waitForPacket([_1.ResponseCommandId.In_RequestFirmwareCrc], true, 5000);
        await this.send(packet_generator_1.PacketGenerator.sendFirmwareChecksum(crc));
        const chunkSize = 200;
        const totalChunks = Math.floor(data.byteLength / chunkSize);
        console.log("Chunks to send:", totalChunks);
        // Send chunks
        while (true) {
            const p = await this.client.waitForPacket([_1.ResponseCommandId.In_RequestFirmwareChunk, _1.ResponseCommandId.In_FirmwareResult], true, 5000);
            if (p.command === _1.ResponseCommandId.In_FirmwareResult) {
                //fixme
                throw new Error("Unexpected firmware result");
            }
            if (!(p instanceof packet_1.NiimbotCrc32Packet)) {
                throw new Error("Not a firmware packet");
            }
            if (p.chunkNumber * chunkSize >= data.length) {
                console.log("No more chunks");
                break;
            }
            const part = data.slice(p.chunkNumber * chunkSize, p.chunkNumber * chunkSize + chunkSize);
            await this.send(packet_generator_1.PacketGenerator.sendFirmwareChunk(p.chunkNumber, part));
            this.client.emit("firmwareprogress", new events_1.FirmwareProgressEvent(p.chunkNumber, totalChunks));
        }
        await this.send(packet_generator_1.PacketGenerator.firmwareNoMoreChunks());
        const uploadResult = await this.client.waitForPacket([_1.ResponseCommandId.In_FirmwareCheckResult], true, 5000);
        utils_1.Validators.u8ArrayLengthEquals(uploadResult.data, 1);
        if (uploadResult.data[0] !== 1) {
            throw new Error("Firmware check error (maybe CRC does not match)");
        }
        await this.send(packet_generator_1.PacketGenerator.firmwareCommit());
        const firmwareResult = await this.client.waitForPacket([_1.ResponseCommandId.In_FirmwareResult], true, 5000);
        utils_1.Validators.u8ArrayLengthEquals(firmwareResult.data, 1);
        if (firmwareResult.data[0] !== 1) {
            throw new Error("Firmware error");
        }
    }
    newPrintTask(name, options) {
        return new print_tasks_1.printTasks[name](this, options);
    }
}
exports.Abstraction = Abstraction;
