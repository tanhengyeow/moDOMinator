import ModuleHelper from './helper';
import { logError, logInfo } from './logger';
import Scanner, { ScannerListeners } from './scanner';
import Storage from './storage';
import { ModuleDefinition, Report } from './types';
import Ui from './ui';
import { getCurrentUrl } from './utils/dom';

import xssInput from './modules/xss-input';

type NotifyHandler = (module: ModuleHelper, target: string) => Promise<void>;

class Modom {
  private readonly storage: Storage;
  private scanner: Scanner | null;
  private readonly ui: Ui;
  private readonly modules: ModuleHelper[];
  private readonly moduleMap: { [name: string]: ModuleHelper };
  private isInitialized: boolean;
  private isInitializing: boolean;
  private reportCache: Report[]; // temporary cache for use before initialization
  private notifyCount: number;

  constructor() {
    this.storage = new Storage();
    this.scanner = null;
    this.ui = new Ui(this);
    this.modules = [];
    this.moduleMap = {};
    this.isInitialized = false;
    this.isInitializing = false;
    this.reportCache = [];
    this.notifyCount = 0;
  }

  /**
   * Initializes moDOMinator. This is called automatically once the page has loaded.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    const session = await this.storage.loadCurrentSession();
    if (!session) {
      await this.storage.resetSession();
    }

    this.ui.addSuccessLogs(this.storage.getAllSuccessLogs());
    this.reportCache.forEach((report) => this._handleReport(report));
    this.reportCache = [];

    await this._notifyModules('', (module, target) => {
      if (!module.definition.onInitialize) {
        return Promise.resolve();
      }
      return module.definition.onInitialize(module);
    });

    this.scanner = new Scanner(this._createListeners());

    this.isInitialized = true;
    this.isInitializing = false;
  }

  /**
   * Extends moDOMinator with the given module.
   */
  extend(definition: ModuleDefinition) {
    if (this.moduleMap[definition.name]) {
      return;
    }

    const module = new ModuleHelper(this, this.storage, definition);
    this.modules.push(module);
    this.moduleMap[definition.name] = module;
  }

  /**
   * Logs a report that details a successful attack.
   */
  log(rawReport: string) {
    const report = Modom._parseRawReport(rawReport);
    logInfo(`A report was received for ${report.m} on ${report.t} (payload ID: ${report.p}).`);
    if (this.isInitialized) {
      this._handleReport(report);
    } else {
      this.reportCache.push(report);
    }
  }

  getRawPayload(module: string, payloadId: string): string {
    return this.moduleMap[module].definition.rawPayloads[payloadId];
  }

  getSession(): string {
    return this.storage.getCurrentSession();
  }

  /**
   * Resets the moDOMinator session, returning a Promise that resolves to the new session code.
   * This will reset all saved attempt logs and success logs.
   */
  resetSession(): Promise<string> {
    this.ui.resetSuccessLogs();
    return this.storage.resetSession();
  }

  private _createListeners(): ScannerListeners {
    return {
      onElementsAdded: (elements) => {
        return this._notifyModules(getCurrentUrl(), (module, target) => {
          if (!module.definition.onElementsAdded) {
            return Promise.resolve();
          }
          return module.definition.onElementsAdded(module, target, elements);
        });
      }
    };
  }

  private async _notifyModules(target: string, handler: NotifyHandler): Promise<void> {
    this.ui.showOverlay();
    this.notifyCount++;

    for (const module of this.modules) {
      try {
        await handler(module, target);
      } catch (e) {
        logError(`An exception occurred when executing ${module.name} on ${target}.`);
        logError(e);
      }
    }

    if (--this.notifyCount <= 0) {
      this.ui.hideOverlay();
    }
  }

  private async _handleReport(report: Report) {
    if (report.s !== this.getSession()) {
      return;
    }

    const result = await this.storage.addSuccess(report.m, report.t, report.p, report.d);

    if (result) {
      this.ui.addSuccessLog(result);
    }
  }

  private static _parseRawReport(rawReport: string): Report {
    const parts = rawReport.split(':');
    const report: Report = { s: parts[0], m: parts[1], t: parts[2] || getCurrentUrl(), p: parts[3] };
    if (parts.length > 4 && parts[4].length > 0) {
      report.d = parts[4];
    }
    return report;
  }
}

const modom = new Modom();

// attach built-in modules
modom.extend(xssInput);

(window as any).modom = {
  log: function(rawReport: string) {
    modom.log(rawReport);
  },

  getSession: function(): string {
    return modom.getSession();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  modom.initialize();
});

export default modom;
export type ModomType = InstanceType<typeof Modom>;
