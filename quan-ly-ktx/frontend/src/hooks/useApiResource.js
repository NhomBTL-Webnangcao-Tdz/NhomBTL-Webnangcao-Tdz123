import { useCallback, useEffect, useState } from 'react';

export default function useApiResource(loader) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    loader()
      .then((result) => {
        if (!Array.isArray(result)) throw new Error('API không trả về danh sách hợp lệ.');
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || 'Không thể tải dữ liệu.');
          setData([]);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loader, reloadKey]);

  return { data, setData, isLoading, error, refresh };
}
