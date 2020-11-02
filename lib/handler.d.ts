/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export declare function requestAPI<T>(endPoint?: string, init?: RequestInit): Promise<T>;
