import { useRef, useState } from "react";

const MicRecorder = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const handleStartBtnClick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      setAudioChunks((prev) => [...prev, event.data]);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      setAudioChunks([]); // clear for next recording
    };

    mediaRecorderRef.current = mediaRecorder;
    setAudioChunks([]);
    mediaRecorder.start();
  };

  const handleEndBtnClick = () => {
    mediaRecorderRef.current?.stop();
  };

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
