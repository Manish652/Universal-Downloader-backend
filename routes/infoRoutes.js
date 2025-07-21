import express from 'express'
import { getVideoInfo } from '../controllers/infoController.js'

const router = express.Router();

router.post('/info',getVideoInfo);
export default router;