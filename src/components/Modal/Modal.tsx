import ReactDOM from 'react-dom';
import { MdClose } from 'react-icons/md';

type ModalProps = {
  className?: string;
  title: string;
  show: boolean;
  handleCloseModal: () => void;
};

const Modal: React.FC<ModalProps> = ({
  children,
  className,
  title,
  show,
  handleCloseModal,
}) => {
  const backdropContainer = document.getElementById('backdrop-root');
  const modalContainer = document.getElementById('modal-root');
  return (
    <>
      {show && (
        <>
          {backdropContainer &&
            ReactDOM.createPortal(
              <div
                className="fixed top-0 left-0 w-full h-full z-40 bg-opacity-80 bg-black select-none"
                onClick={handleCloseModal}
              />,
              backdropContainer
            )}
          {modalContainer &&
            ReactDOM.createPortal(
              <div className="fixed flex flex-col top-1/12 inset-x-1/12 w-10/12 lg:inset-x-1/4 lg:w-2/4 z-50 overflow-hidden bg-light-black-1 px-10 py-4 rounded-xl">
                <div className="flex font-bold text-xl mb-4">
                  <div className="mr-auto">{title}</div>
                  <MdClose
                    className="cursor-pointer"
                    onClick={handleCloseModal}
                  />
                </div>
                <div>{children}</div>
              </div>,
              modalContainer
            )}
        </>
      )}
    </>
  );
};

export default Modal;
