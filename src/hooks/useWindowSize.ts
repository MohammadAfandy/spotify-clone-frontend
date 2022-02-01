import { useState, useEffect } from 'react';

// Define general type for useWindowSize hook, which includes width and height
interface Size {
  width: number | undefined;
  height: number | undefined;
}

const debounce = (
  fn: (...args: any) => any,
  ms: number
) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args);
    }, ms)
  };
}

const useWindowSize = (): Size => {

  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    const debounceHandleResize = debounce(() => {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 500);

    // Add event listener
    window.addEventListener('resize', debounceHandleResize);

    // Call handler right away so state gets updated with initial window size

    debounceHandleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', debounceHandleResize);

  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
};

export default useWindowSize;
