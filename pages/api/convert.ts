// File: pages/api/convert.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

export const config = {
  api: {
    responseLimit: false, // allow large file streaming
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url, format } = req.body

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  const safeName = `yt-${Date.now()}`
  const ext = format === 'mp3' ? 'mp3' : format === 'mp4' ? 'mp4' : 'webm'
  const tempDir = os.tmpdir()
  const outputPath = path.join(tempDir, `${safeName}.${ext}`)

  let command = `yt-dlp -o "${outputPath}" `
  if (format === 'mp3') command += `-x --audio-format mp3 `
  if (format === 'gif') {
    return res.status(400).json({ error: 'GIF currently not supported in direct download.' })
  }
  command += `"${url}"`

  exec(command, (err, stdout, stderr) => {
    if (err || !fs.existsSync(outputPath)) {
      return res.status(500).json({ error: stderr || 'Conversion failed or file not found.' })
    }

    const stat = fs.statSync(outputPath)
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outputPath)}"`)
    res.setHeader('Content-Length', stat.size)
    const fileStream = fs.createReadStream(outputPath)
    fileStream.pipe(res)
  })
}
