import Swal from 'sweetalert2';

export const showSuccessAlert = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#2563EB',
    timer: 2500,
    timerProgressBar: true,
  });
};

export const showErrorAlert = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#DC2626',
  });
};

export const showConfirmDialog = async (title, text, confirmButtonText = 'Yes, proceed') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563EB',
    cancelButtonColor: '#64748B',
    confirmButtonText,
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
};

export const showToast = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  Toast.fire({
    icon,
    title,
  });
};
