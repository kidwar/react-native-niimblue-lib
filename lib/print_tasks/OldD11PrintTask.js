"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OldD11PrintTask = void 0;
const packets_1 = require("../packets");
const AbstractPrintTask_1 = require("./AbstractPrintTask");
/**
 * @category Print tasks
 */
class OldD11PrintTask extends AbstractPrintTask_1.AbstractPrintTask {
    printInit() {
        return this.abstraction.sendAll([
            packets_1.PacketGenerator.setDensity(this.printOptions.density),
            packets_1.PacketGenerator.setLabelType(this.printOptions.labelType),
            packets_1.PacketGenerator.printStart1b(),
        ]);
    }
    printPage(image, quantity) {
        this.checkAddPage(quantity ?? 1);
        return this.abstraction.sendAll([
            packets_1.PacketGenerator.printClear(),
            packets_1.PacketGenerator.pageStart(),
            packets_1.PacketGenerator.setPageSize2b(image.rows),
            packets_1.PacketGenerator.setPrintQuantity(quantity ?? 1),
            ...packets_1.PacketGenerator.writeImageData(image, { printheadPixels: this.printheadPixels() }),
            packets_1.PacketGenerator.pageEnd(),
        ], this.printOptions.pageTimeoutMs);
    }
    waitForFinished() {
        return this.abstraction.waitUntilPrintFinishedByPageIndex(this.printOptions.totalPages ?? 1, this.printOptions.statusTimeoutMs);
    }
}
exports.OldD11PrintTask = OldD11PrintTask;
