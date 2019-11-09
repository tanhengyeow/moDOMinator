import { AjaxData } from '@/types';

export interface ScannerListeners {
  onElementsAdded: (elements: Element[]) => Promise<void>;
  onAjaxResponse: (request: XMLHttpRequest, data: AjaxData) => Promise<void>;
  onFetchResponse: (request: Request, response: Response) => Promise<void>;
}

/**
 * Provides detection capability for potential attack surfaces.
 */
class Scanner {
  mutationObserver: MutationObserver;

  constructor(listeners: ScannerListeners) {
    this.mutationObserver = this.initMutationObserver(listeners);
    this.initXmlHttpRequestHook(listeners);
    this.initFetchApiHook(listeners);
  }

  /**
   * Detects the addition of HTML nodes on the document.
   * When initialized, an event will be fired containing all the existing nodes on the document.
   */
  initMutationObserver(listeners: ScannerListeners): MutationObserver {
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach((mutation) => {
        const addedNodes = mutation.addedNodes;
        const elements = Scanner._getAttackableElements(addedNodes, true);
        if (elements.length > 0) {
          listeners.onElementsAdded(elements);
        }
      });
    });

    mutationObserver.observe(document.body, { subtree: true, childList: true });

    const initialNodes = document.querySelectorAll('body :not(.modominator)');

    setTimeout(() => {
      const elements = Scanner._getAttackableElements(initialNodes);
      if (elements.length > 0) {
        listeners.onElementsAdded(elements);
      }
    }, 500);

    return mutationObserver;
  }

  /**
   * Overrides the native XMLHttpRequest object to allow detection of AJAX calls.
   */
  initXmlHttpRequestHook(listeners: ScannerListeners) {
    const _XMLHttpRequest = window.XMLHttpRequest;

    function FakeXMLHttpRequest() {
      const httpRequest = new _XMLHttpRequest();
      const _open = httpRequest.open;
      const _send = httpRequest.send;
      const _setRequestHeader = httpRequest.setRequestHeader;
      const data: AjaxData = { method: '', url: '', body: null, headers: new Headers() };

      httpRequest.open = function(method: string, url: string, async?: boolean,
                                  username?: string | null, password?: string | null) {
        data.method = method.toUpperCase();
        data.url = url;
        _open.apply(httpRequest, [method, url, async as any, username, password]);
      };

      httpRequest.send = function(body?: Document | BodyInit | null) {
        data.body = body === undefined ? null : body;
        _send.apply(httpRequest, [body]);
      };

      httpRequest.setRequestHeader = function(name: string, value: string) {
        data.headers.set(name, value);
        _setRequestHeader.apply(httpRequest, [name, value]);
      };

      httpRequest.addEventListener('loadend', function() {
        listeners.onAjaxResponse(httpRequest, data);
      }, false);

      return httpRequest;
    }

    window.XMLHttpRequest = FakeXMLHttpRequest as any;
  }

  /**
   * Overrides the native fetch function to allow detection of fetch calls.
   */
  initFetchApiHook(listeners: ScannerListeners) {
    const _fetch = window.fetch;
    (window as any).modomFetch = _fetch;

    window.fetch = function(input: RequestInfo, init?: RequestInit) {
      const request = input instanceof Request ? input : new Request(input, init);

      return _fetch.apply(window, [input, init]).then((response) => {
        listeners.onFetchResponse(request, response);
        return response;
      });
    }
  }

  private static _getAttackableElements(nodeList: NodeList, addChildren: boolean = false): Element[] {
    const elements: Element[] = [];

    nodeList.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const element = node as Element;
      if (element.classList.contains('modominator')) {
        return;
      }

      if (addChildren) {
        return elements.push(...Scanner._getAttackableElements(element.querySelectorAll(':not(.modominator')));
      } else {
        elements.push(element);
      }
    });

    return elements;
  }
}

export default Scanner;
