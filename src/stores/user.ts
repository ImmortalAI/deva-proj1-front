import type { User } from "@/models/userScheme";
import axios from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const username = ref<string>("");

  async function fetchUserData() {
    try {
      const response = await axios.get<User>("/api/auth/user_info");
      username.value = response.data.login;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        username.value = "";
      }
      else {
        console.log(e);
      }
    }
  }

  const isAuthenticated = computed(() => username.value !== "");

  return { username, isAuthenticated, fetchUserData };
});
