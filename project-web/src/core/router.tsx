import { BrowserRouter, Route, Routes } from "react-router";
import { Chat } from "../pages/chat/page";
import { Login } from "../pages/login/page";
import { TaskWorkspace } from "../pages/task-workspace/page";
import { Auth } from "./auth";
import { ROUTES } from "./routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />
        <Route element={<Auth />}>
          <Route path={ROUTES.chat} element={<Chat />} />
          <Route path={ROUTES.taskWorkspace()} element={<TaskWorkspace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
