"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NiimbotBluetoothClient = exports.NiimbotAbstractClient = exports.instantiateClient = void 0;
const abstract_client_1 = require("./abstract_client");
Object.defineProperty(exports, "NiimbotAbstractClient", { enumerable: true, get: function () { return abstract_client_1.NiimbotAbstractClient; } });
const bluetooth_impl_1 = require("./bluetooth_impl");
Object.defineProperty(exports, "NiimbotBluetoothClient", { enumerable: true, get: function () { return bluetooth_impl_1.NiimbotBluetoothClient; } });
/** Create new client instance */
const instantiateClient = (t) => {
    if (t === "bluetooth") {
        return new bluetooth_impl_1.NiimbotBluetoothClient();
    }
    throw new Error("Invalid client type");
};
exports.instantiateClient = instantiateClient;
