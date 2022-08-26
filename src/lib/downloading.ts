import fs, { existsSync } from "fs";
import path from "path";
import ytdl from "ytdl-core";
import { createDirIfNotExists } from "./utils";

export function download(outDir: string, url: string): Promise<string> {
  createDirIfNotExists(outDir);
  const fileName = path.resolve(outDir, "video.mp4");

  return new Promise((resolve, reject) => {
    if(existsSync(fileName)){
      resolve(fileName);
      return;
    }

    // let info = await ytdl.getBasicInfo(videoUrl);
    // console.log(info.formats);
    
    ytdl(url)
      .pipe(fs.createWriteStream(fileName))
      .once("finish", () => resolve(fileName))
      .once("error", (err) => reject(err));
  });
}
