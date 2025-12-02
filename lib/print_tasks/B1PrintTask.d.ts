import { EncodedImage } from "../image_encoder";
import { AbstractPrintTask } from "./AbstractPrintTask";
/**
 * @category Print tasks
 */
export declare class B1PrintTask extends AbstractPrintTask {
    printInit(): Promise<void>;
    printPage(image: EncodedImage, quantity?: number): Promise<void>;
    waitForFinished(): Promise<void>;
}
