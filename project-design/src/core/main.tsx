import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "../pages/Home/page";
import { ChatAwaitingReply } from "../pages/app/chat-awaiting-reply";
import { ChatComposing } from "../pages/app/chat-composing";
import { ChatEdgeCases } from "../pages/app/chat-edge-cases";
import { ChatEmpty } from "../pages/app/chat-empty";
import { ChatError } from "../pages/app/chat-error";
import { ChatLoading } from "../pages/app/chat-loading";
import { ChatOffline } from "../pages/app/chat-offline";
import { ChatPermissionDenied } from "../pages/app/chat-permission-denied";
import { ChatPopulated } from "../pages/app/chat-populated";
import { ChatRecording } from "../pages/app/chat-recording";
import { ChatTranscribing } from "../pages/app/chat-transcribing";
import { LoginEdgeExtendedWait } from "../pages/app/login-edge-extended-wait";
import { LoginEmpty } from "../pages/app/login-empty";
import { LoginError } from "../pages/app/login-error";
import { LoginLoading } from "../pages/app/login-loading";
import { LoginPermissionDenied } from "../pages/app/login-permission-denied";
import { BrandMarkPreview } from "../pages/components/brand-mark";
import { ButtonPreview } from "../pages/components/button";
import { CaptureCardPreview } from "../pages/components/capture-card";
import { ChatBannerPreview } from "../pages/components/chat-banner";
import { ChatInputPreview } from "../pages/components/chat-input";
import { ComposerPreview } from "../pages/components/composer";
import { DesignTokens } from "../pages/components/design-tokens";
import { IconButtonPreview } from "../pages/components/icon-button";
import { LedgerPeekPreview } from "../pages/components/ledger-peek";
import { MessageBubblePreview } from "../pages/components/message-bubble";
import { SuggestedActionPreview } from "../pages/components/suggested-action";
import { TypingIndicatorPreview } from "../pages/components/typing-indicator";
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
        <Route path="/app/chat-loading" element={<ChatLoading />} />
        <Route path="/app/chat-populated" element={<ChatPopulated />} />
        <Route path="/app/chat-composing" element={<ChatComposing />} />
        <Route path="/app/chat-recording" element={<ChatRecording />} />
        <Route path="/app/chat-transcribing" element={<ChatTranscribing />} />
        <Route
          path="/app/chat-awaiting-reply"
          element={<ChatAwaitingReply />}
        />
        <Route path="/app/chat-error" element={<ChatError />} />
        <Route
          path="/app/chat-permission-denied"
          element={<ChatPermissionDenied />}
        />
        <Route path="/app/chat-offline" element={<ChatOffline />} />
        <Route path="/app/chat-edge-cases" element={<ChatEdgeCases />} />
        <Route path="/components/design-tokens" element={<DesignTokens />} />
        <Route path="/components/typography" element={<TypographyPreview />} />
        <Route path="/components/button" element={<ButtonPreview />} />
        <Route path="/components/icon-button" element={<IconButtonPreview />} />
        <Route path="/components/brand-mark" element={<BrandMarkPreview />} />
        <Route path="/components/composer" element={<ComposerPreview />} />
        <Route
          path="/components/chat-input"
          element={<ChatInputPreview />}
        />
        <Route
          path="/components/message-bubble"
          element={<MessageBubblePreview />}
        />
        <Route
          path="/components/typing-indicator"
          element={<TypingIndicatorPreview />}
        />
        <Route
          path="/components/ledger-peek"
          element={<LedgerPeekPreview />}
        />
        <Route
          path="/components/capture-card"
          element={<CaptureCardPreview />}
        />
        <Route
          path="/components/chat-banner"
          element={<ChatBannerPreview />}
        />
        <Route
          path="/components/suggested-action"
          element={<SuggestedActionPreview />}
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
