import React, { useState } from "react";
import PdfView from "../PdfView/PdfView";
import NavButton from "../NavButton/NavButton";

const PdfUploadForm = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    console.log(file);
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      console.log(pdfUrl);
    }
  };

  const handleFormSubmit = (e: any) => {
    //make post request to backend
  };

  return (
    <div>
      <div>
        <h1>AI PDF Voice Assistant</h1>
      </div>

      <div>
        <form onSubmit={handleFormSubmit}>
          <fieldset>
            <input type="file" onChange={handleFileChange} />
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
        <NavButton title="Next" href={"audio-upload-page"} />
      </div>
    </div>
  );
};

export default PdfUploadForm;
