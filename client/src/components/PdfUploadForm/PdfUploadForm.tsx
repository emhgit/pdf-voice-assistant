import React, { useEffect, useState } from "react";
import PdfView from "../PdfView/PdfView";
import NavButton from "../NavButton/NavButton";
import type { PdfUploadFormResponse } from "../../../../shared/src/types";
import { useAppContext } from "../../context/AppContext";
import { useSubmitted } from "../../hooks/useSubmitted";
import { useWebSocketContext } from "../../context/WebSocketContext";

const PdfUploadForm = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { setSessionToken } = useAppContext();
  const { submitted, setSubmitted } = useSubmitted();
  const { pdfFile, pdfLoading, pdfError, uploadPdf, setPdfFile, updatePdf } =
    useAppContext();
  const { connected } = useWebSocketContext();

  useEffect(() => {
    if (!pdfFile) return;
    const url = URL.createObjectURL(pdfFile);
    setPdfUrl(url);
    setSubmitted(true);
  }, [pdfFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!pdfFile) return;
    try {
      if (localStorage.getItem("sessionToken")) {
        // If the PDF is already initialized, we update it
        updatePdf(pdfFile);
      } else {
        let pdfUploadFormResponse: PdfUploadFormResponse = await uploadPdf(
          pdfFile
        );
        if (pdfUploadFormResponse?.sessionId) {
          setSessionToken(pdfUploadFormResponse.sessionId);
        }
      }
      // Optionally refetch or update state here
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col">
      <div>
        <h1>AI PDF Voice Assistant</h1>
      </div>

      <div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <fieldset>
            <input type="file" onChange={handleFileChange} required />
          </fieldset>

          <fieldset>
            <button type="submit">Submit</button>
          </fieldset>
        </form>
      </div>

      <div>
        {pdfLoading && <p>Uploading PDF...</p>}
        {pdfError && <p>Error: {pdfError}</p>}
        <PdfView url={pdfUrl ?? undefined} />
      </div>

      <div>
        {connected ? (
          <p>WebSocket connected</p>
        ) : (
          <p>WebSocket not connected</p>
        )}
      </div>

      <div>
        <NavButton title="Next" href={submitted ? "audio-upload-page" : ""} />
      </div>
    </div>
  );
};

export default PdfUploadForm;
