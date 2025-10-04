## YouTube Transcript Workflow

**CRITICAL: Token-Saving Protocol**

When you need YouTube video transcripts:

1. **NEVER call the MCP `youtube_transcript` tool directly** - writing transcripts wastes massive tokens
2. **ALWAYS use the TypeScript script instead:**
   ```bash
   make transcript url=<youtube-url> lang=<language-code>
   ```
   Default language is `en`. Use `lang=zh` for Chinese, `lang=ja` for Japanese, etc.
3. **Then read the saved file** from `temp/transcripts/{timestamp}-{videoId}.json`

**Why This Matters:**

- Direct MCP tool calls force AI to write entire transcripts (expensive, slow)
- The script dumps transcripts to disk instantly (cheap, fast)
- Multi-hour videos: ~100K+ tokens saved per transcript

**Script Behavior:**

- Handles ONE URL at a time (fails if multiple URLs provided)
- Validates YouTube URL format before fetching
- Checks MCP docker container is running (`docker run --rm -i mcp/youtube-transcript --response-limit -1`)
- Saves to `temp/transcripts/{timestamp}-{videoId}.json`
- Overwrites existing files with same name

**Error Messages You'll See:**

- "No URL provided" → add `url=` parameter
- "Too many arguments" → use only `url=` and optionally `lang=`
- "Invalid YouTube URL" → check URL format
- "MCP server is not running" → start docker container
- "Transcript for target language X is missing" → video doesn't have transcript in that language, try different `lang=` value

---
