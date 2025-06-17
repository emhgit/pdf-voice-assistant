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

  useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken");
    
    if (sessionToken) {
      // Fetch the PDF file from the server
      fetch("http://localhost:2008/api/pdf", {
        headers: {
          "Authorization": `Bearer ${sessionToken}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }
        return response.blob();
      })
      .then(blob => {
        const file = new File([blob], "document.pdf", { type: "application/pdf" });
        setPdfFile(file);
      })
      .catch(error => {
        console.error("Error fetching PDF:", error);
        setPdfFile(null);
      });
    } else {
      setPdfFile(null);
    }
  }, []); // Empty dependency array means this runs once on mount

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
