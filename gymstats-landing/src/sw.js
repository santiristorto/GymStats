import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  let payload;
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "GymStats", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "GymStats";
  const options = {
    body: payload.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: { url: payload.url || "./" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "./";
  event.waitUntil(self.clients.openWindow(url));
});

self.skipWaiting();
self.addEventListener("activate", () => self.clients.claim());
