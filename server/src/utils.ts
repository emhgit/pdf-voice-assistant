import { PDFDocument } from "pdf-lib";
import { PdfField } from "../../shared/src/types";

export const getPdfFields = async (pdfBuffer: Buffer) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const form = pdfDoc.getForm();
  const formFields = form.getFields().map((field) => {
    const name = field.getName();
    const type = field.constructor.name;
    let value = "";
    let isEmpty = true;

    // Try to get value for known field types
    if ("getText" in field) {
      value = (field as any).getText?.() ?? "";
      isEmpty = !value;
    } else if ("isChecked" in field) {
      value = (field as any).isChecked?.() ? "checked" : "";
      isEmpty = !(field as any).isChecked?.();
    } else if ("getOptions" in field) {
      value = (field as any).getSelected?.() ?? "";
      isEmpty = !value;
    }

    return {
      name,
      type,
      isEmpty,
    };
  });
  return formFields;
};
