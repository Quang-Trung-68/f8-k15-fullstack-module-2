const api = axios.create({
  baseURL: "https://spotify.f8team.dev/api/",
});

// Thêm interceptor để gắn Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
