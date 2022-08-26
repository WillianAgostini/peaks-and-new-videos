import { XY } from "../type/x_y.";


const normalize = (data: XY[]) => {
    return data.map((item) => {
      return { ...item, ...{ y: item.y * -1 + 100 } };
    });
  };

const detectHighVisualizations = (data: XY[], timeDurationInSec: number) => {
  const peaksIndex = detectPeaks(data, 10, 100);
  const peaks = peaksIndex.map((x) => data[x]);
  const diffSize = timeDurationInSec / data.length;
  return groupInWindow(peaks, diffSize);
};

const detectPeaks = (data: XY[], windowWidth: number, threshold: number) => {
    const peaks = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowWidth);
      const end = Math.min(data.length, i + windowWidth);
      let deltaAcc = 0;
      for (let a = start; a < end; a++) {
        deltaAcc += Math.abs(data[a - 1]?.y - data[a]?.y);
      }
      if (deltaAcc > threshold) {
        peaks.push(i);
      }
    }
    return peaks;
  };

const groupInWindow = (data: XY[], diffSize: number) => {
  const groupedArray: any[] = [];
  let currentGroup: any[] = [];
  let lastValue = 0;
  for (const d of data) {
    const diff = d.x - lastValue;
    if (diff < diffSize) {
      currentGroup.push(d);
    }

    if (currentGroup.length && diff > diffSize) {
      groupedArray.push(JSON.parse(JSON.stringify(currentGroup)));
      currentGroup = [];
    }
    lastValue = d.x;
  }

  if (currentGroup.length)
    groupedArray.push(JSON.parse(JSON.stringify(currentGroup)));

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
    secondsToMinSec
};
