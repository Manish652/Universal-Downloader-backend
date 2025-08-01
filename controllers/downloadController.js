import path from 'path'
import os from 'os'
import fs from 'fs'
import { spawn } from 'child_process'
import isValidUrl from '../utils/validateUrl.js'
import { checkYtDlp } from '../utils/ytDlpUtils.js'

const activeDownloads = new Map();
const COOKIES_FILE = path.join(os.tmpdir(), 'yt-dlp-cookies.txt'); // Define cookies file path

export const startDownload = async (req, res) => {
  const { url, type, quality, format, cookies } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({
      error: 'Invalid URL',
      details: 'Please provide a valid URL'
    });
  }

  const ytDlpAvailable = await checkYtDlp();
  if (!ytDlpAvailable) {
    return res.status(500).json({
      error: 'yt-dlp not installed',
      details: 'Use: pip install yt-dlp'
    });
  }

  const downloadId = Date.now().toString();
  const outputDir = path.join(os.homedir(), 'Downloads');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `%(title)s.%(ext)s`);
  let filter = '';
  let outputFormat = format || 'mp4';

  if (type === 'audio') {
    if (format === 'mp3') {
      filter = 'bestaudio/best';
      outputFormat = 'mp3';
    } else {
      filter = `bestaudio[ext=${format || 'm4a'}]/bestaudio`;
    }
  } else if (type === 'video') {
    const qFilter = quality ? `[height<=${quality}]` : '';
    filter = `bestvideo[ext=${format || 'mp4'}]${qFilter}/best[ext=${format || 'mp4'}]${qFilter}/best`;
  } else {
    const qFilter = quality ? `[height<=${quality}]` : '';
    const video = `bestvideo[ext=${format || 'mp4'}]${qFilter}`;
    const audio = `bestaudio[ext=m4a]/bestaudio`;
    filter = `${video}+${audio}/best[ext=${format || 'mp4'}]${qFilter}/best`;
  }

  if (cookies) {
    try {
      fs.writeFileSync(COOKIES_FILE, cookies);
      console.log('Cookies file written successfully.');
    } catch (error) {
      console.error('Failed to write cookies file:', error);
      return res.status(500).json({ error: 'Failed to process cookies' });
    }
  }

  const cmd = [
    'yt-dlp',
    '--cookies', COOKIES_FILE,
    '-f', filter,
    '--merge-output-format', outputFormat,
    '--concurrent-fragments', '5', // Add this line for faster downloads
    '-o', outputPath,
    '--newline',
    '--no-warnings'
  ];

  if (type === 'audio' && format === 'mp3') {
    cmd.push('--extract-audio', '--audio-format', 'mp3', '--audio-quality', '192K');
  }

  cmd.push(url);

  const child = spawn(cmd[0], cmd.slice(1), { stdio: ['ignore', 'pipe', 'pipe'] });

  activeDownloads.set(downloadId, {
    process: child,
    progress: 0,
    status: 'starting'
  });

  child.stdout.on('data', data => {
    const text = data.toString();
    const match = text.match(/(\d+\.?\d*)%/);
    if (match) {
      activeDownloads.get(downloadId).progress = parseFloat(match[1]);
      activeDownloads.get(downloadId).status = 'downloading';
    }
  });

  child.stderr.on('data', data => {
    console.error('yt-dlp error:', data.toString());
    activeDownloads.get(downloadId).error = data.toString();
  });

  child.on('close', code => {
    const d = activeDownloads.get(downloadId);
    if (code === 0) {
      d.status = 'completed';
      d.progress = 100;
    } else {
      d.status = 'failed';
      // Send an explicit error response if the download failed and there's an error message
      if (d.error) {
        // You might want to emit an event or send a specific message to the client
        // indicating the failure and the error details.
        // For now, let's just log it more prominently.
        console.error(`Download ${downloadId} failed with error:`, d.error);
        // If you had a way to send an error back to the original requestor,
        // you would do it here. For example, if you had a WebSocket connection
        // associated with this downloadId.
      } else {
        console.error(`Download ${downloadId} failed with exit code:`, code);
      }
    }

    setTimeout(() => {
      activeDownloads.delete(downloadId);
    }, 5000);
  });

  res.json({ success: true, downloadId, status: 'starting' });
};

export const getProgress = (req, res) => {
  const { downloadId } = req.params;
  const d = activeDownloads.get(downloadId);
  if (!d) {
    return res.status(404).json({ error: 'Download not found' });
  }
  // Include the error message if the download has failed
  res.json({ downloadId, ...d, error: d.error || null });
};

export const cancelDownload = (req, res) => {
  const { downloadId } = req.params;
  const d = activeDownloads.get(downloadId);
  if (!d) {
    return res.status(404).json({ error: 'Download not found' });
  }
  d.process.kill();
  activeDownloads.delete(downloadId);
  res.json({ success: true, message: 'Download cancelled' });
};