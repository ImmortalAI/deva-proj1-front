import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('user', () => {
    const username = ref("");
    const imgUrl = ref("");

    return {username};
})