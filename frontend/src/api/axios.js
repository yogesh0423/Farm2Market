import axios from "axios";

const API = axios.create({
  baseURL: "https://ophitic-deloris-streaky.ngrok-free.app/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API ERROR:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default API;