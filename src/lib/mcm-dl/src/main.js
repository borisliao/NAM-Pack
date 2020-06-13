"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTwitch = exports.createModpack = exports.determineType = void 0;
const AdmZip = require("adm-zip");
const path = require("path");
const Twitch_1 = require("./Twitch");
/**
 * Atempts to guess the type of modpack.
 *
 * @param file path to modpack file
 * @returns `string` or `null` if error
 */
function determineType(file) {
    let pathExtention = path.extname(file);
    if (pathExtention == ".zip") {
        let zip = new AdmZip(file);
        let zipEntries = zip.getEntries();
        // Behavior is undefined if there is elements of both types of modpacks. 
        for (let i = 0; i < zipEntries.length; i++) {
            if (zipEntries[i].entryName == "manifest.json") {
                return "twitch";
            }
            else if (zipEntries[i].entryName == "instance.cfg") {
                return "multimc";
            }
        }
        return null;
    }
}
exports.determineType = determineType;
/**
 * Creates a Modpack object or a object that will based on the type of file.
 * Determines the type of file using determineType()
 *
 * **Behavior is undefined if there is elements of both types of modpacks.**
 *
 * @param file path to modpack file
 * @param type format type of the file contents (eg. 'twitch')
 * @returns `Modpack` or object that extends modpack
 */
function createModpack(file) {
    if (determineType(file) == 'twitch') {
        let zip = new AdmZip(file);
        let manifest = JSON.parse(zip.readAsText('manifest.json'));
        let author = manifest.author;
        let version = manifest.version;
        let x = new Twitch_1.default(file, 'twitch', author, version, manifest);
        return x;
    }
    else {
        throw Error('Modpack type is not defined');
    }
}
exports.createModpack = createModpack;
/**
 * Creates a Twitch object from a file. Zip file should include manifest.json
 *
 * @param file
 */
function createTwitch(file) {
    let zip = new AdmZip(file);
    let manifest = JSON.parse(zip.readAsText('manifest.json'));
    let author = manifest.author;
    let version = manifest.version;
    let x = new Twitch_1.default(file, 'twitch', author, version, manifest);
    return x;
}
exports.createTwitch = createTwitch;
