"use strict";
/**
 * @includeExample example/main.js
 *
 * @module API
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintPage = void 0;
__exportStar(require("./client"), exports);
__exportStar(require("./packets"), exports);
__exportStar(require("./events"), exports);
__exportStar(require("./image_encoder"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./utils/barcode"), exports);
__exportStar(require("./printer_models"), exports);
__exportStar(require("./print_tasks"), exports);
var print_page_1 = require("./fabric-object/print_page");
Object.defineProperty(exports, "PrintPage", { enumerable: true, get: function () { return print_page_1.PrintPage; } });
