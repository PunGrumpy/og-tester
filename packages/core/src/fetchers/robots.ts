import type { RobotsData } from "../schemas/robots";

export const fetchRobotsTxt = async (url: string): Promise<RobotsData> => {
  const { origin } = new URL(url);
  const robotsUrl = `${origin}/robots.txt`;

  const response = await fetch(robotsUrl);

  if (!response.ok) {
    return { error: `Failed to fetch robots.txt: ${response.status}` };
  }

  const content = await response.text();
  return { content };
};
