import type {
  AuthRefreshResponse,
  AuthUserInfoResponse,
} from "@/models/authSchema";
import axios from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const username = ref<string>("");

  /**
   * Fetches user data and updates the store if the user is authenticated.
   * If the user is not authenticated, this function will attempt to refresh the token.
   * If the token is refreshed successfully, this function will fetch the user data and update the store.
   * If the token cannot be refreshed, this function will update the store with an empty string.
   * @returns true if the store was updated, false otherwise.
   */
  async function fetchUserData(): Promise<void> {
    try {
      const response = await axios.get<AuthUserInfoResponse>(
        "/api/auth/user_info"
      );
      username.value = response.data.login;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        try {
          const tryRefreshResponse = await axios.post<AuthRefreshResponse>(
            "/api/auth/refresh"
          );
          const userResponse = await axios.get<AuthUserInfoResponse>(
            "/api/auth/user_info"
          );
          username.value = userResponse.data.login;
        } catch {
          username.value = "";
        }
      } else {
        console.log(e);
      }
    }
  }

  const isAuthenticated = computed(() => username.value !== "");

  return { username, isAuthenticated, fetchUserData };
});
