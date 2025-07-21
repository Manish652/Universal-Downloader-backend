import { checkYtDlp } from "../utils/ytDlpUtils.js";

export async function healthCheck(req, res) {
  const ytDlpAvailable = await checkYtDlp();
  res.json({ status: 'ok', ytDlpAvailable });
}