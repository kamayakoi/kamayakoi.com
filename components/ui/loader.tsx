"use client";

import { useEffect, useState } from "react";

// Move loading sequence outside component to avoid dependency issues
const loadingSequence = [0, 18, 12, 35, 28, 58, 52, 78, 71, 95, 88, 100];

export default function LoadingComponent() {
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    let stepIndex = 0;

    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingSequence.length;
      setFillWidth(loadingSequence[stepIndex]);
    }, 800); // Much slower timing

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative">
        {/* Background text (darker) */}
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-black text-muted-foreground"
          style={{
            fontWeight: 900,
            letterSpacing: "0.0em",
            fontFamily: "Arial Black, sans-serif",
          }}
        >
          LOADING
        </h1>

        {/* Filled text (bright magenta) */}
        <div
          className="absolute top-0 left-0 overflow-hidden transition-all duration-500 ease-in-out"
          style={{ width: `${fillWidth}%` }}
        >
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-black whitespace-nowrap"
            style={{
              fontWeight: 900,
              letterSpacing: "0.0em",
              fontFamily: "Arial Black, sans-serif",
              color: "#FF073A",
            }}
          >
            LOADING
          </h1>
        </div>
      </div>
    </div>
  );
}
