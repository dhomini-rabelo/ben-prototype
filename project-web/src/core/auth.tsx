import Cookies from "js-cookie";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { JWT_COOKIE } from "../api/client";
import { ROUTES } from "./routes";

export function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get(JWT_COOKIE)) {
      navigate(ROUTES.login);
    }
  }, [navigate]);

  return <Outlet />;
}
