# YouTube Transcript Fetcher

A TypeScript tool that fetches YouTube video transcripts and saves them locally. Uses the MCP (Model Context Protocol) YouTube Transcript server via Docker.

## Why This Exists

Calling YouTube transcript APIs directly from AI tools wastes massive tokens writing the entire transcript. This script dumps transcripts to disk instantly, saving 100K+ tokens per multi-hour video.

## Prerequisites

- Node.js (v18+)
- pnpm
- Docker

## Installation

```bash
make install
```

Or manually:

```bash
pnpm install
```

## Usage

### Quick Start

Run `make help` to see all available commands:

```bash
make help
```

### Start MCP Server

The script requires the MCP YouTube Transcript Docker container running:

```bash
docker run --rm -i mcp/youtube-transcript
```

Keep this running in a separate terminal, or the script will fail with "MCP server is not running".

### Fetch Transcript

```bash
make transcript url="<youtube-url>" [lang=<language-code>]
```

**Examples:**

```bash
# English transcript (default)
make transcript url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Chinese transcript
make transcript url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" lang=zh

# Japanese transcript
make transcript url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" lang=ja
```

**Supported URL formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

### Output

Transcripts save to: `temp/transcripts/{timestamp}-{videoId}.json`

Format:
```json
{
  "title": "Video Title",
  "transcript": "Full transcript text...",
  "next_cursor": null
}
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `No URL provided` | Missing `url=` parameter | Add `url="<youtube-url>"` |
| `Too many arguments` | Extra parameters beyond `url` and `lang` | Use only `url=` and optionally `lang=` |
| `Invalid YouTube URL` | Malformed URL | Check URL format |
| `MCP server is not running` | Docker container not started | Run `docker run --rm -i mcp/youtube-transcript` |
| `Transcript for target language X is missing` | Video lacks that language | Try different `lang=` value (check error output for available languages) |

## File Structure

```
youtube-summarizer/
├── src/
│   ├── index.ts          # Main entry point
│   ├── mcp-client.ts     # MCP server communication
│   └── utils.ts          # URL parsing, file I/O
├── temp/
│   ├── transcripts/      # Saved transcripts
│   └── summary/          # (for future summaries)
├── Makefile              # Command shortcuts
├── package.json
└── tsconfig.json
```

## Workflow with AI

1. **Fetch transcript** (cheap, fast):
   ```bash
   make transcript url="<youtube-url>" lang=zh
   ```

2. **Read saved file** (zero API cost):
   ```
   Read temp/transcripts/{timestamp}-{videoId}.json
   ```

3. **Process with AI** (use transcript content for summarization, analysis, etc.)

**Never** call MCP YouTube tools directly in AI conversations - it forces the AI to write the entire transcript in the response, wasting tokens.

## License

ISC
