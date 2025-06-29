import { useState, useEffect, useCallback, useRef } from "react";
import { useStatus } from "./useStatus";

const API_BASE_URL = "http://localhost:2008/api";

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const sessionToken = localStorage.getItem("sessionToken");
  return sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};
};

// Generic API fetch function
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
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
  errorMessage?: string;
}

export interface StatusResponse {
  pdfReady: boolean;
  audioReady: boolean;
  transcriptionReady: boolean;
  extractedFieldsReady: boolean;
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
      status: loading ? Status.Loading : Status.Idle,
    }));
  }, []);

  const setData = useCallback((data: T) => {
    setState({
      data,
      status: Status.Success,
      initialized: true,
      errorMessage: undefined,
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      status: prev.initialized ? Status.Error : Status.Idle, // Only show error after initialization
      initialized: true,
      errorMessage: error,
    }));
  }, []);

  const setInitialized = useCallback((isInitialized: boolean) => {
    setState((prev) => ({
      ...prev,
      initialized: isInitialized,
    }));
  }, []);

  return {
    ...state,
    setLoading,
    setData,
    setError,
    loading: state.status === Status.Loading,
    error: state.status === Status.Error,
    setInitialized,
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
      console.log("PDF fetched successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch PDF");
    }
  }, [setLoading, setData, setError]);

  useEffect(() => {
    if (localStorage.getItem("sessionToken")) {
      fetchPdf();
    }
  }, [fetchPdf]);

  // Expose setData as setPdfFile for external use
  return {
    pdfFile: data,
    loading: status === Status.Loading,
    error:
      initialized && status === Status.Error ? "Failed to fetch PDF" : null,
    refetch: fetchPdf,
    setPdfFile: setData,
  };
};

export const useUploadPdf = () => {
  const { status, setLoading, setError, initialized } = useApiState<File>();

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
        console.log("PDF uploaded successfully");
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
    error:
      initialized && status === Status.Error ? "Failed to upload PDF" : null,
  };
};

// Audio related hooks
export const useAudioFile = () => {
  const {
    data,
    status,
    setLoading,
    setData,
    setError,
    initialized,
    setInitialized,
  } = useApiState<Blob>();

  const { statusData } = useStatus();

  useEffect(() => {
    if (statusData?.audioReady) {
      setInitialized(true);
    }
  }, [statusData]);

  const fetchAudio = useCallback(async () => {
    if (!localStorage.getItem("sessionToken")) {
      setError("No session token");
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/audio");
      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }
      const blob = await response.blob();
      setData(blob);
      console.log("Audio fetched successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch audio");
    }
  }, [setLoading, setData, setError]);

  useEffect(() => {
    if (initialized) {
      fetchAudio();
    }
  }, [initialized, fetchAudio]);

  // Expose setData as setAudioBlob for external use
  return {
    audioBlob: data,
    loading: status === Status.Loading,
    error:
      initialized && status === Status.Error ? "Failed to fetch audio" : null,
    refetch: fetchAudio,
    setAudioBlob: setData,
  };
};

export const useUploadAudio = () => {
  const { status, setLoading, setError } = useApiState<Blob>();

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
        console.log("Audio uploaded successfully");
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
    error: status === Status.Error ? "Failed to upload audio" : null,
  };
};

// Transcription related hooks
export const useTranscription = () => {
  const {
    data,
    status,
    setLoading,
    setData,
    setError,
    initialized,
    setInitialized,
  } = useApiState<any>();

  const { statusData } = useStatus();

  useEffect(() => {
    if (statusData?.audioReady) {
      setInitialized(true);
    }
  }, [statusData]);

  const fetchTranscription = useCallback(async () => {
    if (!localStorage.getItem("sessionToken")) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/transcription");
      const result = await response.json();
      setLoading(false);
      console.log("Transcription fetched successfully");
      setData(result);
      console.log("Transcription data:", result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch transcription"
      );
    }
  }, [setLoading, setData, setError]);

  const updateTranscription = useCallback(
    async (transcription: string) => {
      try {
        setLoading(true);
        const response = await apiFetch("/transcription", {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify({ transcription }),
        });
        const result = await response.json();
        setLoading(false);
        console.log("Transcription updated successfully");

        if (result && result.transcription !== data.transcription) {
          setData(result.transcription);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update transcription"
        );
      }
    },
    [setLoading, setData, setError]
  );

  useEffect(() => {
    if (initialized) {
      fetchTranscription();
    }
  }, [initialized, fetchTranscription]);

  return {
    transcription: data,
    setTranscription: setData,
    loading: status === Status.Loading,
    setTranscriptionLoading: setLoading,
    error:
      initialized && status === Status.Error
        ? "Failed to fetch transcription"
        : null,
    setTranscriptionError: setError,
    refetch: fetchTranscription,
    updateTranscription,
  };
};

export const useProcessTranscription = () => {
  const { status, setLoading, setError } = useApiState<any>();

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
        console.log("Transcription processed successfully");
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
    error: status === Status.Error ? "Failed to process transcription" : null,
  };
};

export const useExtractedFields = () => {
  const {
    data,
    status,
    setLoading,
    setData,
    setError,
    initialized,
    setInitialized,
  } = useApiState<{ name: string; value: string }[] | null>();

  const { statusData } = useStatus();

  useEffect(() => {
    if (statusData?.audioReady) {
      setInitialized(true);
    }
  }, [statusData]);

  const fetchExtractedFields = useCallback(async () => {
    if (!localStorage.getItem("sessionToken")) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/extract");
      const result = await response.json();
      setLoading(false);
      setData(result.fields);
      console.log("Extracted fields fetched successfully");
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
  }, [initialized, fetchExtractedFields]);

  return {
    extractedFields: data,
    setExtractedFields: setData,
    extractedFieldsLoading: status === Status.Loading,
    setExtractedFieldsLoading: setLoading,
    setExtractedFieldsError: setError,
    extractedFieldsError:
      status === Status.Error ? "Failed to fetch extracted fields" : null,
    refetchExtractedFields: fetchExtractedFields,
  };
};

// hooks/useWebSocket.ts - Improved version
export const useWebSocket = (shouldConnect: boolean) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState({
    connected: false,
    status: "idle",
    error: null as string | null,
    data: null as any,
  });

  useEffect(() => {
    if (!shouldConnect) return;

    const sessionToken = localStorage.getItem("sessionToken");
    if (!sessionToken) return;

    const socket = new WebSocket(`ws://localhost:2025?token=${sessionToken}`);
    wsRef.current = socket;

    // Event handlers
    socket.onopen = () =>
      setState((prev) => ({ ...prev, connected: true, error: null }));
    socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setState((prev) => ({ ...prev, ...handleWebSocketMessage(data) }));
    };
    socket.onerror = () =>
      setState((prev) => ({ ...prev, error: "Connection error" }));
    socket.onclose = () => setState((prev) => ({ ...prev, connected: false }));

    return () => {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    };
  }, [shouldConnect]);

  return {
    ...state,
    ws: wsRef.current,
    send: (data: any) => wsRef.current?.send(JSON.stringify(data)),
  };
};

// Helper function
function handleWebSocketMessage(data: any) {
  switch (data.type) {
    case "status":
      return { status: data.status };
    case "complete":
      return { data: data.data, status: "complete" };
    case "error":
      return { error: data.error, status: "error" };
    default:
      return {};
  }
}
