import { toast as toastify, ToastContent, ToastOptions } from 'react-toastify';

const toast = (content: ToastContent, options?: ToastOptions<{}> | undefined) => {
  toastify.dismiss();
  return toastify(content, options);
};

toast.success = (content: ToastContent, options?: ToastOptions<{}> | undefined) => {
  toastify.dismiss();
  return toastify.success(content, options);
};

toast.warning = (content: ToastContent, options?: ToastOptions<{}> | undefined) => {
  toastify.dismiss();
  return toastify.warning(content, options);
};

toast.error = (content: ToastContent, options?: ToastOptions<{}> | undefined) => {
  toastify.dismiss();
  return toastify.error(content, options);
};

toast.info = (content: ToastContent, options?: ToastOptions<{}> | undefined) => {
  toastify.dismiss();
  return toastify.info(content, options);
};

export { toast };
