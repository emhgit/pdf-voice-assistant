import { createContext, useContext, useState, type ReactNode } from "react";
import { useExtractedFields, usePdfFile, useUploadPdf } from "../hooks/useApi";
import { useAudioFile, useUploadAudio } from "../hooks/useApi";
import { useTranscription, useProcessTranscription } from "../hooks/useApi";

interface AppContextType {
  // Session Token
  sessionToken: string | null;
  setSessionToken: (token: string | null) => void;

  // PDF state
  pdfFile: File | null;
  pdfLoading: boolean;
  pdfError: string | null;
  uploadPdf: (file: File) => Promise<any>;
  refetchPdf: () => void;
  setPdfFile: (file: File) => void;
  updatePdf: (file: File) => void;

  // Audio state
  audioBlob: Blob | null;
  audioLoading: boolean;
  audioError: string | null;
  uploadAudio: (file: File) => Promise<any>;
  refetchAudio: () => void;
  setAudioBlob: (blob: Blob) => void;
  updateAudio: (blob: Blob) => void;
  audioInitialized: boolean;

  // Transcription state
  transcription: string | null;
  transcriptionLoading: boolean;
  setTranscriptionLoading: (loading: boolean) => void;
  transcriptionError: string | null;
  setTranscriptionError: (error: string) => void;
  processTranscription: (audioBlob: Blob) => Promise<any>;
  refetchTranscription: () => void;
  setTranscription: (transcription: string) => void;
  updateTranscription: (transcription: string) => void;

  // Extracted fields state
  extractedFields: { name: string; value: string }[] | null;
  setExtractedFields: (fields: { name: string; value: string }[]) => void;
  extractedFieldsLoading: boolean;
  extractedFieldsError: string | null;
  setExtractedFieldsLoading: (loading: boolean) => void;
  setExtractedFieldsError: (error: string) => void;
  refetchExtractedFields: () => void;
  updateExtractedFields: (fields: { name: string; value: string }[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  // Session Token
  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem("sessionToken") || null
  );
  const setSessionTokenHandler = async (token: string | null) => {
    localStorage.setItem("sessionToken", token || "");
    setSessionToken(token);
    await new Promise((resolve) => setTimeout(resolve, 50));
  };

  // PDF hooks
  const {
    pdfFile,
    loading: pdfLoading,
    error: pdfError,
    refetch: refetchPdf,
    setPdfFile,
    updatePdf,
  } = usePdfFile();
  const { uploadPdf } = useUploadPdf();

  // Audio hooks
  const {
    audioBlob,
    loading: audioLoading,
    error: audioError,
    refetch: refetchAudio,
    setAudioBlob,
    updateAudio,
    initialized: audioInitialized,
  } = useAudioFile();
  const { uploadAudio } = useUploadAudio();

  // Transcription hooks
  const {
    transcription,
    loading: transcriptionLoading,
    setTranscriptionLoading,
    error: transcriptionError,
    setTranscriptionError,
    refetch: refetchTranscription,
    setTranscription,
    updateTranscription,
  } = useTranscription();
  const { processTranscription } = useProcessTranscription();

  // Extracted fields state
  const {
    extractedFields,
    setExtractedFields,
    extractedFieldsLoading,
    extractedFieldsError,
    setExtractedFieldsLoading,
    setExtractedFieldsError,
    refetchExtractedFields,
    updateExtractedFields,
  } = useExtractedFields();

  const value: AppContextType = {
    // Session Token
    sessionToken,
    setSessionToken: setSessionTokenHandler,

    // PDF
    pdfFile,
    pdfLoading,
    pdfError,
    uploadPdf,
    refetchPdf,
    setPdfFile,
    updatePdf,

    // Audio
    audioBlob,
    audioLoading,
    audioError,
    uploadAudio,
    refetchAudio,
    setAudioBlob,
    updateAudio,
    audioInitialized,

    // Transcription
    transcription,
    transcriptionLoading,
    setTranscriptionLoading,
    transcriptionError,
    setTranscriptionError,
    processTranscription,
    refetchTranscription,
    setTranscription,
    updateTranscription,

    // Extracted fields
    extractedFields,
    setExtractedFields,
    extractedFieldsLoading,
    setExtractedFieldsLoading,
    extractedFieldsError,
    setExtractedFieldsError,
    refetchExtractedFields,
    updateExtractedFields,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
