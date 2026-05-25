import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "../pages/Home/page";
import { Chat } from "../pages/app/chat";
import { Login } from "../pages/app/login";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/login" element={<Login />} />
        <Route path="/app/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
