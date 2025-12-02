"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintError = void 0;
/**
 * @category Packets
 */
class PrintError extends Error {
    constructor(message, reasonId) {
        super(message);
        this.reasonId = reasonId;
    }
}
exports.PrintError = PrintError;
