import { QueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import Cookies from "js-cookie";
import { ROUTES } from "../core/routes";

export const BASE_URL = import.meta.env.VITE_BACKEND_URL as string;

export const JWT_COOKIE = "@ben/jwttoken";
export const PROVIDER_COOKIE = "@ben/authprovidertoken";

export const basicClient = axios.create({ baseURL: BASE_URL });

export const authClient = axios.create({ baseURL: BASE_URL });

authClient.interceptors.request.use((config) => {
  config.headers.set("jwtauthenticationtoken", Cookies.get(JWT_COOKIE) ?? "");
  config.headers.set(
    "providerauthenticationtoken",
    Cookies.get(PROVIDER_COOKIE) ?? "",
  );
  return config;
});

authClient.interceptors.response.use(
  function onFulfilled(response) {
    const updatedToken = response.headers["updatedjwtauthenticationtoken"];
    if (updatedToken) {
      Cookies.set(JWT_COOKIE, updatedToken);
    }
    return response;
  },
  function onRejected(error: AxiosError) {
    if (error.response?.status === 401) {
      Cookies.remove(JWT_COOKIE);
      Cookies.remove(PROVIDER_COOKIE);
      location.pathname = ROUTES.login;
    }
    return Promise.reject(error);
  },
);

export const queryClient = new QueryClient();
