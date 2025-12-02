import { PrinterModel as M } from "../printer_models";
import { B1PrintTask } from "./B1PrintTask";
import { B21V1PrintTask } from "./B21V1PrintTask";
import { D110PrintTask } from "./D110PrintTask";
import { OldD11PrintTask } from "./OldD11PrintTask";
import { D110MV4PrintTask } from "./D110MV4PrintTask";
/**
 * Define available print tasks.
 * @category Print tasks
 */
export declare const printTasks: {
    D11_V1: typeof OldD11PrintTask;
    D110: typeof D110PrintTask;
    B1: typeof B1PrintTask;
    B21_V1: typeof B21V1PrintTask;
    D110M_V4: typeof D110MV4PrintTask;
};
/**
 * Available print task name type.
 * @category Print tasks
 */
export type PrintTaskName = keyof typeof printTasks;
/**
 * List of available print task names.
 * @category Print tasks
 */
export declare const printTaskNames: PrintTaskName[];
/** @category Printer model library */
export type ModelWithProtocol = {
    /** Model */
    m: M;
    /** Protocol version */
    v: number;
};
/**
 * Define print tasks for models.
 * Model or model with protocol version can be specified.
 * Model with protocol version has priority over just model.
 * @category Print tasks
 */
export declare const modelPrintTasks: Partial<Record<PrintTaskName, (ModelWithProtocol | M)[]>>;
/**
 * Search print task.
 * @category Print tasks
 */
export declare const findPrintTask: (model: M, protocolVersion?: number) => PrintTaskName | undefined;
export type { AbstractPrintTask, PrintOptions } from "./AbstractPrintTask";
export { B1PrintTask, B21V1PrintTask, D110PrintTask, OldD11PrintTask, D110MV4PrintTask as V5PrintTask };
