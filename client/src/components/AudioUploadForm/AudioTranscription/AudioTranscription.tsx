import { useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import { useWebSocket } from "../../../hooks/useApi";

const AudioTranscription = () => {
  const {
    transcription,
    transcriptionLoading,
    transcriptionError,
    setTranscriptionError,
    setTranscription,
    setTranscriptionLoading,
  } = useAppContext();
  const { status, data, error } = useWebSocket(
    !!localStorage.getItem("sessionToken")
  );

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

  return (
    <div>
      {transcriptionError && <p>Transcription error</p>}
      {transcriptionLoading && <p>Loading...</p>}
      {transcription && <p>{transcription}</p>}
    </div>
  );
};

export default AudioTranscription;
