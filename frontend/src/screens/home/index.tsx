import { memo } from 'react';
import { Divider } from '@nextui-org/react';
import Header from '../../components/header';
import MonitorSwitch from '../../components/monitor-switch';
import InterfacePicker from '../../components/interface-picker';
import Footer from '../../components/footer';
import TopRightSlot from '../../components/top-right-slot';
import useMonitorStatus from '../../hooks/use-monitor-status';
import { toggleMonitoring } from '../../actions/app';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';

import { UI_MESSAGES } from '../../constants/messages';

const Home = memo(() => {
	const isMonitoring = useMonitorStatus();
	const selectedMac = useSelector((state: IRootState) => state.app.settings.selectedMac);

	const onToggleClick = () => {
		toggleMonitoring();
	};

	return (
		<div className=" flex flex-col justify-center items-center h-full">
			<TopRightSlot />
			<Header />
			<div className="flex flex-col justify-center items-center h-full gap-3">
				<MonitorSwitch isActive={isMonitoring} setIsActive={onToggleClick} />
				{!selectedMac && (
					<p className="text-danger text-xs font-bold animate-pulse">
						{UI_MESSAGES.WARNINGS.NO_INTERFACE}
					</p>
				)}
				<Divider className="my-4 w-1/4" />
				<div className="flex justify-between w-full">
					<div className="flex justify-center w-full">
						<InterfacePicker />
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
});

export default Home;
