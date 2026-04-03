import { appSliceActions } from '../store/app-slice';
import { store } from '../store';
import { DesktopApi } from '../desktop';
import { TProcess } from '../types';

import { UI_MESSAGES } from '../constants/messages';

export const setSelectedMac = (mac: string | undefined) => {
  store.dispatch(appSliceActions.setSelectedMac(mac));
};

export const setNetworkSpeed = (speed: number | undefined) => {
  store.dispatch(appSliceActions.setNetworkSpeed(speed || 0));
};

export const setDiskSpeed = (speed: number | undefined) => {
  store.dispatch(appSliceActions.setDiskSpeed(speed || 0));
};

export const setSettings = (settings: any) => {
  store.dispatch(appSliceActions.setSettings(settings));
};

export const toggleMonitoring = () => {
  store.dispatch(appSliceActions.toggleMonitoring());
};

export const toggleTheme = () => {
  store.dispatch(appSliceActions.toggleTheme());
};

export const resetSettings = () => {
  store.dispatch(appSliceActions.resetSettings());
};

export const setTargetProcess = (process: TProcess) => {
  store.dispatch(appSliceActions.setTargetProcess(process));
};

export const setMonitorStatusMsg = (msg: string) => {
  const currentMsg = store.getState().app.monitorStatusMsg;
  if (currentMsg !== msg) {
    store.dispatch(appSliceActions.setMonitorStatusMsg(msg));
  }
};

export const loadActionTimeout = async () => {
  const timeout = await DesktopApi.getActionTimeout();
  store.dispatch(appSliceActions.setActionTimeout(timeout));
};

export const loadInterfaces = async () => {
  const results = await DesktopApi.getInterfaces();

  store.dispatch(appSliceActions.setInterfaces(results));

  try {
    const state = store.getState().app;
    // Only auto-detect if we don't have a saved preference
    if (!state.settings.selectedMac) {
      setMonitorStatusMsg(UI_MESSAGES.INTERFACE.AUTO_DETECTING);
      const detectedMac = await DesktopApi.autoDetectInterface();

      if (detectedMac) {
        setSelectedMac(detectedMac);
        setMonitorStatusMsg(UI_MESSAGES.INTERFACE.DETECTED);
      }
    }
  } catch {
    // do nothing
  }
};

export const DEFAULT_AUTO_DETECT_PROCESS = 'steam.exe';

export const getSteamProcess = async () => {
  const processes = await DesktopApi.getProcesses();

  const result = processes?.find(
    (p) =>
      p.Name.toLowerCase() === DEFAULT_AUTO_DETECT_PROCESS.toLowerCase()
  );

  if (!result) return;

  const process: TProcess = {
    id: result.Pid.toString(),
    name: result.Name
  };

  setTargetProcess(process);
};
