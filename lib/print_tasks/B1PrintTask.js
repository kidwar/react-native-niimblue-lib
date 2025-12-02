"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B1PrintTask = void 0;
const packets_1 = require("../packets");
const AbstractPrintTask_1 = require("./AbstractPrintTask");
/**
 * @category Print tasks
 */
class B1PrintTask extends AbstractPrintTask_1.AbstractPrintTask {
    printInit() {
        return this.abstraction.sendAll([
            packets_1.PacketGenerator.setDensity(this.printOptions.density),
            packets_1.PacketGenerator.setLabelType(this.printOptions.labelType),
            packets_1.PacketGenerator.printStart7b(this.printOptions.totalPages),
        ]);
    }
    printPage(image, quantity) {
        this.checkAddPage(quantity ?? 1);
        return this.abstraction.sendAll([
            packets_1.PacketGenerator.pageStart(),
            packets_1.PacketGenerator.setPageSize6b(image.rows, image.cols, quantity ?? 1),
            ...packets_1.PacketGenerator.writeImageData(image, { printheadPixels: this.printheadPixels() }),
            packets_1.PacketGenerator.pageEnd(),
        ], this.printOptions.pageTimeoutMs);
    }
    waitForFinished() {
        this.abstraction.setPacketTimeout(this.printOptions.statusTimeoutMs);
        return this.abstraction
            .waitUntilPrintFinishedByStatusPoll(this.printOptions.totalPages, this.printOptions.statusPollIntervalMs)
            .finally(() => this.abstraction.setDefaultPacketTimeout());
    }
}
exports.B1PrintTask = B1PrintTask;
