import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/auth`;

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
};

export const saveSession = (data, fallbackUsername = "") => {
    const token = typeof data === "string" ? data : data.token;
    if (!token) {
        throw new Error("Phản hồi đăng nhập không hợp lệ");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("username", data.username || fallbackUsername);
    localStorage.setItem("role", (data.role || "EMPLOYEE").replace("ROLE_", ""));
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
};

export const getToken = () => localStorage.getItem("token");
export const isLoggedIn = () => Boolean(getToken());
