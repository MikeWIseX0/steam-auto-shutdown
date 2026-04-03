import { Tooltip } from '@nextui-org/react';
import { IconWorldDownload } from '@tabler/icons-react';
import { useNetworkSpeedInMegaBytes } from '../../hooks/use-network-speed';

const NetworkSpeed = () => {
  const speed = useNetworkSpeedInMegaBytes();

  return (
    <Tooltip
      color="foreground"
      content="The download speed of the selected network interface. This value is not accurate and can fluctuate."
      showArrow
      delay={300}
      closeDelay={0}
    >
      <div className="flex gap-1 items-center">
        <IconWorldDownload size="0.9rem" className="text-primary" />
        <p className="text-foreground text-sm font-medium">{speed.toFixed(2)} MB/s</p>
      </div>
    </Tooltip>
  );
};

export default NetworkSpeed;
