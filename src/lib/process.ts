import { writeFileSync } from "fs-extra";
import path, { format } from "path";
import winston from "winston";
import { download } from "./downloading";
import { Console } from "./logger";
import {
  getFrequency,
  normalize,
  populeTime,
  detectHighVisualizations,
} from "./metrics";
import { getPropertiesFrom } from "./scrapping";
import { createDirIfNotExists } from "./utils";
import { chargeVideo, parseVideo } from "./video";

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

      const highVisualizations = await this.generateMetrics(
        videoUrl,
        this.filePath
      );
      if (!highVisualizations.length) {
        this.logger.info(`Vídeo sem métricas de visualizações`);
        return;
      }

      this.logger.info(
        `encontrado ${highVisualizations.length} picos de visualização`
      );

      // clearDirectory(this.outDir);

      this.logger.info("Baixando vídeo " + videoUrl);
      const pathFile = await download(this.logger, this.filePath, videoUrl);

      await this.generateNewVideos(
        pathFile,
        highVisualizations,
        videoUrl,
        this.filePath
      );
    } catch (error: any) {
      this.logger.error(error);
      writeFileSync(path.join(this.filePath, "error.txt"), error.stack);
    } finally {
      return this;
    }
  }

  async generateMetrics(videoUrl: string, filePath: string) {
    const { d, timeDurationInSec } = await getPropertiesFrom(videoUrl, filePath);
    if (!d) throw new Error(`getHeatMapPath is empty`);

    this.logger.info("Gerando métricas do vídeo");
    const delimiter = 12;
    const C = d.slice(delimiter);
    let cParts = getFrequency(C);

    cParts = normalize(cParts);
    cParts = populeTime(cParts, timeDurationInSec);

    const highVisualizations = detectHighVisualizations(
      cParts,
      timeDurationInSec,
      100
    );
    return highVisualizations;
  }

  async generateNewVideos(
    pathFile: string,
    highVisualizations: any[],
    videoUrl: string,
    outDir: string
  ) {
    const video = await chargeVideo(pathFile);
    for (let [index, highVisualization] of highVisualizations.entries()) {
      const from = parseInt(highVisualization[0].sec);
      let to = parseInt(highVisualization[highVisualization.length - 1].sec);
      if (to > from + 60) to = from + 60;
      if (to < from + 10) to = from + 10;
      this.logger.info(`De ${from} seg até ${to} seg`);
      await parseVideo(video, outDir, from, to, index);
      this.logger.info(`${videoUrl} index: ${index} salvo`);
    }
  }
}
