const CODE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a random alpha-numeric code with the given length.
 */
export function generateCode(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CODE_CHARSET.charAt(Math.floor(Math.random() * CODE_CHARSET.length));
  }
  return result;
}

/**
 * Gets the host name and path name segments of the given URL.
 */
export function getHostAndPath(url: string): string {
  url = url.split('?')[0];
  if (url.includes('://')) {
    url = url.split('://')[1];
  }
  return url;
}

/**
 * Checks whether the given object is a string.
 */
export function isString(obj: any): boolean {
  return typeof obj === 'string' || obj instanceof String;
}
