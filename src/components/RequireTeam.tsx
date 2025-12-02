import { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: ReactElement;
};

const RequireTeam = ({ children }: Props) => {
  const location = useLocation();
  const raw = typeof window !== "undefined" ? localStorage.getItem("teamSession") : null;

  if (!raw) {
    return <Navigate to="/team/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireTeam;


