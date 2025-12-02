import { NiimbotPacket } from ".";
/**
 * Packet parsers.
 *
 * @category Packets
 **/
export declare class PacketParser {
    /**
     * Parse raw data containing one or more packets.
     *
     * For example, `55554a01044faaaa5555f60101f6aaaa` will be converted to the two NiimbotPackets.
     *
     * @param buf bytes
     * @returns list of packet objects
     */
    static parsePacketBundle(buf: Uint8Array): NiimbotPacket[];
}
