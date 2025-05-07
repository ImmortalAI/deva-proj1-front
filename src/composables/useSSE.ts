import type { TaskSSEResponse } from "@/models/taskSchema";
import { ref, onBeforeUnmount } from "vue";

export function useSSE() {
  const data = ref<TaskSSEResponse | null>(null);
  const error = ref<string | null>(null);
  let es: EventSource | null = null;
  let reconnectTimeout: number | null = null;

  function connect(url: string) {
    if (es) es.close();
    data.value = null;
    error.value = null;

    es = new EventSource(url);
    es.onmessage = (e: MessageEvent) => {
      try {
        data.value = JSON.parse(e.data) as TaskSSEResponse;
      } catch (e) {
        console.error(e);
      }
    };
    es.onerror = (e) => {
      if (data.value?.done) return;
      error.value = "Connection error, retrying in 3 s...";
      es?.close();
      reconnectTimeout = setTimeout(() => connect(url), 3000);
    };
  }

  function disconnect() {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    es?.close();
    es = null;
  }

  onBeforeUnmount(disconnect);

  return { data, error, connect, disconnect };
}
