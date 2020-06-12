import Modpack from './Modpack';
declare class Twitch extends Modpack {
    readonly manifest: any;
    constructor(file: string, type: string, author: string, version: string, manifest: any);
    /**
     * Grabs the url from the forge api
     *
     * @param URL complete url
     * @param callback function with URL as argument
     */
    private getURL;
    /**
     * Downloads a individual mod to a path given the url.
     *
     * @param url Direct link to the jar file
     * @param path string location to save to
     * @param callback = callback function when finished, no inputs
     */
    private downloadMod;
    /**
     * Downloads all mods in manifest.json and saves it in a mods folder
     *
     * @param path Location to save mods folder to
     * @param progressCallback
     * @returns Promise
     */
    download(path: string, cb?: Function): Promise<unknown>;
    /**
     * Creates a MutliMC compatible instance
     *
     * Download mods using the download() interface and copies the overrides folder
     *
     * @param path Location to save MultiMC instance to
     */
    createMultiMC(path: string, progressCallback?: Function): Promise<void>;
}
export default Twitch;
