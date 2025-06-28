import { useEffect, useState } from "react";
import { apiFetch, type StatusResponse } from "./useApi";

export const useStatus = () => {
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await apiFetch("/status");
        const result: StatusResponse = await response.json();
        setStatusData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch status");
      }
    };

    fetchStatus();
  }, []);

  return {
    statusData,
    error,
  };
};
