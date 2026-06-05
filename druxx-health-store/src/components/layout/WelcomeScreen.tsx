"use client";

import dynamic from "next/dynamic";

export const WelcomeScreen = dynamic(
  () => import("./WelcomeScreenContent").then((m) => m.WelcomeScreenContent),
  { ssr: false }
);
