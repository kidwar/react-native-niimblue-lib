"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequentialDataReader = void 0;
const utils_1 = require("../utils");
/**
 * Utility class to sequentially fetch data from byte array. EOF checks included.
 *
 * @category Packets
 **/
class SequentialDataReader {
    constructor(bytes) {
        this.bytes = bytes;
        this.offset = 0;
    }
    /** Check available bytes */
    canRead(count) {
        return this.offset + count <= this.bytes.length;
    }
    /** Check available bytes and throw exception if EOF met */
    willRead(count) {
        if (!this.canRead(count)) {
            throw new Error("Tried to read too much data");
        }
    }
    /** Skip bytes */
    skip(len) {
        this.willRead(len);
        this.offset += len;
    }
    /** Read fixed length bytes */
    readBytes(len) {
        this.willRead(len);
        const part = this.bytes.slice(this.offset, this.offset + len);
        this.offset += len;
        return part;
    }
    /** Read variable length bytes */
    readVBytes() {
        const len = this.readI8();
        const part = this.readBytes(len);
        return part;
    }
    /** Read variable length string */
    readVString() {
        const part = this.readVBytes();
        return utils_1.Utils.u8ArrayToString(part);
    }
    /** Read 8 bit int (big endian) */
    readI8() {
        this.willRead(1);
        const result = this.bytes[this.offset];
        this.offset += 1;
        return result;
    }
    readBool() {
        return this.readI8() > 0;
    }
    /** Read 16 bit int (big endian) */
    readI16() {
        this.willRead(2);
        const part = this.bytes.slice(this.offset, this.offset + 2);
        this.offset += 2;
        return utils_1.Utils.bytesToI16(part);
    }
    /** Check EOF condition */
    end() {
        if (this.offset != this.bytes.length) {
            throw new Error("Extra data left");
        }
    }
}
exports.SequentialDataReader = SequentialDataReader;
