const CACHE_NAME = "janfada-v10";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// نصب سرویس ورکر
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // لود مجدد فایل‌ها برای دور زدن کش سخت‌افزاری مرورگر هنگام توسعه
      const requests = ASSETS.map(url => new Request(url, { cache: "reload" }));
      return cache.addAll(requests).catch((err) => {
        console.log("Cache addAll failed:", err);
      });
    })
  );
});

// فعال‌سازی و حذف کش‌های قدیمی (پاکسازی حافظه ورژن‌های قبلی)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// مدیریت درخواست‌ها و قابلیت اجرای کاملاً آفلاین
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // فقط پروتکل‌های http و https کش شوند
  if (!req.url.startsWith("http")) return;

  // فیلتر کردن افزونه‌های مرورگر و متدهای غیر GET
  if (req.url.startsWith("chrome-extension") || req.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (!res || res.status !== 200 || res.type !== "basic") {
          return res;
        }
        const responseToCache = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        });
        return res;
      })
      .catch(() => {
        // در صورت آفلاین بودن، از کش لود شود
        return caches.match(req);
      })
  );
});
