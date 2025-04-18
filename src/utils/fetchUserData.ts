import type { User } from "@/models/userScheme";
import { useUserStore } from "@/stores/user";

export default async function () {
  const user = useUserStore();

  const response = await fetch("/api/auth/user_info", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const data = (await response.json()) as User;
    user.username = data.login;
  }
}
