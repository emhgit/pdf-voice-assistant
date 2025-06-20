import { useState } from "react";

export const useSubmitted = () => {
  const [submitted, setSubmitted] = useState(false);
  return { submitted, setSubmitted };
};
