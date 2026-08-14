import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
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

    console.log(
      "API REQUEST:",
      config.method?.toUpperCase(),
      config.url
    );

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => {
    console.log("API RESPONSE:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error(
      "API ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default API;