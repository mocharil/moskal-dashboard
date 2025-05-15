import axios from "axios";

const API_BASE = import.meta.env.VITE_AUTH_API_BASE;

const authService = {
  login: async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append("grant_type", "");
      formData.append("username", username);
      formData.append("password", password);
      formData.append("scope", "");
      formData.append("client_id", "");
      formData.append("client_secret", "");

      const response = await axios.post(`${API_BASE}/auth/login`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data || error.message;
    }
  },

  register: async (email, name, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        email,
        name,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  changePassword: async (current_password, new_password) => {
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const token = authData?.value?.token;

      const response = await axios.post(
        `${API_BASE}/auth/change-password`,
        {
          current_password,
          new_password,
        }, // <-- JSON body
        {
          headers: {
            "Content-Type": "application/json", // <-- JSON header
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Change password error:", error.response?.data || error);
      throw error.response?.data || error.message;
    }
  },

  changeEmail: async (current_email, current_password, new_email) => {
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const token = authData?.value?.token;

      const response = await axios.post(
        `${API_BASE}/auth/change-email`,
        {
          current_email,
          current_password,
          new_email,
        }, // <-- JSON body
        {
          headers: {
            "Content-Type": "application/json", // <-- JSON header
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Change password error:", error.response?.data || error);
      throw error.response?.data || error.message;
    }
  },

  refreshToken: async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const token = authData?.value?.refreshToken;

      const response = await axios.post(
        `${API_BASE}/auth/refresh-token?token=${token}`,
        {},
        {
          headers: {
            "Content-Type": "application/json", // <-- JSON header
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Refresh token error:", error.response?.data || error);
      throw error.response?.data || error.message;
    }
  },

  getUserListGlobal: async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const token = authData?.value?.token;
      const email = authData?.value.email;
      const response = await axios.get(
        `${API_BASE}/project/access/global-access/list?owner_email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      throw error;
    }
  },

  getUserListIndividual: async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const token = authData?.value?.token;
      const email = authData?.value.email;
      const response = await axios.get(
        `${API_BASE}/project/access/individual-project-access/list?owner_email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      throw error;
    }
  },

  createUserGlobal: async (req) => {
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const token = authData?.value?.token;

      const response = await axios.post(
        `${API_BASE}/project/access/global`,
        req,
        {
          headers: {
            "Content-Type": "application/json", // <-- JSON header
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Change password error:", error.response?.data || error);
      throw error.response?.data || error.message;
    }
  },

  createUserIndividual: async (req) => {
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const token = authData?.value?.token;

      const response = await axios.post(
        `${API_BASE}/project/access/project`,
        req,
        {
          headers: {
            "Content-Type": "application/json", // <-- JSON header
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Change password error:", error.response?.data || error);
      throw error.response?.data || error.message;
    }
  },
  deleteUserAccess: async (req) => {
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const token = authData?.value?.token;

      const response = await axios.delete(`${API_BASE}/project/access/remove`, {
        headers: {
          "Content-Type": "application/json", // <-- JSON header
          Authorization: `Bearer ${token}`,
        },
        data: req,
      });

      return response.data;
    } catch (error) {
      console.error("Delete user access error:", error.response?.data || error);
      throw error.response?.data || error.message;
    }
  },
};

export default authService;
