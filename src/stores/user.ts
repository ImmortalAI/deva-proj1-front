import type {
  AuthRefreshResponse,
  AuthUserInfoResponse,
} from "@/models/authSchema";
import axios from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axiosI from "@/utils/axiosInstance";

export const useUserStore = defineStore("user", () => {
  const user_id = ref<string>("");
  const username = ref<string>("");

  const apiClientInternal = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
  });

  /**
   * Fetches a new access token if the one stored in the cookies is invalid
   * or expired. If the refresh token is also invalid, the user is logged
   * out.
   */
  async function refreshToken() {
    await apiClientInternal.post<AuthRefreshResponse>("/auth/refresh");
  }

  /**
   * Logs the user out. This will clear the user's session from the backend,
   * and update the store to reflect that the user is no longer logged in.
   */
  async function logout() {
    await apiClientInternal.post("/auth/logout");
    user_id.value = "";
    username.value = "";
  }

  /**
   * Fetches the authenticated user's data from the server and updates
   * the store with the retrieved username. If the request fails, the
   * error is logged to the console.
   */
  async function fetchUserData(): Promise<void> {
    try {
      const response = await axiosI.get<AuthUserInfoResponse>(
        "/auth/user_info"
      );
      user_id.value = response.data.id;
      username.value = response.data.login;
    } catch (e) {
      console.log(e);
    }
  }

  const isAuthenticated = computed(() => username.value !== "");

  return { user_id, username, isAuthenticated, fetchUserData, refreshToken, logout };
});
