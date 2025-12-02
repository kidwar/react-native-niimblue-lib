/**
 * Commands IDs from client to printer
 *
 * @category Packets
 **/
export declare enum RequestCommandId {
    Invalid = -1,
    /** Entire packet should be prefixed with 0x03 */
    Connect = 193,
    CancelPrint = 218,
    CalibrateHeight = 89,
    Heartbeat = 220,
    LabelPositioningCalibration = 142,
    PageEnd = 227,
    PrinterLog = 5,
    PageStart = 3,
    PrintBitmapRow = 133,
    /** Sent if black pixels < 6 */
    PrintBitmapRowIndexed = 131,
    PrintClear = 32,
    PrintEmptyRow = 132,
    PrintEnd = 243,
    PrinterInfo = 64,
    PrinterConfig = 175,
    PrinterStatusData = 165,
    PrinterReset = 40,
    PrintQuantity = 21,
    PrintStart = 1,
    PrintStatus = 163,
    RfidInfo = 26,
    RfidInfo2 = 28,
    RfidSuccessTimes = 84,
    SetAutoShutdownTime = 39,
    SetDensity = 33,
    SetLabelType = 35,
    /** 2, 4 or 6 bytes */
    SetPageSize = 19,
    SoundSettings = 88,
    /** some info request (niimbot app), 01 long 02 short */
    AntiFake = 11,
    /** same as GetVolumeLevel??? */
    WriteRFID = 112,
    PrintTestPage = 90,
    StartFirmwareUpgrade = 245,
    FirmwareCrc = 145,
    FirmwareCommit = 146,
    FirmwareChunk = 155,
    FirmwareNoMoreChunks = 156,
    PrinterCheckLine = 134,
    GetCurrentTimeFormat = 18,
    /**
     * setPrinterTime: 85, 85, 7, 2, 2, 1, 6, -86, -86
     * sendCompressMode: 85, 85, 7, 4, b, b2, b3, b4
     * setPrinterTime: 85, 85, 7, 8, 1, b, b2, b3, b4, b5, b6, b7, b10, -86, -86
    */
    PrinterConfig2 = 7,
    GetKeyFunction = 9,
    GetPrintQuality = 13,
    GetPrinterConfigurationWifi = 162
}
/**
 * Commands IDs from printer to client
 *
 * @category Packets
 **/
export declare enum ResponseCommandId {
    In_Invalid = -1,
    In_NotSupported = 0,
    In_Connect = 194,
    In_CalibrateHeight = 105,
    In_CancelPrint = 208,
    In_AntiFake = 12,
    In_HeartbeatAdvanced1 = 221,
    In_HeartbeatBasic = 222,
    In_HeartbeatUnknown = 223,
    In_HeartbeatAdvanced2 = 217,
    In_LabelPositioningCalibration = 143,
    In_PageStart = 4,
    In_PrintClear = 48,
    /** Sent by some printers after {@link RequestCommandId.PageEnd} along with {@link ResponseCommandId.In_PageEnd} */
    In_PrinterCheckLine = 211,
    In_PrintEnd = 244,
    In_PrinterConfig = 191,
    In_PrinterLog = 6,
    In_PrinterInfoAutoShutDownTime = 71,
    In_PrinterInfoBluetoothAddress = 77,
    In_PrinterInfoSpeed = 66,
    In_PrinterInfoDensity = 65,
    In_PrinterInfoLanguage = 70,
    In_PrinterInfoChargeLevel = 74,
    In_PrinterInfoHardWareVersion = 76,
    In_PrinterInfoLabelType = 67,
    In_PrinterInfoPrinterCode = 72,
    In_PrinterInfoSerialNumber = 75,
    In_PrinterInfoSoftWareVersion = 73,
    In_PrinterInfoArea = 79,
    In_PrinterStatusData = 181,
    In_PrinterReset = 56,
    In_PrintStatus = 179,
    /** For example, received after {@link RequestCommandId.SetPageSize} when page print is not started. */
    In_PrintError = 219,
    In_PrintQuantity = 22,
    In_PrintStart = 2,
    In_RfidInfo = 27,
    In_RfidInfo2 = 29,
    In_RfidSuccessTimes = 100,
    In_SetAutoShutdownTime = 55,
    In_SetDensity = 49,
    In_SetLabelType = 51,
    In_SetPageSize = 20,
    In_SoundSettings = 104,
    In_PageEnd = 228,
    In_PrinterPageIndex = 224,
    In_PrintTestPage = 106,
    In_WriteRFID = 113,
    In_StartFirmwareUpgrade = 246,
    In_RequestFirmwareCrc = 144,
    In_RequestFirmwareChunk = 154,
    In_FirmwareCheckResult = 157,
    In_FirmwareResult = 158,
    /** Sent before {@link ResponseCommandId.In_PrinterCheckLine } */
    In_ResetTimeout = 198,
    In_GetCurrentTimeFormat = 17,
    In_PrinterConfig2 = 8,
    In_GetKeyFunction = 10,
    In_GetPrintQuality = 13,
    In_GetPrinterConfigurationWifi = 178
}
/**
 * Map request id to response id. null meant no response expected (one way).
 *
 * @category Packets
 **/
export declare const commandsMap: Record<RequestCommandId, ResponseCommandId[] | null>;
export declare const firmwareExchangePackets: {
    tx: RequestCommandId[];
    rx: ResponseCommandId[];
};
