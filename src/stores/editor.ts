import { defineStore } from "pinia";
import { ref } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const fileId = ref("");
  const fileName = ref("");
  const fileDownloadUrl = ref("");

  function reset() {
    fileId.value = "";
    fileName.value = "";
    fileDownloadUrl.value = "";
  }

  return { fileId, fileName, fileDownloadUrl, reset };
});
