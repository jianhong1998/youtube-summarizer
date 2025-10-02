import { checkMCPServer, fetchTranscript } from './mcp-client';
import {
  extractVideoId,
  getTranscriptFilePath,
  writeTranscriptFile,
} from './utils';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: No URL provided');
    console.error(
      'Usage: make transcript url=<youtube-url> [lang=<language-code>]'
    );
    process.exit(1);
  }

  let url = args[0];
  let lang = args[1] ?? 'en';

  if (args.length > 2) {
    console.error('Error: Too many arguments');
    console.error(
      'Usage: make transcript url=<youtube-url> [lang=<language-code>]'
    );
    process.exit(1);
  }

  const videoId = extractVideoId(url);

  if (!videoId) {
    console.error('Error: Invalid YouTube URL');
    process.exit(1);
  }

  const serverRunning = await checkMCPServer();
  if (!serverRunning) {
    console.error('Error: MCP server is not running');
    console.error('Start it with: docker run --rm -i mcp/youtube-transcript');
    process.exit(1);
  }

  console.log(`Fetching transcript for video: ${videoId} (language: ${lang})`);

  try {
    const transcript = await fetchTranscript(videoId, lang);
    const filePath = getTranscriptFilePath(videoId);

    writeTranscriptFile(filePath, transcript);

    console.log(`Transcript saved to: ${filePath}`);
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('No transcripts were found')) {
      console.error(
        `Error: Transcript for target language "${lang}" is missing.`
      );
      console.error('Check available languages in the error details above.');
    } else {
      console.error('Error fetching transcript:', errorMessage);
    }

    process.exit(1);
  }
}

main();
