import type { URL } from 'node:url';

// return type is a json object
type ScrapeWebsiteResult = {
  meta: any | null;
  body: string | null;
  error?: string;
};

// scrape website
export async function scrapeWebsite(url: URL): Promise<ScrapeWebsiteResult> {
  const { url: scrapeServerUrl } = useRuntimeConfig().scrapeServer;
  try {
    // check if its a valid url
    const isValidUrl = url.protocol === 'https:';
    if (!isValidUrl) {
      throw new Error('Invalid URL');
    }
    // scrape the website
    const scrapeUrl = `${scrapeServerUrl}/scrape?url=${url.toString()}`;
    const response = await fetch(scrapeUrl);
    if (!response.ok) {
      throw new Error('Failed to scrape');
    }
    return response.json();
  } catch (error) {
    return {
      meta: null,
      body: null,
      error: 'cannot scrape website. does it exist?',
    };
  }
}
