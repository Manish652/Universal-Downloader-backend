import express from 'express';
import {
  startDownload,
  getProgress,
  cancelDownload
} from '../controllers/downloadController.js';

const router = express.Router();

router.post('/download', startDownload);
router.get('/progress/:downloadId', getProgress);
router.delete('/download/:downloadId', cancelDownload);

export default router;
