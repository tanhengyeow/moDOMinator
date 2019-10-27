export default `
.modom-monospace {
  font-family: monospace;
}

#modom-main, #modom-main-bg, #modom-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

#modom-main {
  display: none;
  z-index: 996;
}

#modom-content {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  height: 100%;
  overflow-y: auto;
  max-width: 75vw;
  max-height: 50vh;
  padding: 20px;
  border-radius: 10px;
  background-color: #eee;
  z-index: 998;
}

#modom-content-header {
  margin-bottom: 10px;
}

#modom-table {
  border-collapse: collapse;
}

#modom-table, #modom-table th, #modom-table td {
  border: 1px solid #888;
  padding: 5px;
}

#modom-reset-button {
  display: inline-block;
  float: right;
  margin-top: 20px;
  padding: 4px 8px;
  background-color: #ffcdd2;
  border-radius: 8px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 5px 0 rgba(0, 0, 0, 0.06), 0 3px 1px -2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.25s;
}

#modom-reset-button:hover {
  background-color: #ef9a9a;
}

#modom-main-bg {
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 997;
}

#modom-overlay {
  display: none;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

#modom-overlay-message {
  position: fixed;
  left: 50%;
  bottom: 12px;
  padding: 10px;
  border-radius: 5px;
  transform: translateX(-50%);
  color: #ccc;
  background-color: rgba(0, 0, 0, 0.4);
}

#modom-fab {
  position: fixed;
  width: 56px;
  right: 15px;
  bottom: 15px;
  margin-left: -28px;
  z-index: 995;
}

#modom-fab-button {
  position: absolute;
  bottom: 0;
  display: block;
  width: 56px;
  height: 56px;
  background-color: #29B6F6;
  border-radius: 50%;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background-color 0.25s;
}

#modom-fab-button:hover {
  background-color: #299cdc;
}

#modom-fab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  height: 26px;
  width: 26px;
  border-radius: 100%;
  background-color: #ef5350;
  line-height: 24px;
  text-align: center;
  vertical-align: middle;
}

#modom-fab-button-text {
  display: inline-block;
  width: 56px;
  height: 56px;
  line-height: 56px;
  text-align: center;
  vertical-align: middle;
}
`;
