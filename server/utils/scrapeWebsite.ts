import type { URL } from 'node:url';

// scrape website
export async function scrapeWebsite(url: URL) {
  const config = useRuntimeConfig().scrapeServer;
  // check if its a valid url
  const isValidUrl = url.protocol === 'https:';
  if (!isValidUrl) {
    throw new Error('Invalid URL');
  }
  // scraping website via scrape server
  // url of scrapeserver is http://localhost:3010/scrape?url=${url}
  const scrapeUrl = `${config.url}/scrape?url=${url.toString()}`;
  const response = await fetch(scrapeUrl);
  if (!response.ok) {
    throw new Error('Failed to scrape');
  }
  const data = await response.json();
  return data;
}
