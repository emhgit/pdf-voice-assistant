import MicRecorder from "./MicRecorder/MicRecorder";
import AudioTranscribeButton from "./AudioTranscribeButton/AudioTranscribeButton";
import NavButton from "../NavButton/NavButton";
import { canNavigate } from "../../utils/canNavigate";
import { usePdfContext } from "../../context/PdfContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAudioContext } from "../../context/AudioContext";

const AudioUploadForm = () => {
  const navigate = useNavigate();
  const { pdfFile } = usePdfContext();

  useEffect(() => {
    if (!pdfFile) {
      //if no pdf file, navigate to pdf upload page
      navigate("/");
    }
  }, [pdfFile, navigate]);

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
