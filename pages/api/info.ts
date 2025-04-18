import type { NextApiRequest, NextApiResponse } from 'next'
import { exec } from 'child_process'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid URL' })
  }

  const command = `yt-dlp -j ${url}`
  exec(command, (err, stdout) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch video info' })
    }
    try {
      const info = JSON.parse(stdout)
      res.status(200).json({
        success: true,
        title: info.title,
        thumbnail: info.thumbnail
      })
    } catch {
      res.status(500).json({ success: false, error: 'Failed to parse video info' })
    }
  })
}