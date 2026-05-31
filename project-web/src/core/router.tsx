import { BrowserRouter, Route, Routes } from "react-router";
import { Chat } from "../pages/chat/page";
import { Login } from "../pages/login/page";
import { ROUTES } from "./routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.home} element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
