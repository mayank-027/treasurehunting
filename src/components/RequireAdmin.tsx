import { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: ReactElement;
};

const RequireAdmin = ({ children }: Props) => {
  const location = useLocation();
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAdmin;


