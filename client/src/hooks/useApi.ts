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

enum Status {
  Idle = "idle",
  Loading = "loading",
  Success = "success",
  Error = "error",
}

// Custom hook for managing API state
interface UseApiState<T> {
  data: T | null;
  status: Status;
  initialized: boolean;
}

function useApiState<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    status: Status.Idle,
    initialized: false,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ 
      ...prev, 
      status: loading ? Status.Loading : Status.Idle 
    }));
  }, []);

  const setData = useCallback((data: T) => {
    setState({ 
      data, 
      status: Status.Success, 
      initialized: true 
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      status: prev.initialized ? Status.Error : Status.Idle, // Only show error after initialization
      initialized: true,
    }));
  }, []);

  return { 
    ...state, 
    setLoading, 
    setData, 
    setError,
    loading: state.status === Status.Loading,
    error: state.status === Status.Error
  };
}

// PDF related hooks
export const usePdfFile = () => {
  const { data, status, setLoading, setData, setError, initialized } =
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
    if (localStorage.getItem("sessionToken") || initialized) {
      fetchPdf();
    }
  }, [fetchPdf, initialized]);

  // Expose setData as setPdfFile for external use
  return {
    pdfFile: data,
    loading: status === Status.Loading,
    error: initialized && status === Status.Error ? "Failed to fetch PDF" : null,
    refetch: fetchPdf,
    setPdfFile: setData,
  };
};

export const useUploadPdf = () => {
  const { status, setLoading, setError, initialized } =
    useApiState<File>();

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

  return { 
    uploadPdf, 
    loading: status === Status.Loading, 
    error: initialized && status === Status.Error ? "Failed to upload PDF" : null 
  };
};

// Audio related hooks
export const useAudioFile = () => {
  const { data, status, setLoading, setData, setError, initialized } =
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
    if (initialized) {
      fetchAudio();
    }
  }, [fetchAudio, initialized]);

  // Expose setData as setAudioBlob for external use
  return {
    audioBlob: data,
    loading: status === Status.Loading,
    error: initialized && status === Status.Error ? "Failed to fetch audio" : null,
    refetch: fetchAudio,
    setAudioBlob: setData,
  };
};

export const useUploadAudio = () => {
  const { status, setLoading, setError, initialized } =
    useApiState<Blob>();

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

  return { 
    uploadAudio, 
    loading: status === Status.Loading, 
    error: initialized && status === Status.Error ? "Failed to upload audio" : null 
  };
};

// Transcription related hooks
export const useTranscription = () => {
  const { data, status, setLoading, setData, setError, initialized } =
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
    if (initialized) {
      fetchTranscription();
    }
  }, [fetchTranscription, initialized]);

  return {
    transcription: data,
    setTranscription: setData,
    loading: status === Status.Loading,
    error: initialized && status === Status.Error ? "Failed to fetch transcription" : null,
    refetch: fetchTranscription,
  };
};

export const useProcessTranscription = () => {
  const { status, setLoading, setError, initialized } =
    useApiState<any>();

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

  return { 
    processTranscription, 
    loading: status === Status.Loading, 
    error: initialized && status === Status.Error ? "Failed to process transcription" : null 
  };
};

export const useExtractedFields = () => {
  const { data, status, setLoading, setData, setError, initialized } =
    useApiState<{ name: string; value: string }[] | null>();

  const fetchExtractedFields = useCallback(async () => {
    if (!localStorage.getItem("sessionToken")) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/extract");
      const result = await response.json();
      setData(result.fields);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch extracted fields"
      );
    }
  }, [setLoading, setData, setError]);

  useEffect(() => {
    if (initialized) {
      fetchExtractedFields();
    }
  }, [fetchExtractedFields, initialized]);

  return {
    extractedFields: data,
    setExtractedFields: setData,
    extractedFieldsLoading: status === Status.Loading,
    extractedFieldsError: initialized && status === Status.Error ? "Failed to fetch extracted fields" : null,
    refetchExtractedFields: fetchExtractedFields,
  };
};
