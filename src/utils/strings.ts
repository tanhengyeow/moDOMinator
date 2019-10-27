const CODE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a random alpha-numeric code with the given length.
 */
export function generateCode(length: number) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CODE_CHARSET.charAt(Math.floor(Math.random() * CODE_CHARSET.length));
  }
  return result;
}
