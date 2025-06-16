export type PdfMetadata = {
  fileName: string;
  fileSize: number;
  uploadTimestamp: number;
};

export enum pdfFieldTypes {
  TEXT = "TEXT",
  CHECKBOX = "CHECKBOX",
  RADIOBUTTON = "RADIOBUTTON",
  DROPDOWN = "DROPDOWN",
}

export type PdfField = {
  name: string;
  type: pdfFieldTypes;
};

export type Transcription = {
  text: string;
  language: string;
  duration: number; // in seconds
};

export type ExtractedFormData = {
  [fieldName: string]: string;
};

export type PdfUploadFormResponse = {
  message: string;
  sessionId: string;
  pdfMetadata: PdfMetadata;
};
