import { useEffect, useState } from "react";

export function useElapsedTimer(isRunning: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((previousSeconds) => previousSeconds + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      setElapsedSeconds(0);
    };
  }, [isRunning]);

  return elapsedSeconds;
}
