# PDF Voice Assistant

A web application that allows users to fill out PDF forms by speaking. The app captures the user’s voice, transcribes it to text, uses a local language model (e.g. Mistral via Ollama) to extract structured data, maps that data to the form fields of a PDF, and returns the filled-out document. It dynamically supports any fillable PDF and adapts to multiple or non-standard fields based on user input.

Tech Stack:

● Frontend: Vite, React, React Router DOM, TypeScript, TailwindCSS, MicRecorder, File upload

● Backend: Node.js (Express), FastAPI Python microservices (Whisper) and Ollama (Mistral)
● Libraries: pdf-lib, fs, multer.js, ollama

## (WIP)
