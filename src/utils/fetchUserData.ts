import type { User } from "@/models/userScheme";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import { useRouter } from "vue-router";

export default async function () {
  const user = useUserStore();
  const router = useRouter();

  try {
    const response = await axios.get<User>("/api/auth/user_info");
    user.username = response.data.login;
  } catch (e) {
    router.push("/login");
  }
}
