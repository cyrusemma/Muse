import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadsDir = path.resolve(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destFolder = uploadsDir
    if (file.fieldname === 'audio') {
      destFolder = path.join(uploadsDir, 'tracks')
    } else if (file.fieldname === 'cover') {
      destFolder = path.join(uploadsDir, 'covers')
    } else if (file.fieldname === 'avatar') {
      destFolder = path.join(uploadsDir, 'avatars')
    }

    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true })
    }

    cb(null, destFolder)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueId = uuidv4()
    cb(null, `${uniqueId}${ext}`)
  },
})

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    const validAudioMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/flac',
      'audio/ogg',
      'audio/aac',
      'audio/m4a',
      'audio/x-m4a',
      'audio/mp4',
    ]
    if (validAudioMimes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|flac|ogg|m4a|aac)$/i)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid audio format. Please upload MP3, WAV, FLAC, OGG, or AAC.'))
    }
  } else if (file.fieldname === 'cover' || file.fieldname === 'avatar') {
    const validImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (validImageMimes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid image format. Please upload JPG, PNG, or WebP.'))
    }
  } else {
    cb(null, true)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
})
