import { getJson } from 'serpapi';

export async function searchWeb(query: string) {
  const { apiKey } = useRuntimeConfig().serp;
  try {
    const response = await getJson({
      engine: 'google',
      api_key: apiKey,
      q: query,
      location: 'Berlin,Berlin,Germany',
    });
    return response;
  } catch (error: any) {
    return { error: 'cannot search the web' };
  }
}
