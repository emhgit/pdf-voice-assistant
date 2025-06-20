import MicRecorder from "./MicRecorder/MicRecorder";
import NavButton from "../NavButton/NavButton";
import { useAppContext } from "../../context/AppContext";
import AudioTranscription from "./AudioTranscription/AudioTranscription";

const AudioUploadForm = () => {
  const { audioBlob } = useAppContext();

  return (
    <div>
      <div>
        <h1>Record Your Instructions</h1>
      </div>

      <div>
        <MicRecorder />
      </div>

      <div>
        <AudioTranscription />
      </div>

      <div className="flex justify-between">
        <NavButton title="Previous" href={""} />
        <NavButton title="Next" href={audioBlob ? "transcription-page" : ""} />
      </div>
    </div>
  );
};

export default AudioUploadForm;
