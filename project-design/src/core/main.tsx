import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "../pages/Home/page";
import { ChatEmpty } from "../pages/app/chat-empty";
import { LoginEmpty } from "../pages/app/login-empty";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/login-empty" element={<LoginEmpty />} />
        <Route path="/app/chat-empty" element={<ChatEmpty />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
