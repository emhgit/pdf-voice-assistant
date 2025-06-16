import { Routes, Route } from "react-router-dom";
import PdfUploadPage from "./pages/PdfUploadPage";
import AudioUploadPage from "./pages/AudioUploadPage";
import TranscriptionPage from "./pages/TranscriptionPage";

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<PdfUploadPage />} />
        <Route path="audio-upload-page" element={<AudioUploadPage />} />
        <Route path="transcription-page" element={<TranscriptionPage />} />
      </Routes>
    </main>
  );
}

export default App;
