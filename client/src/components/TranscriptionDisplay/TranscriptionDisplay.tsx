type TranscriptionDisplayProps = {
  transcription: string | null;
};

const TranscriptionDisplay = (props: TranscriptionDisplayProps) => {
  return (
    <div>
      <p>{props?.transcription}</p>
    </div>
  );
};

export default TranscriptionDisplay;
