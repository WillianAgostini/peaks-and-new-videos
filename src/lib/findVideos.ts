import * as yt from "youtube-search-without-api-key";

export async function findVideosBy(search: string) {
  const videos = await yt.search(search);
  console.log(videos)
  return videos.map((x) => x.id.videoId);

  // return new Promise((resolve, reject) => {
  //   var opts: youtubeSearch.YouTubeSearchOptions = {
  //     maxResults: 10,
  //     key: "",
  //   };

  //   youtubeSearch("minecraft", opts, (err, results) => {
  //     if (err) return reject(err);

  //     resolve(results);
  //   });
  // });
}
