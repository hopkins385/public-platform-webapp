const config = useRuntimeConfig().scrapeServer;

// scrape website
export async function scrapeWebsite(url: string) {
  // check if its a valid url
  const isValidUrl = url.match(/https?:\/\/[^\s]+/);
  if (!isValidUrl) {
    throw new Error('Invalid URL');
  }
  // scraping website via scrape server
  // url of scrapeserver is http://localhost:3010/scrape?url=${url}
  const scrapeUrl = `${config.url}/scrape?url=${url}`;
  const response = await fetch(scrapeUrl);
  const data = await response.json();
  return data;
}
