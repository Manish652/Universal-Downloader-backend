import isValidUrl from "../utils/validateUrl.js";
import { execAsync } from "../utils/ytDlpUtils.js";


export async function getVideoInfo(req, res) {
  const { url } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const { stdout } = await execAsync(`yt-dlp --dump-json "${url}"`);
    const info = JSON.parse(stdout);

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
    res.status(500).json({ error: 'Failed to fetch video info', details: err.message });
  }
}