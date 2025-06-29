import { useEffect, useRef } from "react";
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
    updateExtractedFields,
  } = useAppContext();
  const { status, data, error } = useWebSocketContext();

  // Track if the change is user-initiated
  const isUserChange = useRef(false);
  const userExtractedFields = useRef(extractedFields);

  // Only debounce user changes, not WebSocket updates
  const debouncedUserExtractedFields = useDebounce(
    isUserChange.current ? userExtractedFields.current : null,
    2000
  );

  useEffect(() => {
    if (debouncedUserExtractedFields && isUserChange.current) {
      updateExtractedFields(debouncedUserExtractedFields);
      isUserChange.current = false;
    }
  }, [debouncedUserExtractedFields, updateExtractedFields]);
  // Handle WebSocket status updates
  useEffect(() => {
    if (status === "complete") {
      setExtractedFields(data.extractedFields);
      setExtractedFieldsLoading(false);
      isUserChange.current = false;
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

  const handleChange = (index: number, name: string, value: string) => {
    const newFields = extractedFields || [];
    if (!newFields) return;
    if (newFields[index]) {
      newFields[index] = { name, value };
      setExtractedFields(newFields);
    }
    isUserChange.current = true;
    userExtractedFields.current = newFields;
  };

  return (
    <div className="extracted-fields-display">
      <h2>Extracted Fields</h2>
      {extractedFieldsLoading && <div>Loading...</div>}
      {extractedFieldsError && <div>Error extracting fields.</div>}
      {extractedFields && extractedFields.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {extractedFields.map((field, index) => (
              <tr key={index}>
                <th>{field.name}</th>
                <td>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) =>
                      handleChange(index, field.name, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No extracted fields available.</p>
      )}
    </div>
  );
};

export default ExtractedFieldsDisplay;
