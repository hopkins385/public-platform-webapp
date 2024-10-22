import consola from 'consola';

const logger = consola.create({}).withTag('getDirections');

interface DirectionsResult {
  url: string | null;
  message: string | null;
  error?: string;
}

export async function getGoogleMapsDirections(
  origin: string,
  destination: string,
  waypoints = [],
): Promise<DirectionsResult> {
  logger.info(
    `getGoogleMapsDirections called with origin: ${origin}, destination: ${destination}, waypoints: ${waypoints}`,
  );

  try {
    // URL encode the origin and destination
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);

    logger.info(`Encoded origin: ${encodedOrigin}`);
    logger.info(`Encoded destination: ${encodedDestination}`);

    // Create a Google Maps URL with the route
    let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}`;

    // Add waypoints if provided
    if (waypoints.length > 0) {
      const encodedWaypoints = waypoints.map((wp) => encodeURIComponent(wp)).join('|');
      mapsUrl += `&waypoints=${encodedWaypoints}`;
      logger.info(`Encoded waypoints: ${encodedWaypoints}`);
    }

    logger.info(`Generated Google Maps URL: ${mapsUrl}`);

    const waypointsStr = waypoints.length > 0 ? ` via ${waypoints.join(', ')}` : '';
    const result = {
      url: mapsUrl,
      message: `Here's a Google Maps link with the route from ${origin} to ${destination}${waypointsStr}: ${mapsUrl}`,
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.info(`Returning result: ${JSON.stringify(result)}`);

    return result;
  } catch (e: any) {
    logger.error(`Error in getGoogleMapsDirections: ${e.message}`);
    return {
      url: null,
      message: null,
      error: `An error occurred: ${e.message}`,
    };
  }
}
