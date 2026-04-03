export const UI_MESSAGES = {
  MONITOR: {
    STARTING: 'Starting...',
    IDLE_DETECTED: (current: number, target: number) => `No activity detected for ${current}/${target} seconds.`,
    PROGRESS: 'Download in progress.',
    COMPLETED: 'Detected download completion.',
  },
  WARNINGS: {
    NO_INTERFACE: '⚠️ No network interface selected!',
  },
  INTERFACE: {
    AUTO_DETECTING: 'Auto-detecting interface...',
    DETECTED: 'Interface detected.',
  }
};
