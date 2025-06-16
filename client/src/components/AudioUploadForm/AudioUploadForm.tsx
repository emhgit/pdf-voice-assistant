import MicRecorder from "./MicRecorder/MicRecorder";
import AudioTranscribeButton from "./AudioTranscribeButton/AudioTranscribeButton";
import NavButton from "../NavButton/NavButton";

const AudioUploadForm = () => {
  return (
    <div>
      <div>
        <h1>Record Your Instructions</h1>
      </div>

      <div>
        <MicRecorder />
      </div>

      <div>
        <AudioTranscribeButton />
      </div>

      <div className="flex justify-between">
        <NavButton title="Previous" href={""} />
        <NavButton title="Next" href={"transcription-page"} />
      </div>
    </div>
  );
};

export default AudioUploadForm;
