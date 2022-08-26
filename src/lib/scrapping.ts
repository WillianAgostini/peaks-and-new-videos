import puppeteer from "puppeteer";
import cheerio from "cheerio";
import fs from "fs/promises";

const cssHeatMapPath = ".ytp-heat-map-path";
const cssTimeDuration = ".ytp-time-duration";

export async function getPropertiesFrom(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  await page?.waitForSelector(cssHeatMapPath, {
    timeout: 5000,
  });

  let html = await page.content();
  if (process.env.LOG) await fs.writeFile("./body.html", html);
  await browser.close();
  return parseHtml(html);
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
