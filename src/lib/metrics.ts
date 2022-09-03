import { exit } from "process";
import { XY } from "../type/x_y.";
import { ZScore, ZScoreOutput } from "./peakSignal";

const normalize = (data: XY[]) => {
  return data.map((item) => {
    return { ...item, ...{ y: item.y * -1 + 100 } };
  });
};

const detectHighVisualizations = (data: XY[]): any => {
  return detectPeaks(data);
};

const detectPeaks = (data: XY[]) => {
  const input = data.map((x) => x.y);
  const score = ZScore.calc(input, 30, 30, 0);
  return groupInWindow(data, score);
};

const groupInWindow = (data: XY[], score: ZScoreOutput) => {
  const groupedArray: any[] = [];
  let currentGroup: any[] = [];
  for (let index = 0; index < score.signals.length; index++) {
    const signal = score.signals[index];
    if (signal == 1) {
      currentGroup.push(data[index]);
    } else {
      if (currentGroup.length > 0) {
        groupedArray.push(JSON.parse(JSON.stringify(currentGroup)));
        currentGroup = [];
      }
    }
  }
  return groupedArray;
};

function getFrequency(C: string) {
  return C.split("C")
    .flatMap((item: string) => {
      item = item.trim();
      return item.split(" ");
    })
    .map((item: string) => {
      return {
        x: parseFloat(item.split(",")[0]),
        y: parseFloat(item.split(",")[1]),
        sec: 0,
        minSec: "",
      };
    })
    .filter((item: XY) => item?.y);
}

function populeTime(cParts: XY[], timeDurationInSec: number) {
  const maxX = Math.max(...cParts.map((item) => item.x));
  return cParts.map((item) => {
    item.sec = Math.ceil((timeDurationInSec * item.x) / maxX);
    item.minSec = secondsToMinSec(item);
    return item;
  });
}

function secondsToMinSec(cPart: XY) {
  const min = Math.ceil(cPart.sec / 60);
  const sec = Math.ceil(cPart.sec % 60);
  return `${min}:${sec}`;
}

export {
  normalize,
  detectHighVisualizations,
  detectPeaks,
  groupInWindow,
  getFrequency,
  populeTime,
  secondsToMinSec,
};
