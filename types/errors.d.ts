/**
 * Error logging
 *
 * @export
 * @param {string} error the error code
 * @param {object} conf the user config
 * @param {string} [path] (optional) the path the error occured in
 * @param {string} [props] (optional) the props the error occured with
 * @returns {string} the error code
 */
export default function (error: string, conf?: object, path?: string, props?: string): string;
