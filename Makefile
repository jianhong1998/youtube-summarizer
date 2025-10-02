.PHONY: help transcript install

help:
	@echo "YouTube Transcript Fetcher - Available Commands"
	@echo ""
	@echo "Usage:"
	@echo "  make install                                        Install dependencies"
	@echo "  make transcript url=\"<youtube-url>\" [lang=<code>]   Fetch video transcript"
	@echo "  make help                                           Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make transcript url=\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\""
	@echo "  make transcript url=\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\" lang=zh"
	@echo "  make transcript url=\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\" lang=ja"
	@echo ""
	@echo "Notes:"
	@echo "  - Default language is 'en' (English)"
	@echo "  - Output saved to: temp/transcripts/{timestamp}-{videoId}.json"
	@echo "  - Requires MCP server: docker run --rm -i mcp/youtube-transcript"

transcript:
	@pnpx ts-node src/index.ts $(url) $(lang)

install:
	@rm -rf node_modules
	@pnpm install