"use strict";
// Modpack.ts
/**
 * Contains formats that describe a modpack
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Contains information that all modpack format files must adhere
 */
class Modpack {
    /**
    * @param file  Contains the path to the modpack file.
    */
    constructor(file, type, author, version) {
        this.file = file;
        this.type = type;
        this.author = author;
        this.version = version;
    }
}
exports.default = Modpack;
