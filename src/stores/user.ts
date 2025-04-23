import type { User } from "@/models/userScheme";
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
  async function fetchUserData(): Promise<boolean> {
    try {
      const response = await axios.get<User>("/api/auth/user_info");
      if(username.value === response.data.login) {
        return false;
      } else {
        username.value = response.data.login;
        return true;
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        try {
          const tryRefreshResponse = await axios.post("/api/auth/refresh");
          const userResponse = await axios.get<User>("/api/auth/user_info");
          username.value = userResponse.data.login;
          return true;
        } catch {
            username.value = "";
            return true;
        }
      }
      else {
        console.log(e);
        return false;
      }
    }
  }

  const isAuthenticated = computed(() => username.value !== "");

  return { username, isAuthenticated, fetchUserData };
});
