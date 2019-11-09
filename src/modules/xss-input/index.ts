import { ModuleDefinition } from '../../types';
import rawPayloads from './payloads';

function createPayload(payloadId: string, rawReport: string): string {
  const rawPayload = definition.rawPayloads[payloadId];
  return rawPayload.replace(/#\{REPORT\}/g, rawReport);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const definition: ModuleDefinition = {
  name: 'xss-input',
  description: 'Attempts to perform DOM XSS by injecting attack payloads into HTML input elements.',
  rawPayloads,

  onElementsAdded: async (helper, target, elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLInputElement) || element.dataset.modomXssInput) {
        continue;
      }

      for (const payloadId in definition.rawPayloads) {
        // exit early if a successful attack was detected on the page
        if (helper.hasSucceeded(target)) {
          return;
        }

        element.value = createPayload(payloadId, helper.createReport(null, payloadId));
        const event = new Event('input', { bubbles: true });
        element.dispatchEvent(event);
        await sleep(80);
      }

      // mark element as attacked
      element.dataset.modomXssInput = '1';
    }
  }
};

export default definition;
