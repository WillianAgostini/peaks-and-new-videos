import { PromisePool } from "@supercharge/promise-pool";
import { Process } from "./lib/process";

async function execute() {
  const videoIds = [
    "nnd69jXrIOI",
    "aEb2_Reny7I",
    "eyzvnzWIliA",
    "lOms6ZZ8fZc"
  ];

  const { results, errors } = await PromisePool.withConcurrency(3)
    .for(videoIds)
    .process(async (videoId) => {
      return await new Process(videoId).start();
    });
  console.log(results, errors);
}

execute();
