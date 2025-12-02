import { EventEmitter } from "eventemitter3";
import { Mutex } from "async-mutex";
import { Abstraction, ConnectResult, NiimbotPacket, ResponseCommandId } from "../packets";
import { PrinterModelMeta } from "../printer_models";
import { ClientEventMap } from "../events";
import { PrintTaskName, AbstractPrintTask, PrintOptions } from "../print_tasks";
import { PrinterInfo } from "../packets/dto";
/**
 * Represents the connection result information.
 *
 * @category Client
 */
export type ConnectionInfo = {
    deviceName?: string;
    result: ConnectResult;
};
/**
 * Abstract class representing a client with common functionality for interacting with a printer.
 * Hardware interface must be defined after extending this class.
 *
 * @category Client
 */
export declare abstract class NiimbotAbstractClient extends EventEmitter<ClientEventMap> {
    readonly abstraction: Abstraction;
    protected info: PrinterInfo;
    private heartbeatTimer?;
    private heartbeatFails;
    private heartbeatIntervalMs;
    protected mutex: Mutex;
    protected debug: boolean;
    private packetBuf;
    /** @see https://github.com/MultiMote/niimblue/issues/5 */
    protected packetIntervalMs: number;
    constructor();
    /**
     * Connect to printer port.
     **/
    abstract connect(): Promise<ConnectionInfo>;
    /**
     * Disconnect from printer port.
     **/
    abstract disconnect(): Promise<void>;
    /**
     * Check if the client is connected.
     */
    abstract isConnected(): boolean;
    /**
     * Send packet and wait for response for {@link timeoutMs} milliseconds.
     *
     * If {@link NiimbotPacket.validResponseIds() validResponseIds} is defined, it will wait for packet with this command id.
     *
     * @throws {@link PrintError} when {@link ResponseCommandId.In_PrintError} or {@link ResponseCommandId.In_NotSupported} received.
     *
     * @returns {NiimbotPacket} Packet object.
     */
    sendPacketWaitResponse(packet: NiimbotPacket, timeoutMs?: number): Promise<NiimbotPacket>;
    /**
     * Send wait for response for {@link timeoutMs} milliseconds.
     *
     * If {@link ids} is set, it will wait for packet with this command ids.
     *
     * @throws {@link PrintError} when {@link ResponseCommandId.In_PrintError} or {@link ResponseCommandId.In_NotSupported} received and {@link catchErrorPackets} is true.
     *
     * @returns {NiimbotPacket} Packet object.
     */
    waitForPacket(ids?: ResponseCommandId[], catchErrorPackets?: boolean, timeoutMs?: number): Promise<NiimbotPacket>;
    /**
     * Convert raw bytes to packet objects and fire events. Defragmentation included.
     * @param data Bytes to process.
     */
    protected processRawPacket(data: DataView | Uint8Array): void;
    /**
     * Send raw bytes to the printer port.
     *
     * @param data Bytes to send.
     * @param force Ignore mutex lock. It used internally and you should avoid using it.
     */
    abstract sendRaw(data: Uint8Array, force?: boolean): Promise<void>;
    sendPacket(packet: NiimbotPacket, force?: boolean): Promise<void>;
    /**
     * Send "connect" packet and fetch the protocol version.
     **/
    protected initialNegotiate(): Promise<void>;
    /**
     * Fetches printer information and stores it.
     */
    fetchPrinterInfo(): Promise<PrinterInfo>;
    /**
     * Get the stored information about the printer.
     */
    getPrinterInfo(): PrinterInfo;
    /**
     * Set interval for {@link startHeartbeat}.
     *
     * @param intervalMs Heartbeat interval, default is 1000ms
     */
    setHeartbeatInterval(intervalMs: number): void;
    /**
     * Starts the heartbeat timer, "heartbeat" is emitted after packet received.
     *
     * If you need to change interval, call {@link setHeartbeatInterval} before.
     */
    startHeartbeat(): void;
    /**
     * Stops the heartbeat by clearing the interval timer.
     */
    stopHeartbeat(): void;
    /**
     * Checks if the heartbeat timer has been started.
     */
    isHeartbeatStarted(): boolean;
    /**
     * Get printer capabilities based on the printer model. Model library is hardcoded.
     **/
    getModelMetadata(): PrinterModelMeta | undefined;
    /**
     * Determine print task version if any.
     **/
    getPrintTaskType(): PrintTaskName | undefined;
    /**
     * Create a new print task automatically based on detected printer model.
     **/
    createPrintTask(options: PrintOptions): AbstractPrintTask | undefined;
    /**
     * Set the interval between packets in milliseconds.
     */
    setPacketInterval(milliseconds: number): void;
    /**
     * Enable some debug information logging.
     */
    setDebug(value: boolean): void;
}
