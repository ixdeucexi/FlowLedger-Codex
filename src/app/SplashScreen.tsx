"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), 1700);
    const hideTimer = window.setTimeout(() => setVisible(false), 2000);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`splashScreen${leaving ? " splashLeaving" : ""}`} aria-hidden="true">
      <div className="splashArtwork">
        <Image
          src="/flowledger-splash.png"
          alt=""
          fill
          priority
          sizes="(max-width: 620px) 100vw, 620px"
        />
      </div>
    </div>
  );
}

