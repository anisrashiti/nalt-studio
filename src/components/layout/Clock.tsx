"use client";

import { useSyncExternalStore } from "react";

const TIME_ZONE = "Europe/Belgrade"; // Kosovo's IANA zone.
const SERVER_TIME = "--:-- UTC+1";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const offsetFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  timeZoneName: "shortOffset",
});

function readTime() {
  const now = new Date();
  const zone = offsetFormat.formatToParts(now).find((part) => part.type === "timeZoneName");
  return `${timeFormat.format(now)} ${zone?.value.replace("GMT", "UTC")}`;
}

// Fires on each new minute rather than on a fixed interval, so the clock never lags.
function subscribeToMinutes(onTick: () => void) {
  let timer: ReturnType<typeof setTimeout>;

  function schedule() {
    timer = setTimeout(() => {
      onTick();
      schedule();
    }, 60_000 - (Date.now() % 60_000));
  }

  schedule();
  return () => clearTimeout(timer);
}

export function Clock() {
  const [time, offset] = useSyncExternalStore(subscribeToMinutes, readTime, () => SERVER_TIME).split(" ");

  // Phones only have room for the time next to the nav pill.
  return (
    <p className="type-label flex items-center gap-2 text-stone">
      <span aria-hidden className="size-1.5 rounded-full bg-signal" />
      <span>
        <span className="hidden md:inline">Prishtina </span>
        {time}
        <span className="hidden md:inline"> {offset}</span>
      </span>
    </p>
  );
}
