import { PromisePool } from "@supercharge/promise-pool";
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
    const videoIds = [
    "JSRtYpNRoN0",
    "3za0Ao2fQmE",
    "p8PZvGGe13I",
    "y7Ulq5dvTpo",
  ];

  const { results, errors } = await PromisePool.withConcurrency(3)
    .for(videoIds)
    .process(async (videoId) => {
      console.log("New Process_____________")
      return await new Process(videoId).start();
    });
  console.log(results, errors);
}

execute();
