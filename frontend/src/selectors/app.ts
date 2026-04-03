import { IRootState } from '../store';

export const selectedMacSelector = (state: IRootState) => state.app.settings.selectedMac;

export const targetProcessSelector = (state: IRootState) =>
  state.app.settings.targetProcess;

export const interfacesSelector = (state: IRootState) => state.app.interfaces;

export const diskSpeedInBytesPerSecondSelector = (state: IRootState) =>
  state.app.diskSpeed;

export const diskSpeedInMegabytesPerSecondSelector = (state: IRootState) =>
  state.app.diskSpeed / 1048576;

export const networkSpeedInBytesPerSecondSelector = (state: IRootState) =>
  state.app.networkSpeed;

export const networkSpeedInMegabytesPerSecondSelector = (state: IRootState) =>
  state.app.networkSpeed / 1048576;

export const themeSelector = (state: IRootState) => state.app.settings.theme;

export const settingsSelector = (state: IRootState) => state.app.settings;

export const monitoringSelector = (state: IRootState) => state.app.monitoring;

export const monitorStatusMsgSelector = (state: IRootState) =>
  state.app.monitorStatusMsg;
