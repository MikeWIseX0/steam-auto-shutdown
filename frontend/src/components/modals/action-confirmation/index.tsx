import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@nextui-org/react';
import { closeModals } from '../../../actions/modal';
import useSettings from '../../../hooks/use-settings';
import { ActionType } from '../../../types';
import { DesktopApi } from '../../../desktop';
import useModalsInfo from '../../../hooks/use-modals-info';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';

const ActionConfirmationModal = () => {
  const { isModalOpen } = useModalsInfo();
  const settings = useSettings();
  const timeout = useSelector((state: IRootState) => state.app.actionTimeout);

  const onCancelClick = async () => {
    await DesktopApi.cancelShutdown();
    closeModals();
  };

  const isCancellable =
    settings.actionType === ActionType.SHUTDOWN ||
    settings.actionType === ActionType.RESTART;

  const getMessage = () => {
    switch (settings.actionType) {
      case ActionType.HIBERNATE:
        return `Your computer will hibernate in ${timeout} seconds`;
      case ActionType.SHUTDOWN:
        return `Your computer will shutdown in ${timeout} seconds`;
      case ActionType.RESTART:
        return `Your computer will restart in ${timeout} seconds`;
      case ActionType.SLEEP:
        return `Your computer will go to sleep in ${timeout} seconds`;
      case ActionType.LOGOFF:
        return `Your computer will log your user off in ${timeout} seconds`;
      default:
        return '';
    }
  };

  return (
    <Modal
      backdrop="blur"
      isOpen={isModalOpen}
      onClose={closeModals}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex gap-1 items-center"></ModalHeader>
        <ModalBody>
          <div className="flex flex-col full-w justify-center items-center gap-2">
            <p className="text-center">{getMessage()}</p>
            {!isCancellable && (
              <p className="text-danger text-xs text-center font-bold">
                WARNING: This action cannot be cancelled once the timer expires.
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="justify-center">
          {isCancellable ? (
            <Button
              onPress={onCancelClick}
              size="lg"
              variant="solid"
              color="danger"
            >
              CANCEL NOW
            </Button>
          ) : (
            <Button onPress={closeModals} size="lg" variant="flat">
              CLOSE
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ActionConfirmationModal;
