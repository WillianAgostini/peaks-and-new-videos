import cheerio from "cheerio";
import { existsSync, readFileSync, writeFileSync } from "fs";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

const cssHeatMapPath = ".ytp-heat-map-path";
const cssTimeDuration = ".ytp-time-duration";

export interface VideoProperties {
  d: string;
  timeDurationInSec: number;
}

export async function getHeatMap(
  url: string,
  fileToSavePath: string
): Promise<VideoProperties> {
  const fileToSaveProperties = path.join(fileToSavePath, "d.txt");

  if (existsSync(fileToSaveProperties))
    return JSON.parse(
      readFileSync(fileToSaveProperties).toString()
    ) as VideoProperties;

  const htmlDestination = path.join(fileToSavePath, "index.html");
  const html = await getHtml(url, htmlDestination);
  const videoProperties = getHeatMapFromHtml(html);

  writeFileSync(fileToSaveProperties, JSON.stringify(videoProperties));
  return videoProperties;
}

async function getHtml(url: string, filePath: string) {
  if (existsSync(filePath)) return readFileSync(filePath).toString();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url);

    await page?.waitForSelector(cssHeatMapPath, {
      timeout: 10000,
    });

    const html = await page.content();
    await fs.writeFile(filePath, html);
    return html;
  } catch (error) {
    console.error(error);
  } finally {
    await page.close({ runBeforeUnload: true });
    await browser.close();
  }
}

async function getHtm2(url: string, filePath: string) {
  if (existsSync(filePath)) return readFileSync(filePath).toString();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  await page?.waitForSelector(cssHeatMapPath, {
    timeout: 5000,
  });

  const html = await page.content();
  await fs.writeFile(filePath, html);
  await browser.close();
  return html;
}

function interpretTimeDuration(timeDuration: string | undefined) {
  if (!timeDuration) throw new Error("timeDuration is null");

  const times = timeDuration.split(":");
  const { hour, min, sec } = timeFromArray(times);
  return sec + min * 60 + hour * 60 * 60;
}

function timeFromArray(times: string[]) {
  if (times.length == 2) {
    return {
      hour: 0,
      min: parseInt(times[0]),
      sec: parseInt(times[1]),
    };
  }

  return {
    hour: parseInt(times[0]),
    min: parseInt(times[1]),
    sec: parseInt(times[2]),
  };
}

function getHeatMapFromHtml(html: any) {
  const $ = cheerio.load(html);
  let path = $(cssHeatMapPath);
  const timeDurationInSec = interpretTimeDuration($(cssTimeDuration).text());
  const d = path.attr("d");
  if (!d) throw new Error("Não existe HeatMap para esse vídeo");

  return {
    d,
    timeDurationInSec,
  };
}
