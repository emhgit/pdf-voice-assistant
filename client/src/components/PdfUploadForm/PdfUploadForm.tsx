import React, { useState } from "react";
import PdfView from "../PdfView/PdfView";
import NavButton from "../NavButton/NavButton";
import type { PdfUploadFormResponse } from "../../../../shared/src/types";

const PdfUploadForm = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
  const [formFilled, setFormFilled] = useState(false);

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

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const res = await fetch("http://localhost:2008/api/pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const pdfUploadFormResponse: PdfUploadFormResponse = await res.json();
      console.log("Upload success:", pdfUploadFormResponse);
      localStorage.setItem("sessionToken", pdfUploadFormResponse.sessionId);
      setFormFilled(true);
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
        <PdfView url={pdfUrl ?? undefined} />
      </div>

      <div>
        <NavButton title="Next" href={formFilled ? "audio-upload-page" : ""} />
      </div>
    </div>
  );
};

export default PdfUploadForm;
