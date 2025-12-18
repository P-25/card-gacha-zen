import { useState, useEffect } from "react";

export const useAssetLoader = (assets: string[]) => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (assets.length === 0) {
      setIsLoading(false);
      setProgress(100);
      return;
    }

    let loadedCount = 0;
    const total = assets.length;

    const handleLoad = () => {
      loadedCount++;
      setProgress(Math.round((loadedCount / total) * 100));
      if (loadedCount === total) {
        setIsLoading(false);
      }
    };

    assets.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = handleLoad;
      img.onerror = handleLoad; // Proceed even if one fails
    });
  }, [assets]);

  return { isLoading, progress };
};
