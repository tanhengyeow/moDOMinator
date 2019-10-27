/**
 * Gets the host and path name of the current URL.
 */
export function getCurrentUrl(): string {
  return window.location.host + window.location.pathname;
}

/**
 * Injects the given CSS rules into the current page.
 */
export function injectCssRules(cssRules: string) {
  let styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.appendChild(document.createTextNode(cssRules));
  document.getElementsByTagName('head')[0].appendChild(styleElement);
}
