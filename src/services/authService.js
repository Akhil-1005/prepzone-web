 
import Cookies from "js-cookie";
import api from "./apiClient";



export const login = async (payload) => {
  try {
    const response = await api.post("api/auth/signin", payload);

    const { token, refreshToken, id } = response.data.data;

    Cookies.set("accessToken", token, {
      secure: false,
      sameSite: "Lax",
    });

    Cookies.set("refreshToken", refreshToken, {
      secure: false,
      sameSite: "Lax",
    });

    Cookies.set("userId", id, {
      secure: false,
      sameSite: "Lax",
    });

    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const signUp = (payload) => {
  const response = api.post("/api/auth/signup", payload);
  return response;
};

export const refreshToken = () => {
  const token = Cookies.get("refreshToken");
  return api.post("/api/auth/refresh-token", { refreshToken: token });
};
