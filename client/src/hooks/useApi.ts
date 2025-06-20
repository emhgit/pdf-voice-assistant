import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = "http://localhost:2008/api";

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const sessionToken = localStorage.getItem("sessionToken");
  return sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};
};

// Generic API fetch function
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  console.log(response);

  return response;
};

// Custom hook for managing API state
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useApiState<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading, error: null }));
  }, []);

  const setData = useCallback((data: T) => {
    setState({ data, loading: false, error: null });
  }, []);

  const setError = useCallback((error: string) => {
    setState({ data: null, loading: false, error });
  }, []);

  return { ...state, setLoading, setData, setError };
}

// PDF related hooks
export const usePdfFile = () => {
  const { data, loading, error, setLoading, setData, setError } =
    useApiState<File>();

  const fetchPdf = useCallback(async () => {
    if (!localStorage.getItem("sessionToken")) {
      setError("No session token");
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/pdf");
      const blob = await response.blob();
      const file = new File([blob], "document.pdf", {
        type: "application/pdf",
      });
      setData(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch PDF");
    }
  }, [setLoading, setData, setError]);

  useEffect(() => {
    fetchPdf();
  }, [fetchPdf]);

  // Expose setData as setPdfFile for external use
  return {
    pdfFile: data,
    loading,
    error,
    refetch: fetchPdf,
    setPdfFile: setData,
  };
};

export const useUploadPdf = () => {
  const { loading, error, setLoading, setError } = useApiState<File>();

  const uploadPdf = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("pdf", file);

        const response = await apiFetch("/pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();
        setLoading(false);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload PDF");
        throw err;
      }
    },
    [setLoading, setError]
  );

  return { uploadPdf, loading, error };
};

// Audio related hooks
export const useAudioFile = () => {
  const { data, loading, error, setLoading, setData, setError } =
    useApiState<Blob>();

  const fetchAudio = useCallback(async () => {
    if (!localStorage.getItem("sessionToken")) {
      setError("No session token");
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/audio");
      const blob = await response.blob();
      setData(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch audio");
    }
  }, [setLoading, setData, setError]);

  useEffect(() => {
    fetchAudio();
  }, [fetchAudio]);

  // Expose setData as setAudioBlob for external use
  return {
    audioBlob: data,
    loading,
    error,
    refetch: fetchAudio,
    setAudioBlob: setData,
  };
};

export const useUploadAudio = () => {
  const { loading, error, setLoading, setError } = useApiState<Blob>();

  const uploadAudio = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("audio", file);

        const response = await apiFetch("/audio", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        setLoading(false);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload audio");
        throw err;
      }
    },
    [setLoading, setError]
  );

  return { uploadAudio, loading, error };
};

// Transcription related hooks
export const useTranscription = () => {
  const { data, loading, error, setLoading, setData, setError } =
    useApiState<any>();

  const fetchTranscription = useCallback(async () => {
    if (!localStorage.getItem("sessionToken")) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/transcription");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch transcription"
      );
    }
  }, [setLoading, setData, setError]);

  useEffect(() => {
    fetchTranscription();
  }, [fetchTranscription]);

  return {
    transcription: data,
    setTranscription: setData,
    loading,
    error,
    refetch: fetchTranscription,
  };
};

export const useProcessTranscription = () => {
  const { loading, error, setLoading, setError } = useApiState<any>();

  const processTranscription = useCallback(
    async (audioBlob: Blob) => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("audio", audioBlob);

        const response = await apiFetch("/process-transcription", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        setLoading(false);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process transcription"
        );
        throw err;
      }
    },
    [setLoading, setError]
  );

  return { processTranscription, loading, error };
};
