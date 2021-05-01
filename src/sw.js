import { getFiles, setupPrecaching, setupRouting } from "preact-cli/sw/";
import { bibleData } from "./data";
import { precacheAndRoute } from "workbox-precaching";
import { CacheFirst } from "workbox-strategies";
import { registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { RangeRequestsPlugin } from "workbox-range-requests";

// In your service worker:
// It's up to you to either precache or explicitly call cache.add('movie.mp4')
// to populate the cache.
//
// This route will go against the network if there isn't a cache match,
// but it won't populate the cache at runtime.
// If there is a cache match, then it will properly serve partial responses.
registerRoute(
  ({ url }) => url.pathname.endsWith(".mp3"),
  new CacheFirst({
    cacheName: "audio-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new RangeRequestsPlugin(),
    ],
  })
);

const intToString = (i) => {
    return i < 10 ? "0" + i : i;
  };
  
  const toUrl = (book, chapter) => {
    return (
      "/assets/audios/B" +
      intToString(book + 1) +
      "___" +
      intToString(chapter) +
      ".mp3?raw=true"
    );
  };

const books = Object.keys(bibleData);

const urls = getFiles();

for (var book in bibleData) {
  for (var chapter in [...Array(bibleData[book]).keys()]) {
    urls.push({
      url: toUrl(books.indexOf(book), Number(chapter) + 1),
      revision: null,
    });
  }
}

for (var book in bibleData) {
    for (var chapter in [...Array(bibleData[book]).keys()]) {
      caches.open('audio-cache').then(cache => cache.add(toUrl(books.indexOf(book), Number(chapter) + 1)));
    }
  }

precacheAndRoute(urls);

setupRouting();

setupPrecaching(urls);

// const strategy = new CacheFirst();

// self.addEventListener("install", (event) => {
//   // handleAll returns two promises, the second resolves after all items have been added to cache.
//   const done = urls.map((path) => {
//     console.log("Registering url: ", path);
//     cache.add(path);
//     strategy.handle({
//       event,
//       request: new Request(path),
//     });
//   });

//   event.waitUntil(Promise.all(done));
// });
