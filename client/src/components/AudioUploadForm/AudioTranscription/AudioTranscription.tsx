import { useAppContext } from "../../../context/AppContext";

const AudioTranscription = () => {
  const { transcription, transcriptionLoading, transcriptionError } =
    useAppContext();

  return (
    <div>
      {transcriptionError && <p>Transcription error</p>}
      {transcriptionLoading && <p>Loading...</p>}
      {transcription && <p>{transcription}</p>}
    </div>
  );
};

export default AudioTranscription;
