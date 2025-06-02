import type { ErrorResponse } from "@/models/errorSchema";
import { isAxiosError } from "axios";
import { useToast } from "primevue/usetoast";

let toastInstance: ReturnType<typeof useToast> | null = null;

export function setToastInstance(instance: ReturnType<typeof useToast>) {
  toastInstance = instance;
}

export function showToast(options: {
  severity: string;
  summary: string;
  detail: string;
  life?: number;
}) {
  if (toastInstance) {
    toastInstance.add(options);
  } else {
    console.warn("Toast instance not set yet.");
  }
}

export function showAxiosErrorToast<T extends ErrorResponse>(error: unknown, duration = 3000) {
  if (isAxiosError(error) && error.response) {
    showToast({
      severity: "error",
      summary: "Error",
      detail: (error.response.data as T).detail,
      life: duration,
    });
  }
}
