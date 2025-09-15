import { useCallback, useState } from 'react';

interface FormFeedback {
  type: 'success' | 'error' | null;
  message: string;
}

export function useFormFeedback() {
  const [feedback, setFeedback] = useState<FormFeedback>({ type: null, message: '' });

  const showSuccess = useCallback((message: string) => {
    setFeedback({ type: 'success', message });

    // Auto-clear success messages
    setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setFeedback({ type: 'error', message });
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback({ type: null, message: '' });
  }, []);

  return {
    feedback,
    showSuccess,
    showError,
    clearFeedback,
  };
}
