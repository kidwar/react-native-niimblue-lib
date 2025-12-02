import { PrintDirection } from "./image_encoder";
/** @category Printer model library */
export declare enum PrinterModel {
    UNKNOWN = "UNKNOWN",
    A20 = "A20",
    A203 = "A203",
    A63 = "A63",
    A8 = "A8",
    A8_P = "A8_P",
    B1 = "B1",
    B11 = "B11",
    B16 = "B16",
    B18 = "B18",
    B18S = "B18S",
    B2 = "B2",
    B203 = "B203",
    B21 = "B21",
    B21_PRO = "B21_PRO",
    B21_C2B = "B21_C2B",
    B21_L2B = "B21_L2B",
    B21S = "B21S",
    B21S_C2B = "B21S_C2B",
    B3 = "B3",
    B31 = "B31",
    B32 = "B32",
    B32R = "B32R",
    B3S = "B3S",
    B3S_P = "B3S_P",
    B4 = "B4",
    B50 = "B50",
    B50W = "B50W",
    BETTY = "BETTY",
    C1 = "C1",
    D101 = "D101",
    D11 = "D11",
    D11_H = "D11_H",
    D11_PRO = "D11_PRO",
    D110 = "D110",
    D110_M = "D110_M",
    D11S = "D11S",
    D41 = "D41",
    D61 = "D61",
    DXX = "DXX",
    EP2M_H = "EP2M_H",
    ET10 = "ET10",
    FUST = "FUST",
    H1 = "H1",
    H1S = "H1S",
    HI_D110 = "HI_D110",
    HI_NB_D11 = "HI_NB_D11",
    JC_M90 = "JC_M90",
    JCB3S = "JCB3S",
    K2 = "K2",
    K3 = "K3",
    K3_W = "K3_W",
    M2_H = "M2_H",
    M3 = "M3",
    MP3K = "MP3K",
    MP3K_W = "MP3K_W",
    N1 = "N1",
    P1 = "P1",
    P18 = "P18",
    P1S = "P1S",
    S1 = "S1",
    S3 = "S3",
    S6 = "S6",
    S6_P = "S6_P",
    T2S = "T2S",
    T6 = "T6",
    T7 = "T7",
    T8 = "T8",
    T8S = "T8S",
    TP2M_H = "TP2M_H",
    Z401 = "Z401"
}
/** @category Printer model library */
export interface PrinterModelMeta {
    model: PrinterModel;
    id: [number, ...number[]];
    dpi: number;
    printDirection: PrintDirection;
    printheadPixels: number;
    paperTypes: number[];
    densityMin: number;
    densityMax: number;
    densityDefault: number;
}
/** @category Printer model library */
export declare const modelsLibrary: PrinterModelMeta[];
/** @category Printer model library */
export declare const getPrinterMetaById: (id: number) => PrinterModelMeta | undefined;
/** @category Printer model library */
export declare const getPrinterMetaByModel: (model: PrinterModel) => PrinterModelMeta | undefined;
