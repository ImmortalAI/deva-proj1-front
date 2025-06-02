import { showToast } from "@/utils/toastService";
import { ref, onUnmounted } from "vue";

export function useWebSocket(
  url: string
) {
  const socket = ref<WebSocket | null>(null);
  const rawMessage = ref<string | null>(null);
  const parsedMessage = ref<any | null>(null);
  const isConnected = ref(false);

  const connect = () => {
    socket.value = new WebSocket(url);

    socket.value.onopen = () => {
      isConnected.value = true;
      console.log("WebSocket подключен");
    };

    socket.value.onmessage = (event: MessageEvent) => {
      try {
        rawMessage.value = event.data;
        parsedMessage.value = JSON.parse(event.data);
      } catch (e) {
        console.error("Ошибка парсинга JSON:", e);
      }
    };

    socket.value.onerror = (error) => {
      console.error("WebSocket ошибка:", error);
    };

    socket.value.onclose = () => {
      isConnected.value = false;
      console.log("WebSocket отключен");
    };
  };

  const disconnect = () => {
    console.log("WebSocket убит");
    socket.value?.close();
  };

  return { connect, disconnect, isConnected, rawMessage, parsedMessage };
}
