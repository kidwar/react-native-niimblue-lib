"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrinterErrorCode = exports.ConnectResult = exports.BatteryChargeLevel = exports.AutoShutdownTime = exports.HeartbeatType = exports.LabelType = exports.SoundSettingsItemType = exports.SoundSettingsType = exports.PrinterInfoType = void 0;
/**
 * Sent with {@link RequestCommandId.PrinterInfo}
 * @category Packets
 **/
var PrinterInfoType;
(function (PrinterInfoType) {
    PrinterInfoType[PrinterInfoType["Density"] = 1] = "Density";
    PrinterInfoType[PrinterInfoType["Speed"] = 2] = "Speed";
    PrinterInfoType[PrinterInfoType["LabelType"] = 3] = "LabelType";
    PrinterInfoType[PrinterInfoType["Language"] = 6] = "Language";
    PrinterInfoType[PrinterInfoType["AutoShutdownTime"] = 7] = "AutoShutdownTime";
    /** See {@link modelsLibrary} */
    PrinterInfoType[PrinterInfoType["PrinterModelId"] = 8] = "PrinterModelId";
    PrinterInfoType[PrinterInfoType["SoftWareVersion"] = 9] = "SoftWareVersion";
    PrinterInfoType[PrinterInfoType["BatteryChargeLevel"] = 10] = "BatteryChargeLevel";
    PrinterInfoType[PrinterInfoType["SerialNumber"] = 11] = "SerialNumber";
    PrinterInfoType[PrinterInfoType["HardWareVersion"] = 12] = "HardWareVersion";
    PrinterInfoType[PrinterInfoType["BluetoothAddress"] = 13] = "BluetoothAddress";
    PrinterInfoType[PrinterInfoType["PrintMode"] = 14] = "PrintMode";
    PrinterInfoType[PrinterInfoType["Area"] = 15] = "Area";
})(PrinterInfoType || (exports.PrinterInfoType = PrinterInfoType = {}));
/** @category Packets */
var SoundSettingsType;
(function (SoundSettingsType) {
    SoundSettingsType[SoundSettingsType["SetSound"] = 1] = "SetSound";
    SoundSettingsType[SoundSettingsType["GetSoundState"] = 2] = "GetSoundState";
})(SoundSettingsType || (exports.SoundSettingsType = SoundSettingsType = {}));
/** @category Packets */
var SoundSettingsItemType;
(function (SoundSettingsItemType) {
    SoundSettingsItemType[SoundSettingsItemType["BluetoothConnectionSound"] = 1] = "BluetoothConnectionSound";
    SoundSettingsItemType[SoundSettingsItemType["PowerSound"] = 2] = "PowerSound";
})(SoundSettingsItemType || (exports.SoundSettingsItemType = SoundSettingsItemType = {}));
/**
 * Sent with {@link RequestCommandId.SetLabelType}.
 *
 * @category Packets
 **/
var LabelType;
(function (LabelType) {
    LabelType[LabelType["Invalid"] = 0] = "Invalid";
    /** Default for most of label printers */
    LabelType[LabelType["WithGaps"] = 1] = "WithGaps";
    LabelType[LabelType["Black"] = 2] = "Black";
    LabelType[LabelType["Continuous"] = 3] = "Continuous";
    LabelType[LabelType["Perforated"] = 4] = "Perforated";
    LabelType[LabelType["Transparent"] = 5] = "Transparent";
    LabelType[LabelType["PvcTag"] = 6] = "PvcTag";
    LabelType[LabelType["BlackMarkGap"] = 10] = "BlackMarkGap";
    LabelType[LabelType["HeatShrinkTube"] = 11] = "HeatShrinkTube";
})(LabelType || (exports.LabelType = LabelType = {}));
/** @category Packets */
var HeartbeatType;
(function (HeartbeatType) {
    HeartbeatType[HeartbeatType["Advanced1"] = 1] = "Advanced1";
    HeartbeatType[HeartbeatType["Basic"] = 2] = "Basic";
    HeartbeatType[HeartbeatType["Unknown"] = 3] = "Unknown";
    HeartbeatType[HeartbeatType["Advanced2"] = 4] = "Advanced2";
})(HeartbeatType || (exports.HeartbeatType = HeartbeatType = {}));
/** @category Packets */
var AutoShutdownTime;
(function (AutoShutdownTime) {
    /** Usually 15 minutes. */
    AutoShutdownTime[AutoShutdownTime["ShutdownTime1"] = 1] = "ShutdownTime1";
    /** Usually 30 minutes. */
    AutoShutdownTime[AutoShutdownTime["ShutdownTime2"] = 2] = "ShutdownTime2";
    /** May be 45 or 60 minutes (depending on model). */
    AutoShutdownTime[AutoShutdownTime["ShutdownTime3"] = 3] = "ShutdownTime3";
    /** May be 60 minutes or never (depending on model). */
    AutoShutdownTime[AutoShutdownTime["ShutdownTime4"] = 4] = "ShutdownTime4";
})(AutoShutdownTime || (exports.AutoShutdownTime = AutoShutdownTime = {}));
/**
 * Battery charge level
 * @category Packets
 **/
var BatteryChargeLevel;
(function (BatteryChargeLevel) {
    BatteryChargeLevel[BatteryChargeLevel["Charge0"] = 0] = "Charge0";
    BatteryChargeLevel[BatteryChargeLevel["Charge25"] = 1] = "Charge25";
    BatteryChargeLevel[BatteryChargeLevel["Charge50"] = 2] = "Charge50";
    BatteryChargeLevel[BatteryChargeLevel["Charge75"] = 3] = "Charge75";
    BatteryChargeLevel[BatteryChargeLevel["Charge100"] = 4] = "Charge100";
})(BatteryChargeLevel || (exports.BatteryChargeLevel = BatteryChargeLevel = {}));
/**
 * {@link ResponseCommandId.In_Connect} status codes.
 * @category Packets
 **/
var ConnectResult;
(function (ConnectResult) {
    ConnectResult[ConnectResult["Disconnect"] = 0] = "Disconnect";
    ConnectResult[ConnectResult["Connected"] = 1] = "Connected";
    ConnectResult[ConnectResult["ConnectedNew"] = 2] = "ConnectedNew";
    ConnectResult[ConnectResult["ConnectedV3"] = 3] = "ConnectedV3";
    ConnectResult[ConnectResult["FirmwareErrors"] = 90] = "FirmwareErrors";
})(ConnectResult || (exports.ConnectResult = ConnectResult = {}));
/**
 * {@link ResponseCommandId.In_PrintError} status codes.
 * @category Packets
 **/
var PrinterErrorCode;
(function (PrinterErrorCode) {
    PrinterErrorCode[PrinterErrorCode["CoverOpen"] = 1] = "CoverOpen";
    /** No paper */
    PrinterErrorCode[PrinterErrorCode["LackPaper"] = 2] = "LackPaper";
    PrinterErrorCode[PrinterErrorCode["LowBattery"] = 3] = "LowBattery";
    PrinterErrorCode[PrinterErrorCode["BatteryException"] = 4] = "BatteryException";
    PrinterErrorCode[PrinterErrorCode["UserCancel"] = 5] = "UserCancel";
    PrinterErrorCode[PrinterErrorCode["DataError"] = 6] = "DataError";
    PrinterErrorCode[PrinterErrorCode["Overheat"] = 7] = "Overheat";
    PrinterErrorCode[PrinterErrorCode["PaperOutException"] = 8] = "PaperOutException";
    PrinterErrorCode[PrinterErrorCode["PrinterBusy"] = 9] = "PrinterBusy";
    PrinterErrorCode[PrinterErrorCode["NoPrinterHead"] = 10] = "NoPrinterHead";
    PrinterErrorCode[PrinterErrorCode["TemperatureLow"] = 11] = "TemperatureLow";
    PrinterErrorCode[PrinterErrorCode["PrinterHeadLoose"] = 12] = "PrinterHeadLoose";
    PrinterErrorCode[PrinterErrorCode["NoRibbon"] = 13] = "NoRibbon";
    PrinterErrorCode[PrinterErrorCode["WrongRibbon"] = 14] = "WrongRibbon";
    PrinterErrorCode[PrinterErrorCode["UsedRibbon"] = 15] = "UsedRibbon";
    PrinterErrorCode[PrinterErrorCode["WrongPaper"] = 16] = "WrongPaper";
    PrinterErrorCode[PrinterErrorCode["SetPaperFail"] = 17] = "SetPaperFail";
    PrinterErrorCode[PrinterErrorCode["SetPrintModeFail"] = 18] = "SetPrintModeFail";
    PrinterErrorCode[PrinterErrorCode["SetPrintDensityFail"] = 19] = "SetPrintDensityFail";
    PrinterErrorCode[PrinterErrorCode["WriteRfidFail"] = 20] = "WriteRfidFail";
    PrinterErrorCode[PrinterErrorCode["SetMarginFail"] = 21] = "SetMarginFail";
    PrinterErrorCode[PrinterErrorCode["CommunicationException"] = 22] = "CommunicationException";
    PrinterErrorCode[PrinterErrorCode["Disconnect"] = 23] = "Disconnect";
    PrinterErrorCode[PrinterErrorCode["CanvasParameterError"] = 24] = "CanvasParameterError";
    PrinterErrorCode[PrinterErrorCode["RotationParameterException"] = 25] = "RotationParameterException";
    PrinterErrorCode[PrinterErrorCode["JsonParameterException"] = 26] = "JsonParameterException";
    PrinterErrorCode[PrinterErrorCode["B3sAbnormalPaperOutput"] = 27] = "B3sAbnormalPaperOutput";
    PrinterErrorCode[PrinterErrorCode["ECheckPaper"] = 28] = "ECheckPaper";
    PrinterErrorCode[PrinterErrorCode["RfidTagNotWritten"] = 29] = "RfidTagNotWritten";
    PrinterErrorCode[PrinterErrorCode["SetPrintDensityNoSupport"] = 30] = "SetPrintDensityNoSupport";
    PrinterErrorCode[PrinterErrorCode["SetPrintModeNoSupport"] = 31] = "SetPrintModeNoSupport";
    PrinterErrorCode[PrinterErrorCode["SetPrintLabelMaterialError"] = 32] = "SetPrintLabelMaterialError";
    PrinterErrorCode[PrinterErrorCode["SetPrintLabelMaterialNoSupport"] = 33] = "SetPrintLabelMaterialNoSupport";
    PrinterErrorCode[PrinterErrorCode["NotSupportWrittenRfid"] = 34] = "NotSupportWrittenRfid";
    PrinterErrorCode[PrinterErrorCode["IllegalPage"] = 50] = "IllegalPage";
    PrinterErrorCode[PrinterErrorCode["IllegalRibbonPage"] = 51] = "IllegalRibbonPage";
    PrinterErrorCode[PrinterErrorCode["ReceiveDataTimeout"] = 52] = "ReceiveDataTimeout";
    PrinterErrorCode[PrinterErrorCode["NonDedicatedRibbon"] = 53] = "NonDedicatedRibbon";
})(PrinterErrorCode || (exports.PrinterErrorCode = PrinterErrorCode = {}));
