import { BrowserRouter, Route, Routes } from "react-router";
import { Login } from "../pages/Login/page";
import { ROUTES } from "./routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.index} element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
