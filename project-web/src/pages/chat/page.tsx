import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { JWT_COOKIE } from "../../api/client";
import { ROUTES } from "../../core/routes";
import { ChatScreen } from "./components/chat-screen";

export function Chat() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get(JWT_COOKIE)) {
      navigate(ROUTES.login);
    }
  }, [navigate]);

  return <ChatScreen />;
}
