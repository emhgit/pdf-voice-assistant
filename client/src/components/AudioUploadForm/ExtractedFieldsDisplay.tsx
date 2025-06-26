import { useAppContext } from "../../context/AppContext";

const ExtractedFieldsDisplay = () => {
  const { extractedFields, extractedFieldsLoading, extractedFieldsError } =
    useAppContext();
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
