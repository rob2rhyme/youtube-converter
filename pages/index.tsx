// File: pages/index.tsx
import { useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState('mp3')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [videoTitle, setVideoTitle] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [fileInfo, setFileInfo] = useState<{ size: string; type: string } | null>(null)

  const fetchInfo = async () => {
    if (!url.trim()) return
    const res = await fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    const data = await res.json()
    if (data.success) {
      setVideoTitle(data.title)
      setThumbnail(data.thumbnail)
    }
  }

  const handleDownload = async () => {
    setMessage('Processing...')
    setProgress(10)
    setFileInfo(null)

    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, format })
    })

    if (!response.ok) {
      const err = await response.json()
      setMessage('Error: ' + err.error)
      setProgress(0)
      return
    }

    const blob = await response.blob()
    const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'download'

    const blobUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(blobUrl)

    setMessage(`Downloaded: ${filename}`)
    setProgress(100)
    setFileInfo({ size: (blob.size / 1024 / 1024).toFixed(2) + ' MB', type: format })
  }

  return (
    <div className={styles.container}>
      <h1>YouTube Converter</h1>
      <div className={styles.form}>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onBlur={fetchInfo}
          placeholder="Enter YouTube URL"
        />
        <select value={format} onChange={e => setFormat(e.target.value)}>
          <option value="mp3">MP3</option>
          <option value="mp4">MP4</option>
          <option value="gif">GIF</option>
        </select>
      </div>

      {thumbnail && (
        <div className={styles.preview}>
          <img src={thumbnail} alt="thumbnail" width="320" />
          <p>{videoTitle}</p>
        </div>
      )}

      <button className={styles.button} onClick={handleDownload}>Convert</button>
      <progress className={styles.progress} value={progress} max="100" />
      <p>{message}</p>

      {fileInfo && (
        <div className={styles.link}>
          <p>{fileInfo.type.toUpperCase()} • {fileInfo.size}</p>
        </div>
      )}

      <div className={styles.disclaimer}>
        <p>
          Downloading YouTube videos may violate copyright policy. Please use it for personal purposes only.<br />
          This app is not responsible for any legal issues. Always respect creators' hard work.
        </p>
      </div>

      <footer className={styles.footer}>
        <p>
          © Created by Robin Thapa.{' '}
          <a href="https://github.com/rob2rhyme" target="_blank" rel="noopener noreferrer">
            Robin Thapa on GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
