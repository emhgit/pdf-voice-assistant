import React, { createContext, useContext, useEffect, useState } from "react";

type PdfContextType = {
  pdfFile: File | null;
  setPdfFile: (file: File) => void;
};
const PdfContext = createContext<PdfContextType | undefined>(undefined);

export const PdfContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  if (localStorage.getItem("sessionToken")) {
    useEffect(() => {});
  }

  return (
    <PdfContext.Provider value={{ pdfFile, setPdfFile }}>
      {children}
    </PdfContext.Provider>
  );
};

export const usePdfContext = () => {
  const context = useContext(PdfContext);
  if (context === undefined) {
    throw new Error("usePdfContext must be used within a PdfContextProvider");
  }
  return context;
};
