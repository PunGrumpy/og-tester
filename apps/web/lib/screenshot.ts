import type { Output, Theme } from "appwrite";

import { avatars } from "./appwrite";

interface ScreenshotOptions {
  url: string;
  fullpage?: boolean;
  theme?: Theme;
  output?: Output;
  sleep?: number;
}

export const screenshot = ({
  url,
  fullpage = false,
  theme,
  output,
  sleep = 3,
}: ScreenshotOptions) =>
  avatars.getScreenshot({
    fullpage,
    output,
    sleep,
    theme,
    url,
  });
