import React, { createContext, useContext, type ReactNode } from 'react';
import { usePdfFile, useUploadPdf } from '../hooks/useApi';
import { useAudioFile, useUploadAudio } from '../hooks/useApi';
import { useTranscription, useProcessTranscription } from '../hooks/useApi';

interface AppContextType {
  // PDF state
  pdfFile: File | null;
  pdfLoading: boolean;
  pdfError: string | null;
  uploadPdf: (file: File) => Promise<any>;
  refetchPdf: () => void;
  
  // Audio state
  audioBlob: Blob | null;
  audioLoading: boolean;
  audioError: string | null;
  uploadAudio: (file: File) => Promise<any>;
  refetchAudio: () => void;
  
  // Transcription state
  transcription: any;
  transcriptionLoading: boolean;
  transcriptionError: string | null;
  processTranscription: (audioBlob: Blob) => Promise<any>;
  refetchTranscription: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  // PDF hooks
  const { pdfFile, loading: pdfLoading, error: pdfError, refetch: refetchPdf } = usePdfFile();
  const { uploadPdf } = useUploadPdf();
  
  // Audio hooks
  const { audioBlob, loading: audioLoading, error: audioError, refetch: refetchAudio } = useAudioFile();
  const { uploadAudio } = useUploadAudio();
  
  // Transcription hooks
  const { transcription, loading: transcriptionLoading, error: transcriptionError, refetch: refetchTranscription } = useTranscription();
  const { processTranscription } = useProcessTranscription();

  const value: AppContextType = {
    // PDF
    pdfFile,
    pdfLoading,
    pdfError,
    uploadPdf,
    refetchPdf,
    
    // Audio
    audioBlob,
    audioLoading,
    audioError,
    uploadAudio,
    refetchAudio,
    
    // Transcription
    transcription,
    transcriptionLoading,
    transcriptionError,
    processTranscription,
    refetchTranscription,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};