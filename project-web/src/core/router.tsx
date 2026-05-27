import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "../pages/Home/page";
import { Login } from "../pages/Login/page";
import { ROUTES } from "./routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.home} element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
