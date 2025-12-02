import { EncodedImage } from '../image_encoder';
import { PacketGenerator } from '../packets';
import { AbstractPrintTask, PrintOptionsDefaults } from './AbstractPrintTask';

/**
 * @category Print tasks
 */
export class D110PrintTask extends AbstractPrintTask {
  override printInit(): Promise<void> {
    return this.abstraction.sendAll([
      PacketGenerator.setDensity(
        this.printOptions.density ?? PrintOptionsDefaults.density!,
      ),
      PacketGenerator.setLabelType(
        this.printOptions.labelType ?? PrintOptionsDefaults.labelType!,
      ),
      PacketGenerator.printStart1b(),
    ]);
  }

  override printPage(image: EncodedImage, quantity?: number): Promise<void> {
    this.checkAddPage(quantity ?? 1);

    return this.abstraction.sendAll(
      [
        PacketGenerator.printClear(),
        PacketGenerator.pageStart(),
        PacketGenerator.setPageSize4b(image.rows, image.cols),
        PacketGenerator.setPrintQuantity(quantity ?? 1),
        ...PacketGenerator.writeImageData(image, {
          printheadPixels: this.printheadPixels(),
        }),
        PacketGenerator.pageEnd(),
      ],
      this.printOptions.pageTimeoutMs,
    );
  }

  override waitForFinished(): Promise<void> {
    this.abstraction.setPacketTimeout(
      this.printOptions.statusTimeoutMs ??
        PrintOptionsDefaults.statusTimeoutMs!,
    );

    return this.abstraction
      .waitUntilPrintFinishedByStatusPoll(
        this.printOptions.totalPages ?? PrintOptionsDefaults.totalPages!,
        this.printOptions.statusPollIntervalMs ??
          PrintOptionsDefaults.statusPollIntervalMs!,
      )
      .finally(() => this.abstraction.setDefaultPacketTimeout());
  }
}
