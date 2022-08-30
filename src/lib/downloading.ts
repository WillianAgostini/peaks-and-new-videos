import { spawn } from "child_process";
import { existsSync } from "node:fs";
import path from "path";
import winston from "winston";
import { createDirIfNotExists } from "./utils";

export async function download(logger:winston.Logger, outDir: string, url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    createDirIfNotExists(outDir);
    const fileName = path.resolve(outDir, "video.mp4");
    if (existsSync(fileName)) {
      resolve(fileName);
      return;
    }

    let script = spawn("yt-dlp", [
      url,
      "-f",
      "best",
      "-o",
      fileName
    ]);

    script.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    script.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });

    script.on("error", (error) => {
      console.log(`error: ${error.message}`);
      reject(error);
    });

    script.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      resolve(fileName);
    });
  });
}
