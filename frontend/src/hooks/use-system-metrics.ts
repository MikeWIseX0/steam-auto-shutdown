import { selectedMacSelector, targetProcessSelector } from '../selectors/app';
import { useEffect, useRef } from 'react';
import { DesktopApi } from '../desktop';
import {
  getSteamProcess,
  setDiskSpeed,
  setNetworkSpeed
} from '../actions/app';
import { store } from '../store';

const useSystemMetrics = () => {
  const timeout = useRef<number | undefined>(undefined);
  const lastProcessCheck = useRef<number>(0);

  useEffect(() => {
    // we use getState here so we don't need to manage useEffect dependencies
    const loop = async () => {
      const state = store.getState();
      const selectedMac = selectedMacSelector(state);
      const targetProcess = targetProcessSelector(state);

      try {
        const pid = Number(targetProcess?.id);
        const hasValidPid = !isNaN(pid) && pid > 0;

        // Throttled PID Validation: Check if the process name still matches every 5 seconds
        // This handles cases where a process restarts or PID is recycled while saving CPU
        const now = Date.now();
        if (hasValidPid && now - lastProcessCheck.current > 5000) {
          lastProcessCheck.current = now;
          const processes = await DesktopApi.getProcesses();
          const currentProcess = processes?.find((p) => p.Pid === pid);

          if (!currentProcess || currentProcess.Name !== targetProcess?.name) {
            // PID is stale or recycled. Trigger re-detection.
            getSteamProcess();
          }
        }

        const [networkSpeed, diskSpeed] = await Promise.all([
          DesktopApi.getNetworkSpeed(selectedMac || ''),
          hasValidPid ? DesktopApi.getDiskWriteSpeed(pid) : Promise.resolve(0)
        ]);

        setNetworkSpeed(networkSpeed);
        setDiskSpeed(diskSpeed);
      } catch (err) {
        console.error('Failed to fetch system metrics:', err);
      }

      clearTimeout(timeout.current);
      // Reduce delay to 100ms since Go backend already provides 1s sample sleep
      timeout.current = setTimeout(loop, 100);
    };

    clearTimeout(timeout.current);
    loop();

    return () => {
      clearTimeout(timeout.current);
    };
  }, []);
};

export default useSystemMetrics;
