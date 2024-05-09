interface IToast {
  description: string;
}

export default function useToast() {
  const { successDuration, errorDuration } = useAppConfig().toast;
  const { $toast } = useNuxtApp();

  function success(payload: IToast) {
    $toast.success('Success', {
      description: payload.description,
      duration: successDuration,
    });
  }

  function error(payload: IToast) {
    $toast.error('Error', {
      description: payload.description,
      duration: errorDuration,
    });
  }

  return {
    success,
    error,
  };
}
