import React from 'react'
import PdfView from '../PdfView/PdfView'
import Button from '../Button/Button'

const PdfUploadForm = () => {
  return (
    <form>
      <div>
        <h1>AI PDF Voice Assistant</h1>
      </div>
      <div>
        <PdfView />
      </div>
      <div>
        <Button title="Previous" href={null} />
        <Button title="next" href={null} />
      </div>

    </form>
  )
}

export default PdfUploadForm