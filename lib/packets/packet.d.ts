import { RequestCommandId, ResponseCommandId } from ".";
/**
 * NIIMBOT packet object
 *
 * @category Packets
 */
export declare class NiimbotPacket {
    static readonly HEAD: Uint8Array<ArrayBuffer>;
    static readonly TAIL: Uint8Array<ArrayBuffer>;
    protected _command: RequestCommandId | ResponseCommandId;
    protected _data: Uint8Array;
    private _validResponseIds;
    /** There can be no response after this request. */
    private _oneWay;
    constructor(command: RequestCommandId | ResponseCommandId, data: Uint8Array | number[], validResponseIds?: ResponseCommandId[]);
    /** Data length (header, command, dataLen, checksum, tail are excluded). */
    get dataLength(): number;
    get length(): number;
    set oneWay(value: boolean);
    get oneWay(): boolean;
    get validResponseIds(): ResponseCommandId[];
    set validResponseIds(ids: ResponseCommandId[]);
    get command(): RequestCommandId | ResponseCommandId;
    get data(): Uint8Array;
    get checksum(): number;
    /** [0x55, 0x55, CMD, DATA_LEN, DA =//= TA, CHECKSUM, 0xAA, 0xAA] */
    toBytes(): Uint8Array;
    static fromBytes(buf: Uint8Array): NiimbotPacket;
}
/**
 * NIIMBOT packet object with CRC32 checksum. Used in firmware process.
 *
 * @category Packets
 */
export declare class NiimbotCrc32Packet extends NiimbotPacket {
    private _chunkNumber;
    constructor(command: RequestCommandId | ResponseCommandId, chunkNumber: RequestCommandId | ResponseCommandId, data: Uint8Array | number[], validResponseIds?: ResponseCommandId[]);
    get chunkNumber(): number;
    /** Calculate CRC checksum from command and data */
    get checksum(): number;
    static fromBytes(buf: Uint8Array): NiimbotCrc32Packet;
    /** [0x55, 0x55, CMD, CHUNK_NUMBER, DATA_SIZE, DA =//= TA, CRC32_CHECKSUM, 0xAA, 0xAA] */
    toBytes(): Uint8Array;
}
