import { writeFileSync } from "node:fs";
import data from "./data.json";

type x_y = { x: number; y: number };

const filterHighVisualizations = (data: x_y[], minPercent = 50) => {
  const timeToIgnore = 50;
  return data.filter(
    (item) =>
      item.x > timeToIgnore &&
      item.x < 1000 - timeToIgnore &&
      item.y > minPercent
  );
};

const detectHighVisualizations = (data: x_y[], minPercent = 50) => {
  data = data.sort((a: { y: number }, b: { y: number }) => b.y - a.y);
  return filterHighVisualizations(data);
};

const normalize = (data: x_y[]) => {
  return data.map((item) => {
    return { ...item, ...{ y: item.y * -1 + 100 } };
  });
};

const delimiter = 12;
const d = data.d;
const C = d.slice(delimiter);
const cParts = C.split("C")
  .flatMap((item: string) => {
    item = item.trim();
    return item.split(" ");
  })
  .map((item: string) => {
    return {
      x: parseFloat(item.split(",")[0]),
      y: parseFloat(item.split(",")[1]),
    };
  })
  .filter((item: x_y) => item?.y);

const chartData = normalize(cParts);

// console.log(detectHighVisualizations(chartData));

var csvContent = chartData.map((item) => item.y).join("\n");
writeFileSync("./dd.csv", csvContent.toString());
