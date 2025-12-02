"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NiimbotCrc32Packet = exports.NiimbotPacket = void 0;
const utils_1 = require("../utils");
const _1 = require(".");
const crc_32_1 = __importDefault(require("crc-32"));
/**
 * NIIMBOT packet object
 *
 * @category Packets
 */
class NiimbotPacket {
    constructor(command, data, validResponseIds = []) {
        this._command = command;
        this._data = data instanceof Uint8Array ? data : new Uint8Array(data);
        this._validResponseIds = validResponseIds;
        this._oneWay = false;
    }
    /** Data length (header, command, dataLen, checksum, tail are excluded). */
    get dataLength() {
        return this._data.length;
    }
    get length() {
        return (NiimbotPacket.HEAD.length + // head
            1 + // cmd
            1 + // dataLength
            this.dataLength +
            1 + // checksum
            NiimbotPacket.TAIL.length);
    }
    set oneWay(value) {
        this._oneWay = value;
    }
    get oneWay() {
        return this._oneWay;
    }
    get validResponseIds() {
        return this._validResponseIds;
    }
    set validResponseIds(ids) {
        this._validResponseIds = ids;
    }
    get command() {
        return this._command;
    }
    get data() {
        return this._data;
    }
    get checksum() {
        let checksum = 0;
        checksum ^= this._command;
        checksum ^= this._data.length;
        this._data.forEach((i) => (checksum ^= i));
        return checksum;
    }
    /** [0x55, 0x55, CMD, DATA_LEN, DA =//= TA, CHECKSUM, 0xAA, 0xAA] */
    toBytes() {
        const buf = new ArrayBuffer(NiimbotPacket.HEAD.length + // head
            1 + // cmd
            1 + // dataLength
            this._data.length +
            1 + // checksum
            NiimbotPacket.TAIL.length);
        const arr = new Uint8Array(buf);
        let pos = 0;
        arr.set(NiimbotPacket.HEAD, pos);
        pos += NiimbotPacket.HEAD.length;
        arr[pos] = this._command;
        pos += 1;
        arr[pos] = this._data.length;
        pos += 1;
        arr.set(this._data, pos);
        pos += this._data.length;
        arr[pos] = this.checksum;
        pos += 1;
        arr.set(NiimbotPacket.TAIL, pos);
        if (this._command === _1.RequestCommandId.Connect) {
            // const newArr = new Uint8Array(arr.length + 1);
            // newArr[0] = 3;
            // newArr.set(arr, 1);
            return new Uint8Array([3, ...arr]);
        }
        return arr;
    }
    static fromBytes(buf) {
        const head = new Uint8Array(buf.slice(0, 2));
        const tail = new Uint8Array(buf.slice(buf.length - 2));
        const minPacketSize = NiimbotPacket.HEAD.length + // head
            1 + // cmd
            1 + // dataLength
            1 + // checksum
            NiimbotPacket.TAIL.length;
        if (buf.length < minPacketSize) {
            throw new Error(`Packet is too small (${buf.length} < ${minPacketSize})`);
        }
        utils_1.Validators.u8ArraysEqual(head, NiimbotPacket.HEAD, "Invalid packet head");
        utils_1.Validators.u8ArraysEqual(tail, NiimbotPacket.TAIL, "Invalid packet tail");
        const cmd = buf[2];
        const dataLen = buf[3];
        if (buf.length !== minPacketSize + dataLen) {
            throw new Error(`Invalid packet size (${buf.length} < ${minPacketSize + dataLen})`);
        }
        const data = buf.slice(4, 4 + dataLen);
        const checksum = buf[4 + dataLen];
        const packet = new NiimbotPacket(cmd, data);
        if (packet.checksum !== checksum) {
            throw new Error(`Invalid packet checksum (${packet.checksum} !== ${checksum})`);
        }
        return packet;
    }
}
exports.NiimbotPacket = NiimbotPacket;
NiimbotPacket.HEAD = new Uint8Array([0x55, 0x55]);
NiimbotPacket.TAIL = new Uint8Array([0xaa, 0xaa]);
/**
 * NIIMBOT packet object with CRC32 checksum. Used in firmware process.
 *
 * @category Packets
 */
class NiimbotCrc32Packet extends NiimbotPacket {
    constructor(command, chunkNumber, data, validResponseIds = []) {
        super(command, data, validResponseIds);
        this._chunkNumber = chunkNumber;
    }
    get chunkNumber() {
        return this._chunkNumber;
    }
    /** Calculate CRC checksum from command and data */
    get checksum() {
        const data = [this._command, ...utils_1.Utils.u16ToBytes(this._chunkNumber), this._data.length, ...this._data];
        return crc_32_1.default.buf(data);
    }
    static fromBytes(buf) {
        //throw new Error("Not implemented");
        const head = new Uint8Array(buf.slice(0, 2));
        const tail = new Uint8Array(buf.slice(buf.length - 2));
        const minPacketSize = NiimbotPacket.HEAD.length + // head
            1 + // cmd
            2 + // chunkNumber
            1 + // dataLength
            4 + // checksum
            NiimbotPacket.TAIL.length;
        if (buf.length < minPacketSize) {
            throw new Error(`Packet is too small (${buf.length} < ${minPacketSize})`);
        }
        utils_1.Validators.u8ArraysEqual(head, NiimbotPacket.HEAD, "Invalid packet head");
        utils_1.Validators.u8ArraysEqual(tail, NiimbotPacket.TAIL, "Invalid packet tail");
        const cmd = buf[2];
        const chunkNumber = utils_1.Utils.bytesToI16(buf.slice(3, 5));
        const dataLen = buf[5];
        if (buf.length !== minPacketSize + dataLen) {
            throw new Error(`Invalid packet size (${buf.length} < ${minPacketSize + dataLen})`);
        }
        const data = buf.slice(6, 6 + dataLen);
        const checksum = utils_1.Utils.bytesToI32(buf.slice(6 + dataLen, 6 + dataLen + 4));
        const packet = new NiimbotCrc32Packet(cmd, chunkNumber, data);
        if (packet.checksum !== checksum) {
            throw new Error(`Invalid packet checksum (${packet.checksum} !== ${checksum})`);
        }
        return packet;
    }
    /** [0x55, 0x55, CMD, CHUNK_NUMBER, DATA_SIZE, DA =//= TA, CRC32_CHECKSUM, 0xAA, 0xAA] */
    toBytes() {
        const buf = new ArrayBuffer(NiimbotPacket.HEAD.length + // head
            1 + // cmd
            2 + // chunkNumber
            1 + // dataLength
            this._data.length +
            4 + // checksum
            NiimbotPacket.TAIL.length);
        const arr = new Uint8Array(buf);
        let pos = 0;
        arr.set(NiimbotPacket.HEAD, pos);
        pos += NiimbotPacket.HEAD.length;
        arr[pos] = this._command;
        pos += 1;
        const [h, l] = utils_1.Utils.u16ToBytes(this._chunkNumber);
        arr[pos] = h;
        pos += 1;
        arr[pos] = l;
        pos += 1;
        arr[pos] = this._data.length;
        pos += 1;
        arr.set(this._data, pos);
        pos += this._data.length;
        const crc = this.checksum;
        arr[pos] = (crc >> 24) & 0xff;
        pos += 1;
        arr[pos] = (crc >> 16) & 0xff;
        pos += 1;
        arr[pos] = (crc >> 8) & 0xff;
        pos += 1;
        arr[pos] = crc & 0xff;
        pos += 1;
        arr.set(NiimbotPacket.TAIL, pos);
        return arr;
    }
}
exports.NiimbotCrc32Packet = NiimbotCrc32Packet;
