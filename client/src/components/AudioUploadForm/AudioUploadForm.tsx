import MicRecorder from "./MicRecorder/MicRecorder";
import AudioTranscribeButton from "./AudioTranscribeButton/AudioTranscribeButton";
import NavButton from "../NavButton/NavButton";
import { canNavigate } from "../../utils/canNavigate";
import { usePdfContext } from "../../context/PdfContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AudioUploadForm = () => {
  const navigate = useNavigate();
  const { pdfFile } = usePdfContext();
  useEffect(() => {
    if (!pdfFile) {
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
