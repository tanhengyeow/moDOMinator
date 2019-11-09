import { ModomType } from '../index';
import { SuccessLog } from '../types';
import { injectCssRules } from '../utils/dom';
import cssRules from './styles';

/**
 * Provides a user interface for displaying a list of successful attacks.
 */
class Ui {
  private readonly modom: ModomType;
  private readonly modomElement: HTMLDivElement;
  private readonly overlayElement: HTMLDivElement;
  private readonly fabElement: HTMLDivElement;
  private readonly tableBodyElement: HTMLTableSectionElement;
  private readonly badgeElement: HTMLDivElement;
  private counter: number;

  constructor(modom: ModomType) {
    this.modom = modom;

    const modomElement = document.createElement('div');
    const overlayElement = document.createElement('div');
    const fabElement = document.createElement('div');

    modomElement.id = 'modom-main';
    overlayElement.id = 'modom-overlay';
    fabElement.id = 'modom-fab';

    modomElement.innerHTML = `
      <div id="modom-content" class="modominator">
        <div id="modom-content-header" class="modominator"><b>Successful Attacks</b></div>
        <table id="modom-table" class="modominator">
          <thead class="modominator">
            <tr class="modominator">
              <th class="modominator">#</th>
              <th class="modominator">Module</th>
              <th class="modominator">Payload ID</th>
              <th class="modominator">Payload</th>
              <th class="modominator">Target</th>
              <th class="modominator">Details</th>
            </tr>
          </thead>
          <tbody id="modom-table-body" class="modominator"></tbody>
        </table>
        <div id="modom-reset-button" class="modominator">Reset Session</div>
      </div>
      <div id="modom-main-bg" class="modominator"></div>
    `;
    overlayElement.innerHTML = `<div id="modom-overlay-message" class="modominator">moDOMinator is running...</div>`;
    fabElement.innerHTML = `
      <span id="modom-fab-button" class="modominator">
        <div id="modom-fab-badge" class="modominator"></div>
        <div id="modom-fab-button-text" class="modominator">DOM</div>
      </span>
    `;

    modomElement.querySelector('#modom-main-bg')!.addEventListener('click', () => this._hideMainContent());
    modomElement.querySelector('#modom-reset-button')!.addEventListener('click', () => this.modom.resetSession());
    fabElement.querySelector('#modom-fab-button')!.addEventListener('click', () => this._showMainContent());

    document.body.appendChild(modomElement);
    document.body.appendChild(overlayElement);
    document.body.appendChild(fabElement);

    this.modomElement = modomElement;
    this.overlayElement = overlayElement;
    this.fabElement = fabElement;
    this.tableBodyElement = modomElement.querySelector('#modom-table-body') as HTMLTableSectionElement;
    this.badgeElement = fabElement.querySelector('#modom-fab-badge') as HTMLDivElement;
    this.counter = 0;

    injectCssRules(cssRules);
    this._updateBadge()
  }

  addSuccessLog(successLog: SuccessLog) {
    this.counter++;

    const tableRow = document.createElement('tr');
    const payload = this.modom.getRawPayload(successLog.module, successLog.payload);
    tableRow.className = 'modominator';
    tableRow.appendChild(Ui._createTableCell(this.counter.toString()));
    tableRow.appendChild(Ui._createTableCell(successLog.module));
    tableRow.appendChild(Ui._createTableCell(successLog.payload));
    tableRow.appendChild(Ui._createTableCell(payload, 'modom-monospace'));
    tableRow.appendChild(Ui._createTableCell(successLog.target));
    tableRow.appendChild(Ui._createTableCell(successLog.details || '-'));

    this.tableBodyElement.appendChild(tableRow);
    this._updateBadge();
  }

  addSuccessLogs(successLogs: SuccessLog[]) {
    successLogs.forEach((successLog) => this.addSuccessLog(successLog));
  }

  resetSuccessLogs() {
    this.tableBodyElement.innerHTML = '';
    this.counter = 0;
    this._updateBadge();
  }

  hideOverlay() {
    this.overlayElement.style.display = 'none';
  }

  showOverlay() {
    this.overlayElement.style.display = 'block';
  }

  private _hideMainContent() {
    this.modomElement.style.display = 'none';
  }

  private _showMainContent() {
    this.modomElement.style.display = 'block';
  }

  private _updateBadge() {
    if (this.counter === 0) {
      this.badgeElement.style.display = 'none';
    } else {
      this.badgeElement.style.display = 'block';
      this.badgeElement.innerText = this.counter.toString();
    }
  }

  private static _createTableCell(content: string, className?: string): HTMLTableDataCellElement {
    const cell = document.createElement('td');
    if (className) {
      cell.className = className;
    }
    cell.className = 'modominator';
    cell.innerText = content;
    return cell;
  }
}

export default Ui;
