import { toast } from 'react-toastify';

// Unified toast configuration
const defaultToastConfig = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light"
};

// Success toast with consistent styling
export const showSuccessToast = (message, config = {}) => {
  toast.success(message, {
    ...defaultToastConfig,
    ...config,
    className: 'custom-toast-success',
    bodyClassName: 'custom-toast-body',
    progressClassName: 'custom-toast-progress-success'
  });
};

// Error toast with consistent styling
export const showErrorToast = (message, config = {}) => {
  toast.error(message, {
    ...defaultToastConfig,
    autoClose: 6000, // Error messages stay longer
    ...config,
    className: 'custom-toast-error',
    bodyClassName: 'custom-toast-body',
    progressClassName: 'custom-toast-progress-error'
  });
};

// Info toast with consistent styling
export const showInfoToast = (message, config = {}) => {
  toast.info(message, {
    ...defaultToastConfig,
    ...config,
    className: 'custom-toast-info',
    bodyClassName: 'custom-toast-body',
    progressClassName: 'custom-toast-progress-info'
  });
};

// Warning toast with consistent styling
export const showWarningToast = (message, config = {}) => {
  toast.warning(message, {
    ...defaultToastConfig,
    autoClose: 5000,
    ...config,
    className: 'custom-toast-warning',
    bodyClassName: 'custom-toast-body',
    progressClassName: 'custom-toast-progress-warning'
  });
};

// Loading toast for async operations
export const showLoadingToast = (message, config = {}) => {
  return toast.loading(message, {
    ...defaultToastConfig,
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    ...config,
    className: 'custom-toast-loading',
    bodyClassName: 'custom-toast-body'
  });
};

// Update loading toast to success
export const updateToastToSuccess = (toastId, message) => {
  toast.update(toastId, {
    render: message,
    type: "success",
    isLoading: false,
    autoClose: 4000,
    closeOnClick: true,
    draggable: true,
    className: 'custom-toast-success',
    progressClassName: 'custom-toast-progress-success'
  });
};

// Update loading toast to error
export const updateToastToError = (toastId, message) => {
  toast.update(toastId, {
    render: message,
    type: "error",
    isLoading: false,
    autoClose: 6000,
    closeOnClick: true,
    draggable: true,
    className: 'custom-toast-error',
    progressClassName: 'custom-toast-progress-error'
  });
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Dismiss specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export default {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
  loading: showLoadingToast,
  updateToSuccess: updateToastToSuccess,
  updateToError: updateToastToError,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts
};
