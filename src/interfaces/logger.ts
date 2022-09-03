import { Logger } from "winston";

export interface Console {
  info(message: string, ...meta: any[]): Logger;
  error(message: any): Logger;
  initWinston(videoId: string): Logger;
}
