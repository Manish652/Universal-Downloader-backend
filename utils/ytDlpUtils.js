import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { homedir } from "os";
export const execAsync = promisify(execCallback);
export function getYtDlpCommand() {
  const possiblePaths = [
    'yt-dlp', 
    join(homedir(), '.local', 'bin', 'yt-dlp'), 
    '/usr/local/bin/yt-dlp', 
  ];
  return possiblePaths;
}
export async function checkYtDlp() {
  const commands = getYtDlpCommand(); 
  for (const cmd of commands) {
    try {
      await execAsync(`${cmd} --version`);
      console.log(`✅ Found yt-dlp at: ${cmd}`);
      return cmd;
    } catch (error) {
      console.log(`❌ yt-dlp not found at: ${cmd}`);
      continue;
    }}
  throw new Error('yt-dlp not found in any expected location');
}