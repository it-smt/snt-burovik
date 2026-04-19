import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use((response) => response, (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    // Не редиректим при ошибке логина
    if (status === 401 && !url.includes("/auth/login")) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
    }
    return Promise.reject(error);
});
export default api;
