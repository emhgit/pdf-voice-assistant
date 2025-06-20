**1\. Project Summary** 

Title: Voice-Powered AI PDF Form Assistant 

Overview: 

A web application that allows users to fill out PDF forms by speaking. The app captures the user’s voice, transcribes it to text, uses a local language model (e.g. Mistral via Ollama) to extract structured data, maps that data to the form fields of a PDF, and returns the filled-out document. It dynamically supports any fillable PDF and adapts to multiple or non-standard fields based on user input. 

Tech Stack: 

● Frontend: React, Web Speech API / mic access, File upload 

● Backend: Node.js (Express), Python microservices (Whisper), Ollama (Mistral) ● Libraries: pdf-lib, fs, body-parser, etc. 

**2\. Functional Requirements** 

**User Features** 

● Upload a fillable PDF form. 

● Record voice input or upload audio. 

● View extracted data before submission (optional). 

● Download the filled PDF. 

● Optionally edit or confirm AI interpretations. 

**System Features** 

● Extract all form field names from uploaded PDF.  
● Transcribe audio using local Whisper backend. 

● Use local LLM (via Ollama) to: 

○ Understand user speech. 

○ Map data to available form fields. 

○ Handle multiple values or repeated field patterns. 

● Dynamically fill out PDFs using field-value mapping. 

● Handle unmatched data by appending it to a new section in the PDF (optional). 

**Non-Functional Requirements** 

● Must work offline or locally (no external APIs). 

● Fast processing (\<10s preferred for \~1 min speech). 

● Secure handling of uploaded files. 

● Modular backend (STT, NLU, and PDF logic decoupled). 

**3\. Data Schema** 

**PDF Metadata:** 

type PDFField \= { 

name: string; 

type: 'Text' | 'Checkbox' | 'RadioButton' | 'Dropdown'; 

}; 

**Speech Transcription** 

**LLM Extraction Output** 

type ExtractedFormData \= { 

\[fieldName: string\]: string; 

}; 

**Request Flow Between Services** 

type FormFillRequest \= { 

pdfFile: File; 

audioFile: File; 

}; 

type BackendParsedData \= { 

fieldsFromPDF: PDFField\[\]; 

transcription: Transcription; 

aiExtractedValues: ExtractedFormData; }; 

**4\. Pages** 

�� 1\. PDF Upload Page 

PDFUploadForm 

File input \+ upload button for selecting a PDF PDFPreview 

Displays the uploaded PDF using an \<iframe\> NavigationButton 

“Next” button to go to audio step 

�� 2\. Audio Upload / Recording Page AudioRecorder 

Start/stop mic recording (using MediaRecorder)  
AudioUploadForm 

Upload an audio file manually 

WaveformPreview 

Canvas/wavesurfer.js waveform of the recording (optional) AudioTranscribeButton 

Button to trigger audio transcription 

NavigationButton 

“Back” and “Next” buttons 

�� 3\. Transcription \+ Extracted Fields Preview Page TranscriptDisplay 

Shows raw transcription text with optional timestamps ExtractedDataTable 

Table of field → extracted value 

FieldEditor 

Optional form for editing extracted data (could be part of table) NavigationButton 

“Back”, “Confirm”, “Next” buttons 

�� 4\. Filled PDF Download Page 

FinalPDFPreview 

Displays the final filled PDF (\<iframe\> or viewer) 

DownloadButton 

Triggers download from /api/download  
NavigationButton 

“Start Over” or “Exit” buttons 

**5\. Sequence Diagram** 

User 

│ 

▼ 

\[1\] Upload PDF → Frontend (React) 

│ 

▼ 

POST /api/pdf → Backend (Express) 

│ 

▼ 

Parse PDF fields w/ pdf-lib 

│ 

▼ 

Respond OK \+ show PDF in iframe 

│ 

▼ 

\[2\] Record/Upload Audio → Frontend 

│ 

▼ 

POST /api/audio → Backend 

│ 

▼ 

Call Whisper service → Transcribe text │ 

▼ 

Return transcription 

│ 

▼ 

\[3\] POST /api/process → Call LLM (Mistral/Ollama) │ 

▼ 

Extracted JSON field-values returned 

│ 

▼ 

Map to PDF fields → Fill PDF → Save buffer │  
▼ 

\[4\] GET /api/download → Return filled PDF  
\[Revision: Workflow Update \- Session Persistence and File Handling\] 

This project now uses a server-generated session ID with in-memory storage (e.g., Map) to persist the uplThis prevents redundant file uploads and enables smooth transitions between steps. 

Updated Workflow Sequence: 

1\. POST /api/pdf   
\- Upload PDF and extract fields.   
\- Save PDF buffer in memory.   
\- Return extracted field metadata and sessionId (UUID). 

2\. POST /api/audio   
\- Upload or record audio.   
\- Transcribe using Whisper.   
\- Save audio and transcript in memory, keyed by sessionId. 

3\. POST /api/process   
\- Retrieve stored PDF and transcript using sessionId.   
\- Run local LLM (Mistral via Ollama) to extract field values.   
\- Fill PDF using pdf-lib.   
\- Save filled PDF in memory. 

4\. GET /api/download?sessionId=...   
\- Return the filled PDF from memory. 

This design maintains local-first behavior while reducing redundant client-server interactions.