import ModuleHelper from '../../helper';
import { ModuleDefinition } from '../../types';
import { isString } from '../../utils/strings';
import rawPayloads from './payloads';

function createPayload(payloadId: string, rawReport: string): string {
  const rawPayload = definition.rawPayloads[payloadId];
  return rawPayload.replace(/#\{REPORT\}/g, rawReport);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findReports(elements: Element[]) {
  for (const element of elements) {
    if (!(element instanceof HTMLElement)) {
      continue;
    }

    const value = element.style.getPropertyValue('--modom');
    if (value.length > 0) {
      (window as any).modom.log(value);
    }
  }
}

async function performAttackJson(request: Request, jsonBody: object): Promise<boolean> {
  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');
  const newRequest = new Request(request, { body: JSON.stringify(jsonBody), headers });

  try {
    const response = await (window as any).modomFetch(newRequest);
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Performs attacks on a POST endpoint that accepts JSON. We first attempt to modify all
 * string fields at the same time, failing which, we perform attacks by modifying one
 * string field at a time.
 */
async function attackJsonPostEndpoint(helper: ModuleHelper, target: string,
                                      request: Request, template: object): Promise<boolean> {
  let hasSuccess = false;
  for (const payloadId in definition.rawPayloads) {
    const result = await attackJsonEndpointOnAllFields(helper, target, request, template, payloadId);
    if (!result && !hasSuccess) {
      break;
    }
    hasSuccess = hasSuccess || result;
    await sleep(50);
  }

  if (hasSuccess) {
    return true;
  }

  for (const key in template) {
    if (!isString((template as any)[key])) {
      continue;
    }

    for (const payloadId in definition.rawPayloads) {
      const payload = createPayload(payloadId, helper.createReport(target, payloadId, 'field:' + key));
      const jsonBody: { [key: string]: any } = Object.assign({}, template);
      jsonBody[key] = payload;

      const result = await performAttackJson(request, jsonBody);
      hasSuccess = hasSuccess || result;
      await sleep(50);
    }
  }

  return hasSuccess;
}

/**
 * Performs an attack on an endpoint that accepts JSON. The attack payload will be inserted
 * into all string fields on the template JSON object.
 */
function attackJsonEndpointOnAllFields(helper: ModuleHelper, target: string,
                                       request: Request, template: object, payloadId = '1'): Promise<boolean> {
  const payload = createPayload(payloadId, helper.createReport(target, payloadId, 'all_fields'));
  const jsonBody: { [key: string]: any } = Object.assign({}, template);

  for (const key in jsonBody) {
    if (isString(jsonBody[key])) {
      jsonBody[key] = payload;
    }
  }

  return performAttackJson(request, jsonBody);
}

const definition: ModuleDefinition = {
  name: 'cssi-stored',
  description: 'Attempts to perform stored CSS injection by sending HTTP requests with injected attack payloads.',
  rawPayloads,

  onElementsAdded: async (helper, target, elements) => {
    findReports(elements);
  },

  onAjaxResponse: async (helper, target, request, data) => {
    if (helper.hasSucceeded(target) || helper.hasCompleted(target) || request.status > 299 ||
        !['POST', 'PATCH', 'PUT'].includes(data.method)) {
      return;
    }

    try {
      const template = JSON.parse(data.body as string);
      if (template.constructor !== Object) {
        return;
      }

      const newRequest = new Request(data.url, { method: data.method, headers: data.headers });

      if (data.method === 'POST') {
        await attackJsonPostEndpoint(helper, target, newRequest, template);
      } else {
        await attackJsonEndpointOnAllFields(helper, target, newRequest, template);
      }

      await helper.markAsCompleted(target);
    } catch (e) {
      return;
    }
  },

  onFetchResponse: async (helper, target, request, response) => {
    if (helper.hasSucceeded(target) || helper.hasCompleted(target) || !response.ok ||
      !['POST', 'PATCH', 'PUT'].includes(request.method)) {
      return;
    }

    try {
      const json = await request.json();
      if (json.constructor !== Object) {
        return;
      }

      const newRequest = new Request(request);

      if (request.method === 'POST') {
        await attackJsonPostEndpoint(helper, target, newRequest, json);
      } else  {
        await attackJsonEndpointOnAllFields(helper, target, newRequest, json);
      }

      await helper.markAsCompleted(target);
    } catch (e) {
      return;
    }
  }
};

export default definition;
