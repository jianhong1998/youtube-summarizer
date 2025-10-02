import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { TextContent } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';

export async function checkMCPServer(): Promise<boolean> {
  try {
    const process = spawn('docker', [
      'ps',
      '--filter',
      'ancestor=mcp/youtube-transcript',
      '--format',
      '{{.Status}}',
    ]);

    return new Promise((resolve) => {
      let output = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          resolve(false);
          return;
        }
        resolve(output.trim().startsWith('Up'));
      });

      process.on('error', () => {
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

interface TranscriptResponse {
  title: string;
  transcript: string;
  next_cursor?: string;
}

interface FinalTranscript {
  title: string;
  segments: string[];
}

export async function fetchTranscript(
  videoId: string,
  lang: string = 'en'
): Promise<string> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const transport = new StdioClientTransport({
    command: 'docker',
    args: ['run', '--rm', '-i', 'mcp/youtube-transcript'],
  });

  const client = new Client(
    {
      name: 'youtube-transcript-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);

  try {
    let cursor: string | undefined = undefined;
    let title: string = '';
    const segments: string[] = [];
    let pageCount = 0;
    const MAX_PAGES = 100; // Safety limit

    // Keep fetching until no more cursors
    while (pageCount < MAX_PAGES) {
      const args: { url: string; lang: string; cursor?: string } = {
        url,
        lang,
      };
      if (cursor) {
        args.cursor = cursor;
      }

      const result = await client.callTool({
        name: 'get_transcript',
        arguments: args,
      });

      if (
        !('content' in result) ||
        !Array.isArray(result.content) ||
        result.content.length === 0
      ) {
        throw new Error('No transcript content returned');
      }

      const firstContent = result.content[0];
      if (firstContent.type !== 'text') {
        throw new Error('Invalid content type');
      }

      const responseText = (firstContent as TextContent).text;
      const parsed: TranscriptResponse = JSON.parse(responseText);

      console.debug(`[DEBUG] next_cursor: ${parsed.next_cursor}`);

      // Detect if server returned the same cursor we sent (duplicate response)
      if (cursor && parsed.next_cursor === cursor) {
        console.error(
          'Warning: Server returned same cursor, stopping pagination'
        );
        break;
      }

      // Save title from first response
      if (!title && parsed.title) {
        title = parsed.title;
      }

      // Add segment
      if (parsed.transcript) {
        segments.push(parsed.transcript);
      }

      pageCount++;
      console.error(
        `Fetched page ${pageCount}, segments collected: ${segments.length}`
      );

      // Check for next page
      if (parsed.next_cursor) {
        cursor = parsed.next_cursor;
      } else {
        // No more pages
        break;
      }
    }

    if (pageCount >= MAX_PAGES) {
      console.error('Warning: Reached maximum page limit');
    }

    await client.close();

    const finalResult: FinalTranscript = {
      title,
      segments,
    };

    return JSON.stringify(finalResult, null, 2);
  } catch (error) {
    await client.close();
    throw error;
  }
}
