import { useEffect, useRef } from "react";
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

  // Track if the change is user-initiated
  const isUserChange = useRef(false);
  const userTranscription = useRef(transcription);

  // Only debounce user changes, not WebSocket updates
  const debouncedUserTranscription = useDebounce(
    isUserChange.current ? userTranscription.current : null,
    2000
  );

  useEffect(() => {
    if (debouncedUserTranscription && isUserChange.current) {
      updateTranscription(debouncedUserTranscription);
      isUserChange.current = false;
    }
  }, [debouncedUserTranscription, updateTranscription]);

  // Handle WebSocket status updates
  useEffect(() => {
    if (status === "complete") {
      setTranscription(data.transcription);
      setTranscriptionLoading(false);
      // Reset user change flag when WebSocket updates
      isUserChange.current = false;
    } else if (status === "transcribing") {
      console.log("Transcribing audio...");
      setTranscriptionLoading(true);
    } else if (status === "error") {
      console.error("WebSocket error:", error);
      setTranscriptionLoading(false);
      setTranscriptionError(error || "An error occurred during transcription.");
    }
  }, [
    status,
    data,
    setTranscription,
    setTranscriptionLoading,
    setTranscriptionError,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTranscription(newValue);
    // Mark this as a user change
    isUserChange.current = true;
    userTranscription.current = newValue;
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
