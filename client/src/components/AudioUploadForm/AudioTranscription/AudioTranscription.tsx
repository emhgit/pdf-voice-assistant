import { useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import { useWebSocketContext } from "../../../context/WebSocketContext";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This function is intentionally left empty as the form is read-only.
    try {
      updateTranscription(e.target.value);
    } catch (error) {
      console.error("Error handling change:", error);
      // setTranscriptionError("An error occurred while processing the change.");
    }
  };

  return (
    <form>
      {transcriptionError && <p>Transcription error</p>}
      {transcriptionLoading && <p>Loading...</p>}
      <input
        type="text"
        value={transcription}
        readOnly
        onChange={handleChange}
        placeholder={
          transcription
            ? "Transcription complete"
            : "Transcription in progress..."
        }
      />
    </form>
  );
};

export default AudioTranscription;
