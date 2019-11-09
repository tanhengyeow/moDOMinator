import ModuleHelper from './helper';

export interface Metadata {
  id: string;
  value: number | string;
}

export interface AttemptLog {
  id?: string;
  session: string;
  module: string;
  target: string;
  timestamp: number;
}

export interface SuccessLog {
  id?: string;
  session: string;
  module: string;
  target: string;
  payload: string;
  details?: string;
  timestamp: number;
}

export interface Report {
  // Session ID
  s: string;
  // Module name
  m: string;
  // Target URL of the attack (or current URL if not specified)
  t: string;
  // Attack payload ID
  p: string;
  // Additional details or identifying information
  d?: string;
}

export interface AjaxData {
  // The HTTP method used for the request, in uppercase.
  method: string;
  // The request URL.
  url: string;
  body: Document | BodyInit | null;
  headers: Headers;
}

export interface ModuleDefinition {
  // The name of the module. This should consist only of lowercase alphabets and the dash (-) character.
  name: string;
  // The description of the module.
  description: string;
  // The raw payloads used by the module.
  rawPayloads: { [key: string]: string };
  // Performs setup actions when moDOMinator has initialized.
  onInitialize?: (helper: ModuleHelper) => Promise<void>;
  // Performs attack or detection actions given a list of HTML elements that have been added.
  onElementsAdded?: (helper: ModuleHelper, target: string, elements: Element[]) => Promise<void>;
  // Performs attack or detection actions given a completed XMLHttpRequest.
  onAjaxResponse?: (helper: ModuleHelper, target: string, request: XMLHttpRequest, data: AjaxData) => Promise<void>;
  // Performs attack or detection actions given a fetch request and its response.
  onFetchResponse?: (helper: ModuleHelper, target: string, request: Request, response: Response) => Promise<void>;
}
