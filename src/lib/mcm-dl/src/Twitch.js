"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Modpack_1 = require("./Modpack");
const fs = require("fs-extra");
const https = require("https");
const Path = require("path");
const AdmZip = require("adm-zip");
const API = (projectID, fileID) => 'https://addons-ecs.forgesvc.net/api/v2/addon/' + projectID + '/file/' + fileID + '/download-url';
const getFilenameFromUrl = (url) => url.substring(url.lastIndexOf('/') + 1);
class Twitch extends Modpack_1.default {
    constructor(file, type, author, version, manifest) {
        super(file, type, author, version);
        this.manifest = manifest;
    }
    /**
     * Grabs the url from the forge api
     *
     * @param URL complete url
     * @param callback function with URL as argument
     */
    getURL(URL, callback) {
        https.get(URL, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            else if (!/^text\/plain/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                    `Expected text/plain but received ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                // Consume response data to free up memory
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    callback(rawData);
                }
                catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });
    }
    /**
     * Downloads a individual mod to a path given the url.
     *
     * @param url Direct link to the jar file
     * @param path string location to save to
     * @param callback = callback function when finished, no inputs
     */
    downloadMod(url, path, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let rawData = fs.createWriteStream(path);
            https.get(url, (res) => {
                const { statusCode } = res;
                const contentType = res.headers['content-type'];
                let error;
                if (statusCode == 302) {
                    https.get(res.headers.location, (res) => {
                        res.pipe(rawData);
                        res.on('end', () => {
                            rawData.close();
                            callback();
                        });
                    });
                }
                else if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
                }
                if (error) {
                    console.error(error.message);
                    // Consume response data to free up memory
                    res.resume();
                    return;
                }
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
            }).on('finish', () => {
            });
        });
    }
    /**
     * Downloads all mods in manifest.json and saves it in a mods folder
     *
     * @param path Location to save mods folder to
     * @param progressCallback
     * @returns Promise
     */
    download(path, cb = () => { }) {
        const promise = new Promise((resolve, reject) => {
            let files = this.manifest.files;
            if (!files) {
                return resolve();
            } // return ends the function ( does not return a value )
            let savePath;
            // Assure path will contain a mods folder
            if (Path.basename(path) == "mods") {
                savePath = path;
                if (!fs.existsSync(savePath)) {
                    fs.mkdirSync(savePath, { recursive: true });
                }
            }
            else {
                savePath = Path.join(path, 'mods');
                if (!fs.existsSync(savePath)) {
                    fs.mkdirSync(savePath, { recursive: true });
                }
            }
            let downloaded = 0;
            let total = files.length;
            for (let i = 0; i < files.length; i++) {
                let downloadURL = API(files[i].projectID, files[i].fileID);
                this.getURL(downloadURL, (url) => {
                    this.downloadMod(url, Path.join(savePath, getFilenameFromUrl(url)), () => {
                        downloaded++;
                        cb({ percent: downloaded / total, totalDownloaded: downloaded, total: total });
                        if (downloaded == total) {
                            resolve();
                        }
                    });
                });
            }
        });
        return promise;
    }
    /**
     * Creates a MutliMC compatible instance
     *
     * Download mods using the download() interface and copies the overrides folder
     *
     * @param path Location to save MultiMC instance to
     */
    createMultiMC(path, progressCallback = () => { }) {
        return __awaiter(this, void 0, void 0, function* () {
            let folderName = Path.join(path, this.manifest.name);
            fs.mkdirSync(folderName, { recursive: true });
            let mcFolder = Path.join(folderName, '.minecraft');
            let overrideFolder = Path.join(folderName, 'overrides');
            yield this.download(mcFolder, progressCallback);
            let zip = new AdmZip(this.file);
            zip.extractAllTo(folderName, true);
            if (fs.existsSync(overrideFolder)) {
                fs.copySync(overrideFolder, mcFolder);
                fs.removeSync(overrideFolder);
            }
        });
    }
}
exports.default = Twitch;
