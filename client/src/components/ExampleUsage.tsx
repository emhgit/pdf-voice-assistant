import React from 'react';
import { useAppContext } from '../context/AppContext';

export const ExampleUsage: React.FC = () => {
  const {
    pdfFile,
    pdfLoading,
    pdfError,
    uploadPdf,
    audioBlob,
    audioLoading,
    audioError,
    uploadAudio,
    transcription,
    transcriptionLoading,
    transcriptionError,
    processTranscription,
  } = useAppContext();

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadPdf(file);
        console.log('PDF uploaded successfully');
      } catch (error) {
        console.error('Failed to upload PDF:', error);
      }
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadAudio(file);
        console.log('Audio uploaded successfully');
      } catch (error) {
        console.error('Failed to upload audio:', error);
      }
    }
  };

  const handleProcessTranscription = async () => {
    if (audioBlob) {
      try {
        const result = await processTranscription(audioBlob);
        console.log('Transcription processed:', result);
      } catch (error) {
        console.error('Failed to process transcription:', error);
      }
    }
  };

  return (
    <div className="example-usage">
      <h2>Example Usage of Unified Context</h2>
      
      {/* PDF Section */}
      <section>
        <h3>PDF Management</h3>
        {pdfLoading && <p>Loading PDF...</p>}
        {pdfError && <p>Error: {pdfError}</p>}
        {pdfFile && <p>PDF loaded: {pdfFile.name}</p>}
        <input type="file" accept=".pdf" onChange={handlePdfUpload} />
      </section>

      {/* Audio Section */}
      <section>
        <h3>Audio Management</h3>
        {audioLoading && <p>Loading audio...</p>}
        {audioError && <p>Error: {audioError}</p>}
        {audioBlob && <p>Audio loaded: {audioBlob.size} bytes</p>}
        <input type="file" accept="audio/*" onChange={handleAudioUpload} />
      </section>

      {/* Transcription Section */}
      <section>
        <h3>Transcription</h3>
        {transcriptionLoading && <p>Processing transcription...</p>}
        {transcriptionError && <p>Error: {transcriptionError}</p>}
        {transcription && <p>Transcription: {JSON.stringify(transcription)}</p>}
        <button onClick={handleProcessTranscription} disabled={!audioBlob}>
          Process Transcription
        </button>
      </section>
    </div>
  );
};
