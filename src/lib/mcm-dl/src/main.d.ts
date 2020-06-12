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
 * @param file path to modpack file
 * @param type format type of the file contents (eg. 'twitch')
 * @returns `Modpack` or object that extends modpack
 */
declare function createModpack(file: string): any;
export { determineType, createModpack };
