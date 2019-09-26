/**
 * Scans list of DOM elements for web vulnerabilities.
 * @param {object} elements Array of DOM elements.
 */
exports.scanElements = elements => {
  elements.forEach(element => {
    scanElement(element);
  });
}

/**
 * Launches appropriate attack for the current DOM element.
 * @param {*} element DOM element.
 */
const scanElement = element => {
  switch (element.tagName) {
    // TODO: Handle other types of DOM elements and attacks.
    case "INPUT":
      performXSS(element);
      break;
    default:
      console.log("Unknown DOM element.");
  }
}

/**
 * Performs XSS on the selected DOM element.
 * Uses IIFE to notify a successful XSS attack.
 * @param {*} element DOM element to perform XSS on.
 */
const performXSS = element => {
  // TODO: To include other variations of XSS payload.
  let payload1 = `" onerror="(() => {
    alert('XSS succeeded!');
    console.log('XSS succeeded!');
  })()`;

  if (element.tagName === "INPUT") {
    // TODO: Identify more scenarios.

    // Scenario (React): Dangerously set innerHTML.
    let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(element, payload1);
    var event = new Event('input', {
      bubbles: true
    });
    element.dispatchEvent(event);
  }
}
