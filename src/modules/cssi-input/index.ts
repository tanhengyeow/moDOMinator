import { ModuleDefinition } from '../../types';
import rawPayloads from './payloads';

function createPayload(payloadId: string, rawReport: string): string {
  const rawPayload = definition.rawPayloads[payloadId];
  return rawPayload.replace(/#\{REPORT\}/g, rawReport);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findReports(records: MutationRecord[]) {
  for (const record of records) {
    const node = record.target;
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const value = node.style.getPropertyValue('--modom');
    if (value.length > 0) {
      (window as any).modom.log(value);
    }
  }
}

const definition: ModuleDefinition = {
  name: 'cssi-input',
  description: 'Attempts to perform DOM CSSi by injecting attack payloads into HTML input elements.',
  rawPayloads,

  onInitialize: async () => {
    const mutationObserver = new MutationObserver(function(mutations) {
      findReports(mutations);
    });

    mutationObserver.observe(document.body, {
      attributes : true, attributeFilter : ['style'], subtree: true, childList: true
    });
  },

  onElementsAdded: async (helper, target, elements) => {
    for (const element of elements) {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) ||
          element.dataset.modomCssiInput) {
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
        await sleep(170);
      }

      // mark element as attacked
      element.dataset.modomCssiInput = '1';

      element.value = '';
      const event = new Event('input', { bubbles: true });
      element.dispatchEvent(event);
    }
  }
};

export default definition;
