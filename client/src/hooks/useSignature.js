import { useCallback, useState } from 'react';
import api from '../lib/api.js';

export function useSignature() {
  const [error, setError] = useState(null);

  const fetchOne = useCallback(async (id) => {
    setError(null);
    const { data } = await api.get(`signatures/${id}`);
    return data;
  }, []);

  const list = useCallback(async () => {
    setError(null);
    const { data } = await api.get('signatures');
    return data;
  }, []);

  const save = useCallback(async (payload) => {
    setError(null);
    const { data } = await api.post('signatures', payload);
    return data;
  }, []);

  const update = useCallback(async (id, payload) => {
    setError(null);
    const { data } = await api.put(`signatures/${id}`, payload);
    return data;
  }, []);

  const remove = useCallback(async (id) => {
    setError(null);
    await api.delete(`signatures/${id}`);
  }, []);

  return { fetchOne, list, save, update, remove, error, setError };
}
