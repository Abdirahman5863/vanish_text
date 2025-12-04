import { useState, useCallback } from 'react';

interface CreateMessageResponse {
  success: boolean;
  message: { id: string };
  link: string;
}

interface ViewMessageResponse {
  success: boolean;
  message: string;
  viewedAt: string;
}

interface PaymentInitResponse {
  success: boolean;
  authorizationUrl: string;
  reference: string;
}

export const useVanishText = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMessage = useCallback(
    async (text: string): Promise<CreateMessageResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/messages/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to create message');
          return null;
        }

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const viewMessage = useCallback(
    async (messageId: string): Promise<ViewMessageResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/messages/${messageId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to retrieve message');
          return null;
        }

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const initializePayment = useCallback(
    async (
      email: string,
      messageId: string
    ): Promise<PaymentInitResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/payment/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, messageId }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to initialize payment');
          return null;
        }

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyPayment = useCallback(async (reference: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Payment verification failed');
        return null;
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createMessage,
    viewMessage,
    initializePayment,
    verifyPayment,
    loading,
    error,
  };
};
