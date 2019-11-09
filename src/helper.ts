import { ModomType } from './index';
import Storage from './storage';
import { AttemptLog, ModuleDefinition, SuccessLog } from './types';

class ModuleHelper {
  private readonly modom: ModomType;
  private readonly storage: Storage;
  readonly name: string;
  readonly definition: ModuleDefinition;

  constructor(modom: ModomType, storage: Storage, definition: ModuleDefinition) {
    this.modom = modom;
    this.storage = storage;
    this.name = definition.name;
    this.definition = definition;
  }

  /**
   * Logs a successful attack that was made on the given target.
   */
  addSuccess(target: string, payload: string, details?: string): Promise<SuccessLog | null> {
    return this.storage.addSuccess(this.name, target, payload, details);
  }

  /**
   * Creates a report with the given target, payload, and details.
   */
  createReport(target: string | null, payload: string, details?: string): string {
    return `${this.modom.getSession()}#$${this.name}#$${target || ''}#$${payload}#$${details || ''}`;
  }

  /**
   * Gets all successful attacks made on the given target.
   */
  getSuccessLogs(module: string, target: string): SuccessLog[] {
    return this.storage.getSuccessLogs(this.name, target);
  }

  /**
   * Checks whether attempts have been made on the given target.
   */
  hasCompleted(target: string): boolean {
    return this.storage.hasAttempted(this.name, target);
  }

  /**
   * Checks whether a successful attack was made on the given target.
   */
  hasSucceeded(target: string): boolean {
    return this.storage.hasSucceeded(this.name, target);
  }

  /**
   * Marks the given target as being already attempted.
   */
  markAsCompleted(target: string): Promise<AttemptLog | null> {
    return this.storage.addAttempt(this.name, target);
  }
}

export default ModuleHelper;
