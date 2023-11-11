import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import formidable from 'formidable'
import { Files, File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // cho phép tạo nhiều folder con
      })
    }
  })
}

export const getNameFromFullName = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop()
  return nameArr.join('')
}

export const getExtension = (filename: string) => {
  const nameArr = filename.split('.')
  return nameArr[nameArr.length - 1]
}

// hàm xử lý file mà client gửi lên
export const handleUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!files.image) {
        return reject(new Error('Image is empty'))
      }

      return resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    // keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('video/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!files.video) {
        return reject(new Error('Video is empty'))
      }

      const videos = files.video as File[]
      videos.forEach((video) => {
        // lấy ra tên cũ và lấy ra đuuôi file (mp4, avi, ...)
        const ext = getExtension(video.originalFilename as string)
        // dùng cái tên mới + đuôi file để thành tên mới đầy đủ
        fs.renameSync(video.filepath, `${video.filepath}.${ext}`)
        video.newFilename = `${video.newFilename}.${ext}`
      })

      return resolve(files.video as File[])
    })
  })
}
