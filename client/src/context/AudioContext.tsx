import { createContext, useContext, useEffect, useState } from "react";

type AudioContextType = {
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken");
    
    if (sessionToken) {
      // Fetch the PDF file from the server
      fetch("http://localhost:2008/api/audio", {
        headers: {
          "Authorization": `Bearer ${sessionToken}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch Audio");
        }
        return response.blob();
      })
      .then(blob => {
        setAudioBlob(blob);
      })
      .catch(error => {
        console.error("Error fetching Audio:", error);
        setAudioBlob(null);
      });
    } else {
      setAudioBlob(null);
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <AudioContext.Provider value={{ audioBlob, setAudioBlob}}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioContext must be used within an AudioContextProvider");
  }
  return context;
};