import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "../pages/Home/page";
import { ChatEmpty } from "../pages/app/chat-empty";
import { LoginEdgeExtendedWait } from "../pages/app/login-edge-extended-wait";
import { LoginEmpty } from "../pages/app/login-empty";
import { LoginError } from "../pages/app/login-error";
import { LoginLoading } from "../pages/app/login-loading";
import { LoginPermissionDenied } from "../pages/app/login-permission-denied";
import { BrandMarkPreview } from "../pages/components/brand-mark";
import { ButtonPreview } from "../pages/components/button";
import { ComposerPreview } from "../pages/components/composer";
import { DesignTokens } from "../pages/components/design-tokens";
import { IconButtonPreview } from "../pages/components/icon-button";
import { SuggestedActionPreview } from "../pages/components/suggested-action";
import { TypographyPreview } from "../pages/components/typography";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/login-empty" element={<LoginEmpty />} />
        <Route path="/app/login-loading" element={<LoginLoading />} />
        <Route path="/app/login-error" element={<LoginError />} />
        <Route
          path="/app/login-permission-denied"
          element={<LoginPermissionDenied />}
        />
        <Route
          path="/app/login-edge-extended-wait"
          element={<LoginEdgeExtendedWait />}
        />
        <Route path="/app/chat-empty" element={<ChatEmpty />} />
        <Route path="/components/design-tokens" element={<DesignTokens />} />
        <Route path="/components/typography" element={<TypographyPreview />} />
        <Route path="/components/button" element={<ButtonPreview />} />
        <Route path="/components/icon-button" element={<IconButtonPreview />} />
        <Route path="/components/brand-mark" element={<BrandMarkPreview />} />
        <Route path="/components/composer" element={<ComposerPreview />} />
        <Route path="/components/suggested-action" element={<SuggestedActionPreview />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
