/**
 * Utility class to sequentially fetch data from byte array. EOF checks included.
 *
 * @category Packets
 **/
export declare class SequentialDataReader {
    private bytes;
    private offset;
    constructor(bytes: Uint8Array);
    /** Check available bytes */
    canRead(count: number): boolean;
    /** Check available bytes and throw exception if EOF met */
    private willRead;
    /** Skip bytes */
    skip(len: number): void;
    /** Read fixed length bytes */
    readBytes(len: number): Uint8Array;
    /** Read variable length bytes */
    readVBytes(): Uint8Array;
    /** Read variable length string */
    readVString(): string;
    /** Read 8 bit int (big endian) */
    readI8(): number;
    readBool(): boolean;
    /** Read 16 bit int (big endian) */
    readI16(): number;
    /** Check EOF condition */
    end(): void;
}
