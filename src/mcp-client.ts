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

export async function fetchTranscript(videoId: string, lang: string = 'en'): Promise<string> {
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
    const result = await client.callTool({
      name: 'get_transcript',
      arguments: { url, lang },
    });

    await client.close();

    if ('content' in result && Array.isArray(result.content) && result.content.length > 0) {
      const firstContent = result.content[0];
      if (firstContent.type === 'text') {
        return (firstContent as TextContent).text;
      }
    }

    throw new Error('No transcript content returned');
  } catch (error) {
    await client.close();
    throw error;
  }
}
