import isValidUrl from "../utils/validateUrl.js";
import { execAsync, checkYtDlp } from "../utils/ytDlpUtils.js";
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function getVideoInfo(req, res) {
  const { url, cookies } = req.body;

  // Log the incoming request
  console.log("▶️ [getVideoInfo] Received URL:", url);

  if (!url || !isValidUrl(url)) {
    console.warn("⚠️ [getVideoInfo] Invalid URL:", url);
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    // First check if yt-dlp is available and get the correct command path
    console.log("🔍 [getVideoInfo] Checking yt-dlp availability...");
    let ytDlpCommand;
    try {
      ytDlpCommand = await checkYtDlp();
      console.log("✅ [getVideoInfo] yt-dlp is available");
    } catch (versionError) {
      console.error("❌ [getVideoInfo] yt-dlp not found:", versionError.message);
      return res.status(500).json({ 
        error: 'yt-dlp not available on server', 
        details: 'Video processing tool is not installed on the deployment environment' 
      });
    }

    // Construct the command with cookies if provided
    let command = `${ytDlpCommand} --dump-json "${url}"`;
    if (cookies) {
      const COOKIES_FILE = path.join(os.tmpdir(), 'yt-dlp-cookies.txt');
      try {
        fs.writeFileSync(COOKIES_FILE, cookies);
        console.log('Cookies file written for info fetch successfully.');
        command = `${ytDlpCommand} --cookies ${COOKIES_FILE} --dump-json "${url}"`;
      } catch (error) {
        console.error('Failed to write cookies file for info fetch:', error);
        return res.status(500).json({ error: 'Failed to process cookies for info fetch' });
      }
    }

    // Log command execution
    console.log(`🛠️ [getVideoInfo] Running command: ${command}`);

    const { stdout } = await execAsync(command);
    const info = JSON.parse(stdout);

    // Optional: Log info.title to verify success
    console.log("✅ [getVideoInfo] Fetched title:", info.title);

    res.json({
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      uploader: info.uploader,
      formats: info.formats
        ?.map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          quality: f.height,
          filesize: f.filesize
        }))
        .filter(f => ['mp4', 'webm', 'm4a', 'mp3'].includes(f.ext))
    });

  } catch (err) {
    console.error("❌ [getVideoInfo] Error running yt-dlp:", err.message);
    console.error("📄 Full Error:", err);
    res.status(500).json({ error: 'Failed to fetch video info', details: err.message });
  }
}
