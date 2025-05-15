import { useEffect, useRef } from "react";

export function useDidUpdateEffect(callback, dependencies) {
  const isFirstRun = useRef(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
      } else {
        callback();
      }
    }, 0);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
