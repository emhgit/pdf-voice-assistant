import { PDFDocument } from "pdf-lib";
import { PdfField } from "../../shared/src/types";

export const getPdfFields = async (pdfBuffer: Buffer) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const form = pdfDoc.getForm();
  const formFields = form.getFields().map((field) => {
    const name = field.getName();
    const type = field.constructor.name;
    let value = "";
    let isEmpty = true;

    // Try to get value for known field types
    if ("getText" in field) {
      value = (field as any).getText?.() ?? "";
      isEmpty = !value;
    } else if ("isChecked" in field) {
      value = (field as any).isChecked?.() ? "checked" : "";
      isEmpty = !(field as any).isChecked?.();
    } else if ("getOptions" in field) {
      value = (field as any).getSelected?.() ?? "";
      isEmpty = !value;
    }

    return {
      name,
      type,
      isEmpty,
    };
  });
  return formFields;
};

export const transcribeAudio = async (audioBuffer: Buffer, language?: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("audio_file", new Blob([audioBuffer], { type: "audio/webm" }), "recording.webm");
    const response = await fetch("http://localhost:8000/transcribe" + (language ? `?language=${encodeURIComponent(language)}` : ""), {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Transcription service error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
};
