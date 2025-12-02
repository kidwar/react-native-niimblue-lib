"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NiimbotAbstractClient = void 0;
const eventemitter3_1 = require("eventemitter3");
const async_mutex_1 = require("async-mutex");
const packets_1 = require("../packets");
const printer_models_1 = require("../printer_models");
const events_1 = require("../events");
const print_tasks_1 = require("../print_tasks");
const utils_1 = require("../utils");
const dto_1 = require("../packets/dto");
/**
 * Abstract class representing a client with common functionality for interacting with a printer.
 * Hardware interface must be defined after extending this class.
 *
 * @category Client
 */
class NiimbotAbstractClient extends eventemitter3_1.EventEmitter {
    constructor() {
        super();
        this.info = {};
        this.heartbeatFails = 0;
        this.heartbeatIntervalMs = 2000;
        this.mutex = new async_mutex_1.Mutex();
        this.debug = false;
        this.packetBuf = new Uint8Array();
        /** @see https://github.com/MultiMote/niimblue/issues/5 */
        this.packetIntervalMs = 10;
        this.abstraction = new packets_1.Abstraction(this);
        this.on("connect", () => this.startHeartbeat());
        this.on("disconnect", () => {
            this.stopHeartbeat();
            this.packetBuf = new Uint8Array();
        });
    }
    /**
     * Send packet and wait for response for {@link timeoutMs} milliseconds.
     *
     * If {@link NiimbotPacket.validResponseIds() validResponseIds} is defined, it will wait for packet with this command id.
     *
     * @throws {@link PrintError} when {@link ResponseCommandId.In_PrintError} or {@link ResponseCommandId.In_NotSupported} received.
     *
     * @returns {NiimbotPacket} Packet object.
     */
    async sendPacketWaitResponse(packet, timeoutMs = 1000) {
        return this.mutex.runExclusive(async () => {
            await this.sendPacket(packet, true);
            if (packet.oneWay) {
                return new packets_1.NiimbotPacket(packets_1.ResponseCommandId.In_Invalid, []); // or undefined is better?
            }
            return this.waitForPacket(packet.validResponseIds, true, timeoutMs);
        });
    }
    /**
     * Send wait for response for {@link timeoutMs} milliseconds.
     *
     * If {@link ids} is set, it will wait for packet with this command ids.
     *
     * @throws {@link PrintError} when {@link ResponseCommandId.In_PrintError} or {@link ResponseCommandId.In_NotSupported} received and {@link catchErrorPackets} is true.
     *
     * @returns {NiimbotPacket} Packet object.
     */
    async waitForPacket(ids = [], catchErrorPackets = true, timeoutMs = 1000) {
        return new Promise((resolve, reject) => {
            let timeout = undefined;
            const listener = (evt) => {
                const pktIn = evt.packet;
                const cmdIn = pktIn.command;
                if (ids.length === 0 ||
                    ids.includes(cmdIn) ||
                    (catchErrorPackets && [packets_1.ResponseCommandId.In_PrintError, packets_1.ResponseCommandId.In_NotSupported].includes(cmdIn))) {
                    clearTimeout(timeout);
                    this.off("packetreceived", listener);
                    if (cmdIn === packets_1.ResponseCommandId.In_PrintError) {
                        utils_1.Validators.u8ArrayLengthEquals(pktIn.data, 1);
                        const errorName = packets_1.PrinterErrorCode[pktIn.data[0]] ?? "unknown";
                        reject(new dto_1.PrintError(`Print error ${pktIn.data[0]}: ${errorName}`, pktIn.data[0]));
                    }
                    else if (cmdIn === packets_1.ResponseCommandId.In_NotSupported) {
                        reject(new dto_1.PrintError("Feature not supported", 0));
                    }
                    else {
                        resolve(pktIn);
                    }
                }
            };
            timeout = setTimeout(() => {
                this.off("packetreceived", listener);
                reject(new Error(`Timeout waiting response (waited for ${utils_1.Utils.bufToHex(ids, ", ")})`));
            }, timeoutMs ?? 1000);
            this.on("packetreceived", listener);
        });
    }
    /**
     * Convert raw bytes to packet objects and fire events. Defragmentation included.
     * @param data Bytes to process.
     */
    processRawPacket(data) {
        if (data.byteLength === 0) {
            return;
        }
        if (data instanceof DataView) {
            data = new Uint8Array(data.buffer);
        }
        this.packetBuf = utils_1.Utils.u8ArrayAppend(this.packetBuf, data);
        if (this.packetBuf.length > 1 && !utils_1.Utils.hasSubarrayAtPos(this.packetBuf, packets_1.NiimbotPacket.HEAD, 0)) {
            console.warn("Dropping invalid buffer", utils_1.Utils.bufToHex(this.packetBuf));
            this.packetBuf = new Uint8Array();
        }
        try {
            const packets = packets_1.PacketParser.parsePacketBundle(this.packetBuf);
            if (packets.length > 0) {
                this.emit("rawpacketreceived", new events_1.RawPacketReceivedEvent(this.packetBuf));
                packets.forEach((p) => {
                    this.emit("packetreceived", new events_1.PacketReceivedEvent(p));
                });
                this.packetBuf = new Uint8Array();
            }
        }
        catch (_e) {
            if (this.debug) {
                console.info(`Incomplete packet, ignoring:${utils_1.Utils.bufToHex(this.packetBuf)}`, _e);
            }
        }
    }
    async sendPacket(packet, force) {
        await this.sendRaw(packet.toBytes(), force);
        this.emit("packetsent", new events_1.PacketSentEvent(packet));
    }
    /**
     * Send "connect" packet and fetch the protocol version.
     **/
    async initialNegotiate() {
        const cfg = this.info;
        cfg.connectResult = await this.abstraction.connectResult();
        cfg.protocolVersion = 0;
        if (cfg.connectResult === packets_1.ConnectResult.ConnectedNew) {
            cfg.protocolVersion = 1;
        }
        else if (cfg.connectResult === packets_1.ConnectResult.ConnectedV3) {
            const statusData = await this.abstraction.getPrinterStatusData();
            cfg.protocolVersion = statusData.protocolVersion;
        }
    }
    /**
     * Fetches printer information and stores it.
     */
    async fetchPrinterInfo() {
        this.info.modelId = await this.abstraction.getPrinterModel();
        this.info.serial = (await this.abstraction.getPrinterSerialNumber().catch(console.error)) ?? undefined;
        this.info.mac = (await this.abstraction.getPrinterBluetoothMacAddress().catch(console.error)) ?? undefined;
        this.info.charge = (await this.abstraction.getBatteryChargeLevel().catch(console.error)) ?? undefined;
        this.info.autoShutdownTime = (await this.abstraction.getAutoShutDownTime().catch(console.error)) ?? undefined;
        this.info.labelType = (await this.abstraction.getLabelType().catch(console.error)) ?? undefined;
        this.info.hardwareVersion = (await this.abstraction.getHardwareVersion().catch(console.error)) ?? undefined;
        this.info.softwareVersion = (await this.abstraction.getSoftwareVersion().catch(console.error)) ?? undefined;
        this.emit("printerinfofetched", new events_1.PrinterInfoFetchedEvent(this.info));
        return this.info;
    }
    /**
     * Get the stored information about the printer.
     */
    getPrinterInfo() {
        return this.info;
    }
    /**
     * Set interval for {@link startHeartbeat}.
     *
     * @param intervalMs Heartbeat interval, default is 1000ms
     */
    setHeartbeatInterval(intervalMs) {
        this.heartbeatIntervalMs = intervalMs;
    }
    /**
     * Starts the heartbeat timer, "heartbeat" is emitted after packet received.
     *
     * If you need to change interval, call {@link setHeartbeatInterval} before.
     */
    startHeartbeat() {
        this.heartbeatFails = 0;
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (!this.isConnected())
                return; // Skip if disconnected
            this.abstraction
                .heartbeat()
                .then((data) => {
                this.heartbeatFails = 0;
                this.emit("heartbeat", new events_1.HeartbeatEvent(data));
            })
                .catch((e) => {
                console.error(e);
                this.heartbeatFails++;
                this.emit("heartbeatfailed", new events_1.HeartbeatFailedEvent(this.heartbeatFails));
            });
        }, this.heartbeatIntervalMs);
    }
    /**
     * Stops the heartbeat by clearing the interval timer.
     */
    stopHeartbeat() {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = undefined;
    }
    /**
     * Checks if the heartbeat timer has been started.
     */
    isHeartbeatStarted() {
        return this.heartbeatTimer !== undefined;
    }
    /**
     * Get printer capabilities based on the printer model. Model library is hardcoded.
     **/
    getModelMetadata() {
        if (this.info.modelId === undefined) {
            return undefined;
        }
        return (0, printer_models_1.getPrinterMetaById)(this.info.modelId);
    }
    /**
     * Determine print task version if any.
     **/
    getPrintTaskType() {
        const meta = this.getModelMetadata();
        if (meta === undefined) {
            return undefined;
        }
        return (0, print_tasks_1.findPrintTask)(meta.model, this.getPrinterInfo().protocolVersion);
    }
    /**
     * Create a new print task automatically based on detected printer model.
     **/
    createPrintTask(options) {
        const taskName = this.getPrintTaskType();
        if (taskName) {
            return this.abstraction.newPrintTask(taskName, options);
        }
        return undefined;
    }
    /**
     * Set the interval between packets in milliseconds.
     */
    setPacketInterval(milliseconds) {
        this.packetIntervalMs = milliseconds;
    }
    /**
     * Enable some debug information logging.
     */
    setDebug(value) {
        this.debug = value;
    }
}
exports.NiimbotAbstractClient = NiimbotAbstractClient;
