import { useUserStore } from "@/stores/user";

export default async function () {
    const store = useUserStore();
    const response = await fetch("/api/auth/logout", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        store.username = "";
    }
}