import type { AuthLogoutResponse } from "@/models/authSchema";
import { useUserStore } from "@/stores/user";
import axios from "axios";

export default async function () {
  const store = useUserStore();

  try {
    await axios.post<AuthLogoutResponse>("/api/auth/logout");
    store.username = "";
  } catch (e) {
    console.log(e); // FIXME
  }
}
