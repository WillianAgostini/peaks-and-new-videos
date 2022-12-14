import { writeFileSync } from "fs-extra";
import path, { format } from "path";
import winston from "winston";
import { download as downloadFullVideo } from "./downloading";
import { Console } from "../interfaces/logger";
import {
  getFrequency,
  normalize,
  populeTime,
  detectHighVisualizations,
} from "./metrics";
import { getHeatMap, VideoProperties } from "./scrapping";
import { createDirIfNotExists } from "./utils";
import { chargeVideo as loadVideo, parseVideo } from "./video";
import { XY } from "../type/x_y.";

export class Process implements Console {
  private logger!: winston.Logger;
  readonly filePath!: string;

  constructor(readonly videoId: string) {
    this.filePath = path.join("./outVideos", videoId);
    this.initWinston();
  }

  info(message: string, ...meta: any[]): winston.Logger {
    throw new Error("Method not implemented.");
  }
  error(message: any): winston.Logger {
    throw new Error("Method not implemented.");
  }

  private getCustomFormat() {
    return winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.align(),
      winston.format.printf(
        (info) => `${this.videoId} | ${info.timestamp} | ${info.message}`
      )
    );
  }

  initWinston() {
    const myformat = this.getCustomFormat();
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: myformat,
        }),
        new winston.transports.File({
          filename: path.join(this.filePath, "combined.log"),
          level: "info",
          format: myformat,
        }),
        new winston.transports.File({
          filename: path.join(this.filePath, "error.log"),
          level: "error",
          format: myformat,
        }),
      ],
    });
    return this.logger;
  }

  async start() {
    try {
      createDirIfNotExists(this.filePath);

      this.logger.info("Buscando heatMap");
      const videoUrl = `https://www.youtube.com/watch?v=${this.videoId}`;
      let videoProperties = await this.extractHeatMap(videoUrl, this.filePath);

      this.logger.info("Gerando m??tricas do v??deo");
      const cParts = this.createVisualizationsMetrics(videoProperties);

      const highVisualizations = await detectHighVisualizations(cParts);
      console.log(highVisualizations);
      // return;
      if (!highVisualizations.length) {
        this.logger.info(`V??deo sem m??tricas de visualiza????es`);
        return;
      }

      this.logger.info(
        `encontrado ${highVisualizations.length} picos de visualiza????o`
      );

      // clearDirectory(this.outDir);

      this.logger.info("Baixando v??deo " + videoUrl);
      const pathFile = await downloadFullVideo(
        this.logger,
        this.filePath,
        videoUrl
      );

      await this.generateNewVideos(
        pathFile,
        highVisualizations,
        videoUrl,
        this.filePath
      );
    } catch (error: any) {
      this.logger.error(error.message);
      writeFileSync(path.join(this.filePath, "error.txt"), error.stack);
    } finally {
      return this;
    }
  }

  private async extractHeatMap(videoUrl: string, filePathToSave: string) {
    return await getHeatMap(videoUrl, filePathToSave);
  }

  private createVisualizationsMetrics(videoProperties: VideoProperties) {
    const delimiter = 12;
    const C = videoProperties.d.slice(delimiter);
    let cParts = getFrequency(C);

    cParts = normalize(cParts);
    cParts = populeTime(cParts, videoProperties.timeDurationInSec);
    return cParts;
  }

  async generateNewVideos(
    pathFile: string,
    highVisualizations: any[],
    videoUrl: string,
    outDir: string
  ) {
    const video = await loadVideo(pathFile);
    for (let [index, highVisualization] of highVisualizations.entries()) {
      let from = parseInt(highVisualization[0].sec);
      let to = parseInt(highVisualization[highVisualization.length - 1].sec);
      if (to > from + 60) to = from + 60;
      if (to < from + 10) {
        from -= 5;
        to += 5;
      }

      if (to < from + 10) to = from + 10;
      this.logger.info(`De ${from} seg at?? ${to} seg`);
      await parseVideo(video, outDir, from, to, index);
      this.logger.info(`${videoUrl} index: ${index} salvo`);
    }
  }
}
