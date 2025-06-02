import { showToast } from "@/utils/toastService";
import { ref, onUnmounted } from "vue";

export function useWebSocket(
  url: string,
  onMessageCallback: (data: any) => void
) {
  const socket = ref<WebSocket | null>(null);
  const isConnected = ref(false);

  const connect = () => {
    socket.value = new WebSocket(url);

    socket.value.onopen = () => {
      isConnected.value = true;
      console.log("WebSocket подключен");
    };

    socket.value.onmessage = (event: MessageEvent) => {
      try {
        showToast({
            severity: "success",
            summary: "Успешно",
            detail: event.data,
            life: 9999000
        })
        const data = JSON.parse(event.data);
        onMessageCallback(data);
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
    socket.value?.close();
  };

  onUnmounted(() => {
    disconnect();
  });

  return { connect, disconnect, isConnected };
}
