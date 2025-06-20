import { Routes, Route } from "react-router-dom";
import PdfUploadPage from "./pages/PdfUploadPage";
import AudioUploadPage from "./pages/AudioUploadPage";
import TranscriptionPage from "./pages/TranscriptionPage";
import { PostUploadLayout } from "./components/layout/PostUploadLayout";

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<PdfUploadPage />} />

        {/* All routes below require sessionToken */}
        <Route element={<PostUploadLayout />}>
          <Route path="audio-upload-page" element={<AudioUploadPage />} />
          <Route path="transcription-page" element={<TranscriptionPage />} />
        </Route>
        
      </Routes>
    </main>
  );
}

export default App;
