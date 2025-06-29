import { useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import { useWebSocketContext } from "../../../context/WebSocketContext";
import useDebounce from "../../../hooks/useDebounce";

const AudioTranscription = () => {
  const {
    transcription,
    transcriptionLoading,
    transcriptionError,
    setTranscriptionError,
    setTranscription,
    setTranscriptionLoading,
    updateTranscription,
  } = useAppContext();
  const { status, data, error } = useWebSocketContext();
  const debouncedTranscription = useDebounce(transcription, 2000);

  // Handle WebSocket status updates
  useEffect(() => {
    if (status === "complete") {
      setTranscription(data.transcription);
      setTranscriptionLoading(false);
    } else if (status === "transcribing") {
      console.log("Transcribing audio...");
      setTranscriptionLoading(true);
    } else if (status === "error") {
      console.error("WebSocket error:", error);
      setTranscriptionLoading(false);
      setTranscriptionError(error || "An error occurred during transcription.");
    }
  }, [status]);

  useEffect(() => {
    if (debouncedTranscription) {
      updateTranscription(debouncedTranscription);
    }
  }, [debouncedTranscription, updateTranscription]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTranscription(e.target.value);
  };

  return (
    <div>
      {transcriptionError && <p>Transcription error</p>}
      {transcriptionLoading && <p>Loading...</p>}
      {transcription && (
        <input type="text" value={transcription} onChange={handleChange} />
      )}
    </div>
  );
};

export default AudioTranscription;
