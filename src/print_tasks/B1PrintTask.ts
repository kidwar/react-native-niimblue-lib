import { EncodedImage } from '../image_encoder';
import { PacketGenerator } from '../packets';
import { AbstractPrintTask, PrintOptionsDefaults } from './AbstractPrintTask';

/**
 * @category Print tasks
 */
export class B1PrintTask extends AbstractPrintTask {
  override printInit(): Promise<void> {
    return this.abstraction.sendAll([
      PacketGenerator.setDensity(
        this.printOptions.density ?? PrintOptionsDefaults.density!,
      ),
      PacketGenerator.setLabelType(
        this.printOptions.labelType ?? PrintOptionsDefaults.labelType!,
      ),
      PacketGenerator.printStart7b(
        this.printOptions.totalPages ?? PrintOptionsDefaults.totalPages!,
      ),
    ]);
  }

  override printPage(image: EncodedImage, quantity?: number): Promise<void> {
    this.checkAddPage(quantity ?? 1);

    return this.abstraction.sendAll(
      [
        PacketGenerator.pageStart(),
        PacketGenerator.setPageSize6b(image.rows, image.cols, quantity ?? 1),
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
