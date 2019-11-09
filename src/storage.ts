import Dexie from 'dexie';

import { AttemptLog, Metadata, SuccessLog } from './types';
import { generateCode } from './utils/strings';

/**
 * Defines the object stores and indexes of the IndexedDB database used by moDOMinator.
 */
class ModomDatabase extends Dexie {
  metadata: Dexie.Table<Metadata, string>;
  attemptLogs: Dexie.Table<AttemptLog, string>;
  successLogs: Dexie.Table<SuccessLog, string>;

  constructor (databaseName: string) {
    super(databaseName);

    this.version(1).stores({
      metadata: 'id',
      attemptLogs: '++id, session',
      successLogs: '++id, session'
    });

    this.metadata = this.table('metadata');
    this.attemptLogs = this.table('attemptLogs');
    this.successLogs = this.table('successLogs');
  }
}

const database = new ModomDatabase('modom');

/**
 * Provides local and persistent storage for moDOMinator.
 */
class Storage {
  private session: string;
  private attempts: { [module: string]: { [target: string]: AttemptLog } };
  private successes: { [module: string]: { [target: string]: SuccessLog[] } };

  constructor() {
    this.session = '';
    this.attempts = {};
    this.successes = {};
  }

  async initialize(): Promise<void> {
    await database.open();
  }

  /**
   * Adds a new attempt for this session. The attempt information will be persisted into the database.
   * Note that duplicate entries will be ignored.
   */
  async addAttempt(module: string, target: string): Promise<AttemptLog | null> {
    if (this.hasAttempted(module, target)) {
      return null;
    }

    const log: AttemptLog = { session: this.session, module, target: target, timestamp: Date.now() };

    this._addAttemptLocal(log);
    await database.attemptLogs.add(log);
    return log;
  }

  /**
   * Adds a new successful attack for this session. The attack information will be persisted into the database.
   * Note that duplicate entries will be ignored.
   */
  async addSuccess(module: string, target: string, payload: string, details?: string): Promise<SuccessLog | null> {
    if (this.hasPayloadSucceeded(module, target, payload)) {
      return null;
    }

    const log: SuccessLog = { session: this.session, module, target: target, payload, timestamp: Date.now() };
    if (details) {
      log.details = details;
    }

    this._addSuccessLocal(log);
    await database.successLogs.add(log);
    return log;
  }

  getAllSuccessLogs(): SuccessLog[] {
    const logs: SuccessLog[] = [];
    for (const module in this.successes) {
      for (const target in this.successes[module]) {
        logs.push(...this.successes[module][target]);
      }
    }
    return logs;
  }

  getCurrentSession(): string {
    return this.session;
  }

  /**
   * Gets all successful attacks made for the given module and target.
   */
  getSuccessLogs(module: string, target: string): SuccessLog[] {
    if (!this.successes[module] || !this.successes[module][target]) {
      return [];
    }
    return this.successes[module][target];
  }

  /**
   * Checks whether an attempt was made for the given module and target.
   */
  hasAttempted(module: string, target: string): boolean {
    return !!this.attempts[module] && !!this.attempts[module][target];
  }

  /**
   * Checks whether a successful attack was made for the given module and target.
   */
  hasSucceeded(module: string, target: string): boolean {
    return !!this.successes[module] && !!this.successes[module][target] && this.successes[module][target].length > 0;
  }

  /**
   * Checks whether a successful attack was made for the given module, target, and payload.
   */
  hasPayloadSucceeded(module: string, target: string, payload: string): boolean {
    return this.hasSucceeded(module, target) &&
      !!this.successes[module][target].find((log) => log.payload === payload);
  }

  /**
   * Loads the current session and all logged data associated with this session from the database.
   */
  async loadCurrentSession(): Promise<string | null> {
    const session = await this._fetchCurrentSession();

    this.attempts = {};
    this.successes = {};

    if (session) {
      await this._fetchAttemptLogs(session);
      await this._fetchSuccessLogs(session);
    }

    return session;
  }

  /**
   * Generates and switches over to a new session.
   */
  async resetSession(): Promise<string> {
    const newSession = generateCode(10);
    await database.metadata.put({ id: 'session', value: newSession });

    this.attempts = {};
    this.successes = {};
    this.session = newSession;

    return newSession;
  }

  private _addAttemptLocal(attempt: AttemptLog) {
    if (!this.attempts[attempt.module]) {
      this.attempts[attempt.module] = {};
    }
    this.attempts[attempt.module][attempt.target] = attempt;
  }

  private _addSuccessLocal(success: SuccessLog) {
    if (!this.successes[success.module]) {
      this.successes[success.module] = {};
    }
    if (!this.successes[success.module][success.target]) {
      this.successes[success.module][success.target] = [];
    }
    this.successes[success.module][success.target].push(success);
  }

  private async _fetchCurrentSession(): Promise<string | null> {
    const metadata = await database.metadata.get('session');
    const session = metadata ? metadata.value as string : null;
    this.session = session || '';
    return session;
  }

  private async _fetchAttemptLogs(session: string): Promise<void> {
    return database.attemptLogs.where('session').equals(session).each((attemptLog) => {
      this._addAttemptLocal(attemptLog);
    });
  }

  private async _fetchSuccessLogs(session: string): Promise<void> {
    return database.successLogs.where('session').equals(session).each((successLog) => {
      this._addSuccessLocal(successLog);
    });
  }
}

export default Storage;
