import { getPropertiesFrom } from "./lib/scrapping";
import { clearDirectory, chargeVideo, parseVideo } from "./lib/video";
import { download } from "./lib/downloading";
import path from "node:path";
import { createDirIfNotExists } from "./lib/utils";
import {
  getFrequency,
  detectHighVisualizations,
  normalize,
  populeTime,
} from "./lib/metrics";
import { PromisePool } from "@supercharge/promise-pool";
import { writeFileSync } from "node:fs";

execute();

async function execute() {
  const videoIds = [
    "xdKeUwRpu18",
    // "bj97P_lYvUQ",
    // "W2cmC4cOFNQ"
    // "-jYi-pBys5U",
    // "IM9q4Wrn-YA",
    // "i-DayBOCWQk"
  ];

  const { results, errors } = await PromisePool.withConcurrency(1)
    .for(videoIds)
    .process(async (videoId) => {
      const outDir = path.join("./outVideos", videoId);
      try {
        return await start(videoId, outDir);
      } catch (error: any) {
        writeFileSync(path.join(outDir, "resumo.txt"), error.message);
        throw error;
      }
    });
  console.log(results, errors);
}

async function start(videoId: string, outDir: string) {
  createDirIfNotExists(outDir);

  console.log("Buscando heatMap " + videoId);
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const highVisualizations = await generateMetrics(videoUrl);
  if (!highVisualizations.length) {
    console.log(`Vídeo ${videoUrl} sem métricas de visualizações`);
    return;
  }

  console.log(`encontrado ${highVisualizations.length} picos de visualização`);

  clearDirectory(outDir);

  console.log("Baixando vídeo " + videoUrl);
  const pathFile = await download(outDir, videoUrl);

  await generateNewVideos(pathFile, highVisualizations, videoUrl, outDir);
}

async function generateMetrics(videoUrl: string) {
  const { d, timeDurationInSec } = await getPropertiesFrom(videoUrl);
  if (!d) throw new Error(`getHeatMapPath is empty`);

  console.log("Gerando métricas do vídeo " + videoUrl);
  const delimiter = 12;
  const C = d.slice(delimiter);
  let cParts = getFrequency(C);

  cParts = normalize(cParts);
  cParts = populeTime(cParts, timeDurationInSec);

  const highVisualizations = detectHighVisualizations(
    cParts,
    timeDurationInSec
  );
  return highVisualizations;
}

async function generateNewVideos(
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
    console.log(`De ${from} seg até ${to} seg ` + videoUrl);
    await parseVideo(video, outDir, from, to, index);
    console.log(`${videoUrl} index: ${index} salvo`);
  }
}
