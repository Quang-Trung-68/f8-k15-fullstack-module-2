
const api = axios.create({
  baseURL: "https://spotify.f8team.dev/api/",
});

let requestCount = 0;

// Thêm interceptor để gắn Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    requestCount++;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    requestCount--;
    return response;
  },
  (error) => {
    requestCount--;
    return Promise.reject(error);
  }
);

export default api;
