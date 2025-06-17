import { useRef, useState } from "react";
import { useAudioContext } from "../../../context/AudioContext";

const MicRecorder = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const { audioBlob, setAudioBlob } = useAudioContext();

  const handleStartBtnClick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setAudioBlob(blob);
      handleUpload();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const handleEndBtnClick = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleUpload = async () => {
    const sessionToken = localStorage.getItem("sessionToken");
    if (!sessionToken || !audioBlob) {
      console.error("Missing session token or audio blob");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
  
    try {
      const res = await fetch("http://localhost:2008/api/audio", {
        headers: {
          "Authorization": `Bearer ${sessionToken}`
        },
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Audio upload successful:", data);
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  }

  return (
    <div>
      {audioURL && <audio controls src={audioURL} />}

      <div className="flex justify-between m-4">
        <div>
          <button
            id="startBtn"
            className="bg-green-500 p-3 rounded-md font-bold"
            onClick={handleStartBtnClick}
          >
            Start Recording
          </button>
        </div>

        <div>
          <button
            id="endBtn"
            className="bg-red-600 p-3 rounded-md font-bold"
            onClick={handleEndBtnClick}
          >
            End Recording
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicRecorder;
