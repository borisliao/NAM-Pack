"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./src/main");
const Modpack_1 = require("./src/Modpack");
const Twitch_1 = require("./src/Twitch");
exports.default = { determineType: main_1.determineType, createModpack: main_1.createModpack, Modpack: Modpack_1.default, Twitch: Twitch_1.default };
