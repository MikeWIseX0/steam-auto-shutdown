import { createSlice } from '@reduxjs/toolkit';
import { net } from '../wailsjs/go/models';
import { ActionType, TSettings } from '../types';

const getStoredSettings = () => {
  const stored = JSON.parse(localStorage.getItem('settings') || '{}');

  return {
    theme: stored.theme || 'dark',
    diskActivityMonitor: stored.diskActivityMonitor || false,
    actionDelay: stored.actionDelay || 20,
    actionType: stored.actionType || ActionType.SHUTDOWN,
    speedThreshold: stored.speedThreshold || 200,
    selectedMac: stored.selectedMac || undefined,
    targetProcess: stored.targetProcess || {
      name: undefined,
      id: undefined
    }
  };
};

export interface IAppState {
  interfaces: net.InterfaceStat[];
  networkSpeed: number;
  diskSpeed: number;
  settings: TSettings;
  monitoring: boolean;
  monitorStatusMsg: string;
  actionTimeout: number;
}

const stored = getStoredSettings();

const initialState: IAppState = {
  interfaces: [],
  networkSpeed: 0,
  diskSpeed: 0,
  settings: stored as TSettings,
  monitoring: false,
  monitorStatusMsg: '',
  actionTimeout: 10
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSelectedMac: (state, action) => {
      state.settings.selectedMac = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setInterfaces: (state, action) => {
      state.interfaces = action.payload;
    },
    setNetworkSpeed: (state, action) => {
      state.networkSpeed = action.payload;
    },
    setDiskSpeed: (state, action) => {
      state.diskSpeed = action.payload;
    },
    toggleTheme: (state) => {
      state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setTargetProcess: (state, action) => {
      state.settings.targetProcess = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setSettings: (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload
      };
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    toggleMonitoring: (state) => {
      state.monitoring = !state.monitoring;
    },
    setMonitorStatusMsg: (state, action) => {
      state.monitorStatusMsg = action.payload;
    },
    setActionTimeout: (state, action) => {
      state.actionTimeout = action.payload;
    },
    resetSettings: (state) => {
      const defaults = {
        theme: 'dark',
        diskActivityMonitor: false,
        actionDelay: 20,
        actionType: ActionType.SHUTDOWN,
        speedThreshold: 200,
        selectedMac: undefined,
        targetProcess: {
          name: undefined,
          id: undefined
        }
      };
      state.settings = defaults as TSettings;
      localStorage.setItem('settings', JSON.stringify(defaults));
    }
  }
});

export const appSliceActions = appSlice.actions;

export default appSlice.reducer;
