import type { TimecodeFile } from "@/models/fileScheme";
import axios from "axios";

export async function downloadTranscription(id: string) {
  try {
    return (await axios.post<TimecodeFile[]>("/api/file/download_files", [id]))
      .data;
  } catch (e) {
    console.log(e); //FIXME
  }
}
