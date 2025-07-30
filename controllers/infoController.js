import isValidUrl from "../utils/validateUrl.js";
import { execAsync, checkYtDlp } from "../utils/ytDlpUtils.js";

export async function getVideoInfo(req, res) {
  const { url } = req.body;

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

    // Log command execution
    console.log(`🛠️ [getVideoInfo] Running command: ${ytDlpCommand} --dump-json "${url}"`);

    const { stdout } = await execAsync(`${ytDlpCommand} --dump-json "${url}"`);
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
