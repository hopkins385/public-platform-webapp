import type { TranscriptResponse } from 'youtube-transcript';
import { YoutubeTranscript } from 'youtube-transcript';

function mergeTextChunks(chunks: TranscriptResponse[]) {
  // Example of a chunk:
  /*
  { text: 'here is some text',
    duration: 3.879,
    offset: 179,
    lang: 'de' },
    */
  return chunks.map((chunk) => chunk.text).join(' ');
}

// scrape website
export async function scrapeYoutube(urlOrId: string) {
  let videoUrl = '';
  // check if its an instance of URL and if its a valid url
  if (urlOrId.startsWith('http')) {
    const url = new URL(urlOrId);
    if (url.protocol !== 'https:') {
      return { error: 'Invalid URL. URL needs start with https://' };
    }
    videoUrl = url.toString();
  } else {
    // check if its a valid youtube video id
    if (!urlOrId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return { error: 'Invalid youtube video id' };
    }
    videoUrl = `https://www.youtube.com/watch?v=${urlOrId}`;
  }

  try {
    const result = await YoutubeTranscript.fetchTranscript(videoUrl);
    return mergeTextChunks(result);
  } catch (error) {
    return { error: 'cannot scrape youtube transcript. does the video exist?' };
  }
}
