import type { User } from "@/models/userScheme";
import { useUserStore } from "@/stores/user";
import axios from "axios";

export default async function () {
  const user = useUserStore();

  try {
    const response = await axios.get("/api/auth/user_info");
    const data = response.data as User;
    user.username = data.login;
  } catch (e) {
    console.log(e); // FIXME
  }
}
