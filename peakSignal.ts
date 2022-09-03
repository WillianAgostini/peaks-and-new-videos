import { readFileSync } from "fs-extra";
import { getFrequency, normalize, populeTime } from "./src/lib/metrics";
import { ZScore } from "./src/lib/peakSignal";

const d = readFileSync(
  "/home/willian/projects/interpret-youtube/outVideos/eyzvnzWIliA/d.txt",
  "utf-8"
).toString();

const delimiter = 12;
const C = d.slice(delimiter);
let cParts = getFrequency(C);

cParts = normalize(cParts);
cParts = populeTime(cParts, 1183);
const input = cParts.map((x) => x.y);
const score = ZScore.calc(input, 30, 5, 0);

const groupedArray: any[] = [];
let currentGroup: any[] = [];
for (let index = 0; index < score.signals.length; index++) {
  const signal = score.signals[index];
  if (signal == 1) {
    currentGroup.push(cParts[index]);
  } else {
    if (currentGroup.length > 0) {
      groupedArray.push(JSON.parse(JSON.stringify(currentGroup)));
      currentGroup = [];
    }
  }
}

// console.table(score)
console.log(groupedArray);
