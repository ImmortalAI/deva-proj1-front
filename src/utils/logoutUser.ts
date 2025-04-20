import { useUserStore } from "@/stores/user";
import axios from "axios";

export default async function () {
  const store = useUserStore();

  try {
    const response = await axios.post("/api/auth/logout");
    if (response.status === 200) {
      store.username = "";
    }
  } catch (e) {
    console.log(e); // FIXME
  }
}
