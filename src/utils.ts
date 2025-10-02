import * as fs from 'fs';
import * as path from 'path';

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function getTranscriptFilePath(videoId: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const fileName = `${timestamp}-${videoId}.json`;
  const dir = path.join(process.cwd(), 'temp', 'transcripts');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return path.join(dir, fileName);
}

export function writeTranscriptFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8');
}
