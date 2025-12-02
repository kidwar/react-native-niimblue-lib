/**
 * Sent with {@link RequestCommandId.PrinterInfo}
 * @category Packets
 **/
export declare enum PrinterInfoType {
    Density = 1,
    Speed = 2,
    LabelType = 3,
    Language = 6,
    AutoShutdownTime = 7,
    /** See {@link modelsLibrary} */
    PrinterModelId = 8,
    SoftWareVersion = 9,
    BatteryChargeLevel = 10,
    SerialNumber = 11,
    HardWareVersion = 12,
    BluetoothAddress = 13,
    PrintMode = 14,
    Area = 15
}
/** @category Packets */
export declare enum SoundSettingsType {
    SetSound = 1,
    GetSoundState = 2
}
/** @category Packets */
export declare enum SoundSettingsItemType {
    BluetoothConnectionSound = 1,
    PowerSound = 2
}
/**
 * Sent with {@link RequestCommandId.SetLabelType}.
 *
 * @category Packets
 **/
export declare enum LabelType {
    Invalid = 0,
    /** Default for most of label printers */
    WithGaps = 1,
    Black = 2,
    Continuous = 3,
    Perforated = 4,
    Transparent = 5,
    PvcTag = 6,
    BlackMarkGap = 10,
    HeatShrinkTube = 11
}
/** @category Packets */
export declare enum HeartbeatType {
    Advanced1 = 1,
    Basic = 2,
    Unknown = 3,
    Advanced2 = 4
}
/** @category Packets */
export declare enum AutoShutdownTime {
    /** Usually 15 minutes. */
    ShutdownTime1 = 1,
    /** Usually 30 minutes. */
    ShutdownTime2 = 2,
    /** May be 45 or 60 minutes (depending on model). */
    ShutdownTime3 = 3,
    /** May be 60 minutes or never (depending on model). */
    ShutdownTime4 = 4
}
/**
 * Battery charge level
 * @category Packets
 **/
export declare enum BatteryChargeLevel {
    Charge0 = 0,
    Charge25 = 1,
    Charge50 = 2,
    Charge75 = 3,
    Charge100 = 4
}
/**
 * {@link ResponseCommandId.In_Connect} status codes.
 * @category Packets
 **/
export declare enum ConnectResult {
    Disconnect = 0,
    Connected = 1,
    ConnectedNew = 2,
    ConnectedV3 = 3,
    FirmwareErrors = 90
}
/**
 * {@link ResponseCommandId.In_PrintError} status codes.
 * @category Packets
 **/
export declare enum PrinterErrorCode {
    CoverOpen = 1,
    /** No paper */
    LackPaper = 2,
    LowBattery = 3,
    BatteryException = 4,
    UserCancel = 5,
    DataError = 6,
    Overheat = 7,
    PaperOutException = 8,
    PrinterBusy = 9,
    NoPrinterHead = 10,
    TemperatureLow = 11,
    PrinterHeadLoose = 12,
    NoRibbon = 13,
    WrongRibbon = 14,
    UsedRibbon = 15,
    WrongPaper = 16,
    SetPaperFail = 17,
    SetPrintModeFail = 18,
    SetPrintDensityFail = 19,
    WriteRfidFail = 20,
    SetMarginFail = 21,
    CommunicationException = 22,
    Disconnect = 23,
    CanvasParameterError = 24,
    RotationParameterException = 25,
    JsonParameterException = 26,
    B3sAbnormalPaperOutput = 27,
    ECheckPaper = 28,
    RfidTagNotWritten = 29,
    SetPrintDensityNoSupport = 30,
    SetPrintModeNoSupport = 31,
    SetPrintLabelMaterialError = 32,
    SetPrintLabelMaterialNoSupport = 33,
    NotSupportWrittenRfid = 34,
    IllegalPage = 50,
    IllegalRibbonPage = 51,
    ReceiveDataTimeout = 52,
    NonDedicatedRibbon = 53
}
