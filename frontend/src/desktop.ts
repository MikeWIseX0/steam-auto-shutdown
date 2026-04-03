import * as NetworkManager from './wailsjs/go/main/NetworkManager';
import * as DiskManager from './wailsjs/go/main/DiskManager';
import * as GoApp from './wailsjs/go/main/App';

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('[SAFE BRIDGE ERROR]', error);
    return fallback;
  }
}

export const DesktopApi = {
  getInterfaces: () => safeCall(NetworkManager.GetInterfaces, []),
  autoDetectInterface: () => safeCall(NetworkManager.AutoDetectInterface, ''),
  getNetworkSpeed: (mac: string) => safeCall(() => NetworkManager.GetInterfaceDownloadSpeed(mac), 0),
  getProcesses: () => safeCall(DiskManager.GetProcesses, []),
  getDiskWriteSpeed: (pid: number) => safeCall(() => DiskManager.GetDiskWriteSpeed(pid), 0),
  executeAction: (action: string) => GoApp.ExecuteAction(action), // non-returning
  getActionTimeout: () => safeCall(GoApp.GetActionTimeout, 10),
  cancelShutdown: () => GoApp.CancelShutdown(),
  openInBrowser: (url: string) => GoApp.OpenInBrowser(url)
};
