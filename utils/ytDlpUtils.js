import { exec as execCallback } from "child_process";
import { promisify } from "util";

export const execAsync = promisify(execCallback); 

export async function checkYtDlp() {
  try {
    await execAsync('yt-dlp --version');
    return true;
  } catch {
    return false;
  }
}
