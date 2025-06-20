import { SessionInitializer } from "../SessionInitializer";
import { Navigate, Outlet } from "react-router-dom";

export const PostUploadLayout = () => {
  return (
    <>
      <SessionInitializer />
      {localStorage.getItem("sessionToken") ? <Outlet /> : <Navigate to="/" replace />}
    </>
  );
};
