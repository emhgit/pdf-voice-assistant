import React from 'react'

type PdfViewProps = {
  url: string | undefined;
};

const PdfView = (props : PdfViewProps) => {
  return (
    <iframe src={props.url} width="100%" height="600px" title="PDF Preview" /> 
  );
}

export default PdfView