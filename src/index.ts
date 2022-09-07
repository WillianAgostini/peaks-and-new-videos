import { PromisePool } from "@supercharge/promise-pool";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { findVideosBy } from "./lib/findVideos";
import { Process } from "./lib/process";

async function execute() {

  // try {
    
  //   const videoIds = await findVideosBy("Minecraft")
  //   console.log(videoIds)
  // } catch (error:any) {
  //   const a = error.toJSON();
  //   console.log(error.toJSON())
  // }
  let videoIds = readFileSync('./videoIds').toString().split('\n').filter(x => x);
  // const videoIds = [
  //   "sjmwa6KR52U",
  //   "nSYhwtKoD2o",
  //   "SEpX6kgsPUw",
  //   "-7GHgrZZi5U",
  //   "L_Ir9FzP9QQ"
  // ];

  // videoIds = await findVideosBy('gameplay farcry');

  const analised = alreadyAnalised();
  videoIds = videoIds.filter(x => !analised.includes(x))

  const { results, errors } = await PromisePool.withConcurrency(4)
    .for(videoIds)
    .process(async (videoId) => {
      console.log("New Process_____________")
      return await new Process(videoId).start();
    });
  console.log(results, errors);
  return videoIds;
}

execute().then(x => {
  let videoIds = existsSync('./analisados') ? alreadyAnalised() : [];
  videoIds = videoIds.concat(x);
  writeFileSync('./analisados', videoIds.join('\n').toString())

});

function alreadyAnalised() {
  return readFileSync('./analisados').toString().split('\n').filter(x => x);
}