"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firmwareExchangePackets = exports.commandsMap = exports.ResponseCommandId = exports.RequestCommandId = void 0;
/**
 * Commands IDs from client to printer
 *
 * @category Packets
 **/
var RequestCommandId;
(function (RequestCommandId) {
    RequestCommandId[RequestCommandId["Invalid"] = -1] = "Invalid";
    /** Entire packet should be prefixed with 0x03 */
    RequestCommandId[RequestCommandId["Connect"] = 193] = "Connect";
    RequestCommandId[RequestCommandId["CancelPrint"] = 218] = "CancelPrint";
    RequestCommandId[RequestCommandId["CalibrateHeight"] = 89] = "CalibrateHeight";
    RequestCommandId[RequestCommandId["Heartbeat"] = 220] = "Heartbeat";
    RequestCommandId[RequestCommandId["LabelPositioningCalibration"] = 142] = "LabelPositioningCalibration";
    RequestCommandId[RequestCommandId["PageEnd"] = 227] = "PageEnd";
    RequestCommandId[RequestCommandId["PrinterLog"] = 5] = "PrinterLog";
    RequestCommandId[RequestCommandId["PageStart"] = 3] = "PageStart";
    RequestCommandId[RequestCommandId["PrintBitmapRow"] = 133] = "PrintBitmapRow";
    /** Sent if black pixels < 6 */
    RequestCommandId[RequestCommandId["PrintBitmapRowIndexed"] = 131] = "PrintBitmapRowIndexed";
    RequestCommandId[RequestCommandId["PrintClear"] = 32] = "PrintClear";
    RequestCommandId[RequestCommandId["PrintEmptyRow"] = 132] = "PrintEmptyRow";
    RequestCommandId[RequestCommandId["PrintEnd"] = 243] = "PrintEnd";
    RequestCommandId[RequestCommandId["PrinterInfo"] = 64] = "PrinterInfo";
    RequestCommandId[RequestCommandId["PrinterConfig"] = 175] = "PrinterConfig";
    RequestCommandId[RequestCommandId["PrinterStatusData"] = 165] = "PrinterStatusData";
    RequestCommandId[RequestCommandId["PrinterReset"] = 40] = "PrinterReset";
    RequestCommandId[RequestCommandId["PrintQuantity"] = 21] = "PrintQuantity";
    RequestCommandId[RequestCommandId["PrintStart"] = 1] = "PrintStart";
    RequestCommandId[RequestCommandId["PrintStatus"] = 163] = "PrintStatus";
    RequestCommandId[RequestCommandId["RfidInfo"] = 26] = "RfidInfo";
    RequestCommandId[RequestCommandId["RfidInfo2"] = 28] = "RfidInfo2";
    RequestCommandId[RequestCommandId["RfidSuccessTimes"] = 84] = "RfidSuccessTimes";
    RequestCommandId[RequestCommandId["SetAutoShutdownTime"] = 39] = "SetAutoShutdownTime";
    RequestCommandId[RequestCommandId["SetDensity"] = 33] = "SetDensity";
    RequestCommandId[RequestCommandId["SetLabelType"] = 35] = "SetLabelType";
    /** 2, 4 or 6 bytes */
    RequestCommandId[RequestCommandId["SetPageSize"] = 19] = "SetPageSize";
    RequestCommandId[RequestCommandId["SoundSettings"] = 88] = "SoundSettings";
    /** some info request (niimbot app), 01 long 02 short */
    RequestCommandId[RequestCommandId["AntiFake"] = 11] = "AntiFake";
    /** same as GetVolumeLevel??? */
    RequestCommandId[RequestCommandId["WriteRFID"] = 112] = "WriteRFID";
    RequestCommandId[RequestCommandId["PrintTestPage"] = 90] = "PrintTestPage";
    RequestCommandId[RequestCommandId["StartFirmwareUpgrade"] = 245] = "StartFirmwareUpgrade";
    RequestCommandId[RequestCommandId["FirmwareCrc"] = 145] = "FirmwareCrc";
    RequestCommandId[RequestCommandId["FirmwareCommit"] = 146] = "FirmwareCommit";
    RequestCommandId[RequestCommandId["FirmwareChunk"] = 155] = "FirmwareChunk";
    RequestCommandId[RequestCommandId["FirmwareNoMoreChunks"] = 156] = "FirmwareNoMoreChunks";
    RequestCommandId[RequestCommandId["PrinterCheckLine"] = 134] = "PrinterCheckLine";
    RequestCommandId[RequestCommandId["GetCurrentTimeFormat"] = 18] = "GetCurrentTimeFormat";
    /**
     * setPrinterTime: 85, 85, 7, 2, 2, 1, 6, -86, -86
     * sendCompressMode: 85, 85, 7, 4, b, b2, b3, b4
     * setPrinterTime: 85, 85, 7, 8, 1, b, b2, b3, b4, b5, b6, b7, b10, -86, -86
    */
    RequestCommandId[RequestCommandId["PrinterConfig2"] = 7] = "PrinterConfig2";
    RequestCommandId[RequestCommandId["GetKeyFunction"] = 9] = "GetKeyFunction";
    RequestCommandId[RequestCommandId["GetPrintQuality"] = 13] = "GetPrintQuality";
    RequestCommandId[RequestCommandId["GetPrinterConfigurationWifi"] = 162] = "GetPrinterConfigurationWifi";
})(RequestCommandId || (exports.RequestCommandId = RequestCommandId = {}));
/**
 * Commands IDs from printer to client
 *
 * @category Packets
 **/
var ResponseCommandId;
(function (ResponseCommandId) {
    ResponseCommandId[ResponseCommandId["In_Invalid"] = -1] = "In_Invalid";
    ResponseCommandId[ResponseCommandId["In_NotSupported"] = 0] = "In_NotSupported";
    ResponseCommandId[ResponseCommandId["In_Connect"] = 194] = "In_Connect";
    ResponseCommandId[ResponseCommandId["In_CalibrateHeight"] = 105] = "In_CalibrateHeight";
    ResponseCommandId[ResponseCommandId["In_CancelPrint"] = 208] = "In_CancelPrint";
    ResponseCommandId[ResponseCommandId["In_AntiFake"] = 12] = "In_AntiFake";
    ResponseCommandId[ResponseCommandId["In_HeartbeatAdvanced1"] = 221] = "In_HeartbeatAdvanced1";
    ResponseCommandId[ResponseCommandId["In_HeartbeatBasic"] = 222] = "In_HeartbeatBasic";
    ResponseCommandId[ResponseCommandId["In_HeartbeatUnknown"] = 223] = "In_HeartbeatUnknown";
    ResponseCommandId[ResponseCommandId["In_HeartbeatAdvanced2"] = 217] = "In_HeartbeatAdvanced2";
    ResponseCommandId[ResponseCommandId["In_LabelPositioningCalibration"] = 143] = "In_LabelPositioningCalibration";
    ResponseCommandId[ResponseCommandId["In_PageStart"] = 4] = "In_PageStart";
    ResponseCommandId[ResponseCommandId["In_PrintClear"] = 48] = "In_PrintClear";
    /** Sent by some printers after {@link RequestCommandId.PageEnd} along with {@link ResponseCommandId.In_PageEnd} */
    ResponseCommandId[ResponseCommandId["In_PrinterCheckLine"] = 211] = "In_PrinterCheckLine";
    ResponseCommandId[ResponseCommandId["In_PrintEnd"] = 244] = "In_PrintEnd";
    ResponseCommandId[ResponseCommandId["In_PrinterConfig"] = 191] = "In_PrinterConfig";
    ResponseCommandId[ResponseCommandId["In_PrinterLog"] = 6] = "In_PrinterLog";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoAutoShutDownTime"] = 71] = "In_PrinterInfoAutoShutDownTime";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoBluetoothAddress"] = 77] = "In_PrinterInfoBluetoothAddress";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoSpeed"] = 66] = "In_PrinterInfoSpeed";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoDensity"] = 65] = "In_PrinterInfoDensity";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoLanguage"] = 70] = "In_PrinterInfoLanguage";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoChargeLevel"] = 74] = "In_PrinterInfoChargeLevel";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoHardWareVersion"] = 76] = "In_PrinterInfoHardWareVersion";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoLabelType"] = 67] = "In_PrinterInfoLabelType";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoPrinterCode"] = 72] = "In_PrinterInfoPrinterCode";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoSerialNumber"] = 75] = "In_PrinterInfoSerialNumber";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoSoftWareVersion"] = 73] = "In_PrinterInfoSoftWareVersion";
    ResponseCommandId[ResponseCommandId["In_PrinterInfoArea"] = 79] = "In_PrinterInfoArea";
    ResponseCommandId[ResponseCommandId["In_PrinterStatusData"] = 181] = "In_PrinterStatusData";
    ResponseCommandId[ResponseCommandId["In_PrinterReset"] = 56] = "In_PrinterReset";
    ResponseCommandId[ResponseCommandId["In_PrintStatus"] = 179] = "In_PrintStatus";
    /** For example, received after {@link RequestCommandId.SetPageSize} when page print is not started. */
    ResponseCommandId[ResponseCommandId["In_PrintError"] = 219] = "In_PrintError";
    ResponseCommandId[ResponseCommandId["In_PrintQuantity"] = 22] = "In_PrintQuantity";
    ResponseCommandId[ResponseCommandId["In_PrintStart"] = 2] = "In_PrintStart";
    ResponseCommandId[ResponseCommandId["In_RfidInfo"] = 27] = "In_RfidInfo";
    ResponseCommandId[ResponseCommandId["In_RfidInfo2"] = 29] = "In_RfidInfo2";
    ResponseCommandId[ResponseCommandId["In_RfidSuccessTimes"] = 100] = "In_RfidSuccessTimes";
    ResponseCommandId[ResponseCommandId["In_SetAutoShutdownTime"] = 55] = "In_SetAutoShutdownTime";
    ResponseCommandId[ResponseCommandId["In_SetDensity"] = 49] = "In_SetDensity";
    ResponseCommandId[ResponseCommandId["In_SetLabelType"] = 51] = "In_SetLabelType";
    ResponseCommandId[ResponseCommandId["In_SetPageSize"] = 20] = "In_SetPageSize";
    ResponseCommandId[ResponseCommandId["In_SoundSettings"] = 104] = "In_SoundSettings";
    ResponseCommandId[ResponseCommandId["In_PageEnd"] = 228] = "In_PageEnd";
    ResponseCommandId[ResponseCommandId["In_PrinterPageIndex"] = 224] = "In_PrinterPageIndex";
    ResponseCommandId[ResponseCommandId["In_PrintTestPage"] = 106] = "In_PrintTestPage";
    ResponseCommandId[ResponseCommandId["In_WriteRFID"] = 113] = "In_WriteRFID";
    ResponseCommandId[ResponseCommandId["In_StartFirmwareUpgrade"] = 246] = "In_StartFirmwareUpgrade";
    ResponseCommandId[ResponseCommandId["In_RequestFirmwareCrc"] = 144] = "In_RequestFirmwareCrc";
    ResponseCommandId[ResponseCommandId["In_RequestFirmwareChunk"] = 154] = "In_RequestFirmwareChunk";
    ResponseCommandId[ResponseCommandId["In_FirmwareCheckResult"] = 157] = "In_FirmwareCheckResult";
    ResponseCommandId[ResponseCommandId["In_FirmwareResult"] = 158] = "In_FirmwareResult";
    /** Sent before {@link ResponseCommandId.In_PrinterCheckLine } */
    ResponseCommandId[ResponseCommandId["In_ResetTimeout"] = 198] = "In_ResetTimeout";
    ResponseCommandId[ResponseCommandId["In_GetCurrentTimeFormat"] = 17] = "In_GetCurrentTimeFormat";
    ResponseCommandId[ResponseCommandId["In_PrinterConfig2"] = 8] = "In_PrinterConfig2";
    ResponseCommandId[ResponseCommandId["In_GetKeyFunction"] = 10] = "In_GetKeyFunction";
    ResponseCommandId[ResponseCommandId["In_GetPrintQuality"] = 13] = "In_GetPrintQuality";
    ResponseCommandId[ResponseCommandId["In_GetPrinterConfigurationWifi"] = 178] = "In_GetPrinterConfigurationWifi";
})(ResponseCommandId || (exports.ResponseCommandId = ResponseCommandId = {}));
var TX = RequestCommandId;
var RX = ResponseCommandId;
/**
 * Map request id to response id. null meant no response expected (one way).
 *
 * @category Packets
 **/
exports.commandsMap = {
    [TX.Invalid]: null,
    [TX.PrintBitmapRow]: null,
    [TX.PrintBitmapRowIndexed]: null,
    [TX.PrintEmptyRow]: null,
    [TX.Connect]: [RX.In_Connect],
    [TX.CancelPrint]: [RX.In_CancelPrint],
    [TX.CalibrateHeight]: [RX.In_CalibrateHeight],
    [TX.Heartbeat]: [RX.In_HeartbeatBasic, RX.In_HeartbeatUnknown, RX.In_HeartbeatAdvanced1, RX.In_HeartbeatAdvanced2],
    [TX.LabelPositioningCalibration]: [RX.In_LabelPositioningCalibration],
    [TX.PageEnd]: [RX.In_PageEnd],
    [TX.PrinterLog]: [RX.In_PrinterLog],
    [TX.PageStart]: [RX.In_PageStart],
    [TX.PrintClear]: [RX.In_PrintClear],
    [TX.PrintEnd]: [RX.In_PrintEnd],
    [TX.PrinterInfo]: [
        RX.In_PrinterInfoArea,
        RX.In_PrinterInfoAutoShutDownTime,
        RX.In_PrinterInfoBluetoothAddress,
        RX.In_PrinterInfoChargeLevel,
        RX.In_PrinterInfoDensity,
        RX.In_PrinterInfoHardWareVersion,
        RX.In_PrinterInfoLabelType,
        RX.In_PrinterInfoLanguage,
        RX.In_PrinterInfoPrinterCode,
        RX.In_PrinterInfoSerialNumber,
        RX.In_PrinterInfoSoftWareVersion,
        RX.In_PrinterInfoSpeed,
    ],
    [TX.PrinterConfig]: [RX.In_PrinterConfig],
    [TX.PrinterStatusData]: [RX.In_PrinterStatusData],
    [TX.PrinterReset]: [RX.In_PrinterReset],
    [TX.PrintQuantity]: [RX.In_PrintQuantity],
    [TX.PrintStart]: [RX.In_PrintStart],
    [TX.PrintStatus]: [RX.In_PrintStatus],
    [TX.RfidInfo]: [RX.In_RfidInfo],
    [TX.RfidInfo2]: [RX.In_RfidInfo2],
    [TX.RfidSuccessTimes]: [RX.In_RfidSuccessTimes],
    [TX.SetAutoShutdownTime]: [RX.In_SetAutoShutdownTime],
    [TX.SetDensity]: [RX.In_SetDensity],
    [TX.SetLabelType]: [RX.In_SetLabelType],
    [TX.SetPageSize]: [RX.In_SetPageSize],
    [TX.SoundSettings]: [RX.In_SoundSettings],
    [TX.AntiFake]: [RX.In_AntiFake],
    [TX.WriteRFID]: [RX.In_WriteRFID],
    [TX.PrintTestPage]: [RX.In_PrintTestPage],
    [TX.StartFirmwareUpgrade]: [RX.In_StartFirmwareUpgrade],
    [TX.FirmwareCrc]: null,
    [TX.FirmwareChunk]: null,
    [TX.FirmwareNoMoreChunks]: null,
    [TX.FirmwareCommit]: null,
    [TX.PrinterCheckLine]: [RX.In_PrinterCheckLine],
    [TX.GetCurrentTimeFormat]: [RX.In_GetCurrentTimeFormat],
    [TX.PrinterConfig2]: [RX.In_PrinterConfig2],
    [TX.GetKeyFunction]: [RX.In_GetKeyFunction],
    [TX.GetPrintQuality]: [RX.In_GetPrintQuality],
    [TX.GetPrinterConfigurationWifi]: [RX.In_GetPrinterConfigurationWifi]
};
exports.firmwareExchangePackets = {
    tx: [TX.FirmwareChunk, TX.FirmwareCrc, TX.FirmwareNoMoreChunks, TX.FirmwareCommit],
    rx: [RX.In_RequestFirmwareCrc, RX.In_RequestFirmwareChunk, RX.In_FirmwareCheckResult, RX.In_FirmwareResult],
};
