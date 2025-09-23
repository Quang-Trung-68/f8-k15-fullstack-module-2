import api from "../utils/api.js";

// sign up
const registerApi = async (registerData) => {
  const response = await api.post("auth/register", registerData);
  return response.data;
};

const loginApi = async (loginData) => {
  const response = await api.post("auth/login", loginData);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("users/me");
  return response.data;
};

export { registerApi, loginApi, getCurrentUser };
