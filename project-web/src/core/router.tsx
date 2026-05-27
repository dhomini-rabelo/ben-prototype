import { BrowserRouter, Route, Routes } from "react-router";
import { Index } from "../pages/Index/page";
import { ROUTES } from "./routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.index} element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}
