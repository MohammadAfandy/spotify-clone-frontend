import {
  ToastContainer,
  ToastContainerProps,
  Zoom,
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

const Toast: React.FC<ToastContainerProps> = () => {

  return (
    <ToastContainer
      toastClassName="bottom-16"
      bodyClassName="font-bold text-center"
      position="bottom-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      // pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      icon={false}
      transition={Zoom}
      closeButton={false}
    />
  );
};

export default Toast;
