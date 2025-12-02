"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.D110MV4PrintTask = void 0;
const packets_1 = require("../packets");
const AbstractPrintTask_1 = require("./AbstractPrintTask");
/**
 * @category Print tasks
 */
class D110MV4PrintTask extends AbstractPrintTask_1.AbstractPrintTask {
    printInit() {
        return this.abstraction.sendAll([
            packets_1.PacketGenerator.setDensity(this.printOptions.density),
            packets_1.PacketGenerator.setLabelType(this.printOptions.labelType),
            packets_1.PacketGenerator.printStart9b(this.printOptions.totalPages, 0, 1),
        ]);
    }
    async printPage(image, quantity) {
        this.checkAddPage(quantity ?? 1);
        // B21_PRO does not respond on first packet after PrintStart if using Bluetooth connection.
        // Originally PrintStatus is sent, no response waited.
        const statusPacket = packets_1.PacketGenerator.printStatus();
        statusPacket.oneWay = true;
        await this.abstraction.send(statusPacket);
        return this.abstraction.sendAll([
            packets_1.PacketGenerator.setPageSize13b(image.rows, image.cols, quantity ?? 1),
            ...packets_1.PacketGenerator.writeImageData(image, { printheadPixels: this.printheadPixels() }),
            packets_1.PacketGenerator.pageEnd(),
        ], this.printOptions.pageTimeoutMs);
    }
    waitForFinished() {
        this.abstraction.setPacketTimeout(this.printOptions.statusTimeoutMs);
        return this.abstraction
            .waitUntilPrintFinishedByStatusPoll(this.printOptions.totalPages ?? 1, this.printOptions.statusPollIntervalMs)
            .finally(() => this.abstraction.setDefaultPacketTimeout());
    }
    async printEnd() {
        // B21_PRO drops the first packet after PrintEnd.
        // Originally `Heartbeat` is sent, no response waited.
        const pkt = packets_1.PacketGenerator.heartbeat(packets_1.HeartbeatType.Advanced1);
        pkt.oneWay = true;
        await this.abstraction.send(pkt);
        return this.abstraction.printEnd();
    }
}
exports.D110MV4PrintTask = D110MV4PrintTask;
