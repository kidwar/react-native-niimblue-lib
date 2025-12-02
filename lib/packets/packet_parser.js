"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketParser = void 0;
const _1 = require(".");
const utils_1 = require("../utils");
/**
 * Packet parsers.
 *
 * @category Packets
 **/
class PacketParser {
    /**
     * Parse raw data containing one or more packets.
     *
     * For example, `55554a01044faaaa5555f60101f6aaaa` will be converted to the two NiimbotPackets.
     *
     * @param buf bytes
     * @returns list of packet objects
     */
    static parsePacketBundle(buf) {
        const chunks = [];
        const bufLength = buf.byteLength;
        while (buf.byteLength > 0) {
            if (!utils_1.Utils.hasSubarrayAtPos(buf, _1.NiimbotPacket.HEAD, 0)) {
                break;
            }
            if (buf.byteLength < 3) {
                break;
            }
            const cmd = buf[2];
            let cls = _1.NiimbotPacket;
            let sizePos = 3;
            let crcSize = 1;
            //  0  1  2  3  4  5  6  7
            // -----------------------
            // 55 55 4a 01 04 4f aa aa
            //           |     |
            //          size  crc
            if (_1.firmwareExchangePackets.rx.includes(cmd) || _1.firmwareExchangePackets.tx.includes(cmd)) {
                cls = _1.NiimbotCrc32Packet;
                sizePos = 5;
                crcSize = 4;
                //  0  1  2  3  4  5  6  7  8  9 10 11 12
                // --------------------------------------
                // 55 55 9a 00 80 01 01 d2 bd d2 fb aa aa
                //                 |    |---------|
                //                size      crc
            }
            if (buf.byteLength <= sizePos) {
                break;
            }
            const size = buf[sizePos];
            if (buf.byteLength <= sizePos + size + crcSize + _1.NiimbotPacket.TAIL.byteLength) {
                break;
            }
            const tailPos = sizePos + size + crcSize + 1;
            if (!utils_1.Utils.hasSubarrayAtPos(buf, _1.NiimbotPacket.TAIL, tailPos)) {
                console.warn("Invalid tail");
                break;
            }
            const tailEnd = tailPos + _1.NiimbotPacket.TAIL.byteLength;
            chunks.push({ cls, raw: buf.slice(0, tailEnd) });
            // Cut from start
            buf = buf.slice(tailEnd);
        }
        const chunksDataLen = chunks.reduce((acc, c) => acc + c.raw.length, 0);
        if (bufLength !== chunksDataLen) {
            throw new Error(`Splitted chunks data length not equals buffer length (${bufLength} !== ${chunksDataLen})`);
        }
        return chunks.map((c) => c.cls.fromBytes(c.raw));
    }
}
exports.PacketParser = PacketParser;
