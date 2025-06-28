import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../../context/AppContext";

const MicRecorder = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const { audioBlob, audioLoading, audioError, uploadAudio, setAudioBlob } =
    useAppContext();

  useEffect(() => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    setAudioURL(url);
  }, [audioBlob]);

  const handleStartBtnClick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setAudioBlob(blob);
      try {
        await uploadAudio(
          new File([blob], "recording.webm", { type: "audio/webm" })
        );
      } catch (error) {
        console.error("Error uploading audio:", error);
      }
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const handleEndBtnClick = () => {
    mediaRecorderRef.current?.stop();
  };

  return (
    <div>
      {audioLoading && <p>Uploading audio...</p>}
      {audioError && <p>Error: {audioError}</p>}
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
