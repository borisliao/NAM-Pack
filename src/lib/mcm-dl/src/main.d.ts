import Twitch from './Twitch';
/**
 * Atempts to guess the type of modpack.
 *
 * @param file path to modpack file
 * @returns `string` or `null` if error
 */
declare function determineType(file: string): string;
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
declare function createModpack(file: string): any;
/**
 * Creates a Twitch object from a file. Zip file should include manifest.json
 *
 * @param file
 */
declare function createTwitch(file: string): Twitch;
export { determineType, createModpack, createTwitch };
