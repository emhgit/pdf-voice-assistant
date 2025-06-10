import React from 'react'
import MicRecorder from './MicRecorder/MicRecorder'
import AudioTranscribeButton from './AudioTranscribeButton/AudioTranscribeButton'
import NavButton from '../NavButton/NavButton';

const AudioUploadForm = () => {
  return (
    <div>
        <div>
          <h1>Record Your Instructions</h1>
        </div>
        
        <div>
          <MicRecorder />
        </div>

        <div>
          <AudioTranscribeButton />
        </div>

        <div>
          <NavButton title="Previous" href={undefined} />
          <NavButton title="Next" href={undefined} />
      </div>
    </div>
  );
}

export default AudioUploadForm