import cheerio from "cheerio";
import { existsSync, readFileSync } from "fs";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

const cssHeatMapPath = ".ytp-heat-map-path";
const cssTimeDuration = ".ytp-time-duration";

export async function getPropertiesFrom(url: string, filePath: string) {
  const htmlDestination = path.join(filePath, "index.html");
  const html = await getHtml(url, htmlDestination);
  return parseHtml(html);
}

async function getHtml(url: string, filePath: string) {
  if (existsSync(filePath)) 
    return readFileSync(filePath).toString();

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

function parseHtml(html: any) {
  const $ = cheerio.load(html);
  let path = $(cssHeatMapPath);
  const d = path.attr("d");
  const timeDurationInSec = interpretTimeDuration($(cssTimeDuration).text());
  return {
    d,
    timeDurationInSec,
  };
}
