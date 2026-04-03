import { useEffect, useRef } from 'react';
import { store } from '../store';
import {
  diskSpeedInBytesPerSecondSelector,
  networkSpeedInBytesPerSecondSelector,
  settingsSelector
} from '../selectors/app';
import useMonitorStatus from './use-monitor-status';
import { UI_MESSAGES } from '../constants/messages';
import { setMonitorStatusMsg } from '../actions/app';
import { openModal } from '../actions/modal';
import { Modal } from '../types';
import { DesktopApi } from '../desktop';

const INTERVAL_MS = 1000;
let idleCounter = 0;
let activityCounter = 0;

const useSystemMonitor = () => {
  const interval = useRef<number | undefined>(undefined);
  const isMonitoring = useMonitorStatus();

  // we use getState here so we don't need to manage useEffect dependencies
  const monitor = async () => {
    const state = store.getState();
    const { actionDelay, speedThreshold, diskActivityMonitor, actionType } =
      settingsSelector(state);
    const networkSpeedInBytes = networkSpeedInBytesPerSecondSelector(state);
    const diskSpeedInBytes = diskSpeedInBytesPerSecondSelector(state);
    const speedThresholdInBytes = speedThreshold * 1024;
    const isBelowNetworkSpeedThreshold =
      networkSpeedInBytes < speedThresholdInBytes;
    const isBelowDiskSpeedThreshold = diskSpeedInBytes < speedThresholdInBytes;

    // if diskActivityMonitor is enabled, we need to check both network and disk speed
    const isIdle = diskActivityMonitor
      ? isBelowNetworkSpeedThreshold && isBelowDiskSpeedThreshold
      : isBelowNetworkSpeedThreshold;

    if (isIdle) {
      idleCounter += 1;
      activityCounter = Math.max(0, activityCounter - 1);

      setMonitorStatusMsg(
        UI_MESSAGES.MONITOR.IDLE_DETECTED(idleCounter, actionDelay)
      );
    } else {
      activityCounter = Math.min(5, activityCounter + 1);

      if (activityCounter >= 5) {
        idleCounter = 0;
      }

      setMonitorStatusMsg(UI_MESSAGES.MONITOR.PROGRESS);
    }

    if (idleCounter >= actionDelay) {
      clearInterval(interval.current);
      setMonitorStatusMsg(UI_MESSAGES.MONITOR.COMPLETED);
      DesktopApi.executeAction(actionType);
      openModal(Modal.ACTION_CONFIRMATION);
    }
  };

  useEffect(() => {
    if (!isMonitoring) {
      clearInterval(interval.current);
      return;
    }

    setMonitorStatusMsg(UI_MESSAGES.MONITOR.STARTING);
    idleCounter = 0;
    activityCounter = 0;
    interval.current = setInterval(monitor, INTERVAL_MS);

    return () => {
      clearInterval(interval.current);
    };
  }, [isMonitoring]);
};

export default useSystemMonitor;
