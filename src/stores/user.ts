import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useUserStore = defineStore('user', () => {
    const username = ref("");
    // const imgUrl = ref("");

    const isAuthenticated = computed(() => username.value !== "");

    return {username, isAuthenticated};
})