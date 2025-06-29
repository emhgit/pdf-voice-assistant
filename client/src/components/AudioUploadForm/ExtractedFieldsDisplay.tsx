import { useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { useWebSocketContext } from "../../context/WebSocketContext";
import useDebounce from "../../hooks/useDebounce";

const ExtractedFieldsDisplay = () => {
  const {
    extractedFields,
    setExtractedFields,
    extractedFieldsLoading,
    setExtractedFieldsLoading,
    extractedFieldsError,
    setExtractedFieldsError,
  } = useAppContext();
  const { status, data, error } = useWebSocketContext();
  const debouncedTranscription = useDebounce(extractedFields, 2000);

  /*
  useEffect(() => {
    if (debouncedTranscription) {
      updateExtractedFields(debouncedTranscription);
    }
  }, [debouncedTranscription, updateExtractedFields]);
*/

  // Handle WebSocket status updates
  useEffect(() => {
    if (status === "complete") {
      setExtractedFields(data.extractedFields);
      setExtractedFieldsLoading(false);
    } else if (status === "extracting") {
      console.log("LLM Processing...");
      setExtractedFieldsLoading(true);
    } else if (status === "error") {
      console.error("WebSocket error:", error);
      setExtractedFieldsLoading(false);
      setExtractedFieldsError(
        error || "An error occurred during LLM processing."
      );
    }
  }, [status]);

  return (
    <div className="extracted-fields-display">
      <h2>Extracted Fields</h2>
      {extractedFields && extractedFields.length > 0 ? (
        <ul>
          {extractedFields.map((field, index) => (
            <li key={index}>
              <strong>{field.name}:</strong> {field.value}
            </li>
          ))}
        </ul>
      ) : (
        <p>No extracted fields available.</p>
      )}
      {extractedFieldsLoading && <div>Loading...</div>}
      {extractedFieldsError && <div>Error extracting fields.</div>}
    </div>
  );
};

export default ExtractedFieldsDisplay;
