import { useState, useCallback } from 'react';

/**
 * Simple toast state for pages that render {@link Toast} in the viewport.
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, showToast, dismiss };
}
