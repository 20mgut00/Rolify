import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(url);

      const processedData = Array.isArray(response.data)
        ? response.data
        : response.data
        ? [response.data]
        : [];

      setData(processedData as T);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar los datos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
