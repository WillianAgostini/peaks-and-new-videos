import ffmpeg, { Video } from "ffmpeg";
import { rmSync } from "node:fs";
import { createDirIfNotExists } from "./utils";
import path from "node:path";

export function clearDirectory(dir: string, expectFile = null) {
  rmSync(dir, { recursive: true, force: true });
}

export async function parseVideo(
  video: Video,
  outDir: string,
  startInSeconds: number,
  endInSeconds: number,
  index: number
) {
  const destFile = path.join(outDir, `video${index}.mp4`);
  createDirIfNotExists(outDir);

  video.setVideoStartTime(startInSeconds);
  video.setVideoDuration(endInSeconds - startInSeconds);

  await video.save(destFile);
}

export async function chargeVideo(file: string): Promise<Video> {
  return await new ffmpeg(file);
}
