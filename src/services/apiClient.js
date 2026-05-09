import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8272/prepzone",
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attach accessToken
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = "Bearer " + token;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = Cookies.get("refreshToken");

        const refreshResponse = await axios.post(
          "http://localhost:8272/prepzone/api/auth/refresh-token",
          { refreshToken }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken;
        Cookies.set("accessToken", newAccessToken);
        Cookies.set("refreshToken", newRefreshToken);

        // Notify AuthContext of token refresh
        window.dispatchEvent(new CustomEvent('tokenRefreshed'));

        processQueue(null, newAccessToken);

        // Retry original request with new access token
        originalRequest.headers["Authorization"] =
          "Bearer " + newAccessToken;

        return api(originalRequest);
      } catch (refreshError) {
        console.log("refresh error",refreshError)
        processQueue(refreshError, null);
        // Notify AuthContext to logout
        window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
