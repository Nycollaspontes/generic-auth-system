import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../context/Auth.Context";
import { AuthTokentError } from "./errors/AuthTokenError";

let isRefreshing = false;
let failedRequestQueue = [];

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const apiAuth = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["nextauth.token"]}`,
    },
  });

  apiAuth.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === "token.expired") {
          // renovar o token, ou seja, RefreshTOken
          cookies = parseCookies(ctx); //atualizar os cookies sempre que fizer algo

          const { "nextauth.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            console.log('Refresshhh')
            isRefreshing = true;

            apiAuth
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { refreshToken: newRefreshToken, token } = response.data;

                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 30 * 24 * 60 * 60, //30 days,
                  path: "/",
                });
                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  newRefreshToken,
                  {
                    maxAge: 30 * 24 * 60 * 60, //30 days,
                    path: "/",
                  }
                );

                apiAuth.defaults.headers["Authorization"] = `Bearer ${token}`;

                failedRequestQueue.forEach((request) =>
                  request.onSucess(token)
                );
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];

                if (typeof window !== "undefined") {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
            return new Promise((resolve, reject) => {
              failedRequestQueue.push({
                onSucess: (token: string) => {
                  originalConfig.headers["Authorization"] = `Bearer ${token}`;
                  resolve(apiAuth(originalConfig));
                },
                onFailure: (err: AxiosError) => {
                  reject(err);
                },
              });
            });
          } else {
          }
        }
      } else {
        if (typeof window !== "undefined") {
          signOut();
        } else {
          return Promise.reject(new AuthTokentError())
        }
      }

      return Promise.reject(error);
    }
  );
  return apiAuth;
}
