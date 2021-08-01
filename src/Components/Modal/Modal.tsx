import ReactDOM from 'react-dom';
import { X as CloseIcon } from 'react-feather';

type ModalProps = {
  className?: string,
  title: string,
  show: boolean,
  handleCloseModal: () => void,
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
          {backdropContainer && ReactDOM.createPortal(
            <div className="fixed top-0 left-0 w-full h-screen z-10 bg-opacity-80 bg-black" onClick={handleCloseModal} />,
            backdropContainer
          )}
          {modalContainer && ReactDOM.createPortal(
            <div className="fixed flex flex-col top-1/12 inset-x-1/12 w-10/12 sm:inset-x-1/4 sm:w-2/4 z-20 overflow-hidden bg-light-black-1 px-10 py-4 rounded-xl">
              <div className="flex font-bold text-xl mb-4">
                <div className="mr-auto">
                  {title}
                </div>
                <CloseIcon
                  className="cursor-pointer"
                  onClick={handleCloseModal}
                />
              </div>
              <div>
                {children}
              </div>
            </div>,
            modalContainer
          )}
        </>
      )}
    </>
  )
}

export default Modal;
