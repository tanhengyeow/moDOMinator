export interface ScannerListeners {
  onElementsAdded: (elements: Element[]) => Promise<void>;
}

/**
 * Provides detection capability for potential attack surfaces.
 */
class Scanner {
  mutationObserver: MutationObserver;

  constructor(listeners: ScannerListeners) {
    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach((mutation) => {
        const addedNodes = mutation.addedNodes;
        const elements = Scanner._getAttackableElements(addedNodes);
        if (elements.length > 0) {
          listeners.onElementsAdded(elements);
        }
      });
    });

    this.mutationObserver.observe(document.body, { subtree: true, childList: true });

    const initialNodes = document.querySelectorAll('body :not(.modominator)');

    setTimeout(() => {
      const elements = Scanner._getAttackableElements(initialNodes);
      if (elements.length > 0) {
        listeners.onElementsAdded(elements);
      }
    }, 500);
  }

  private static _getAttackableElements(nodeList: NodeList): Element[] {
    const elements: Element[] = [];

    nodeList.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      if ((node as Element).classList.contains('modominator')) {
        return;
      }

      elements.push(node as Element);
    });

    return elements;
  }
}

export default Scanner;
