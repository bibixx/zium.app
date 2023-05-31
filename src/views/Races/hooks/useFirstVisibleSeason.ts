import { RefObject, useEffect, useState } from "react";

export const useFirstVisibleSeason = (refsRef: RefObject<Array<HTMLElement | null>>) => {
  const [firstVisibleSeasonIndex, setFirstVisibleSeasonIndex] = useState(0);
  const [seasonIndexOverwrite, setSeasonIndexOverwrite] = useState<number | null>(null);

  useEffect(() => {
    const refs = refsRef.current;

    if (refs == null) {
      return;
    }

    const intersectingElements = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entires) => {
        entires.forEach(({ isIntersecting, target }) => {
          if (isIntersecting) {
            intersectingElements.add(target as HTMLElement);
          } else {
            intersectingElements.delete(target as HTMLElement);
          }
        });

        const elementsWithIndices = Array.from(intersectingElements).map((el) => refs.indexOf(el));

        const newFirstVisibleSeasonIndex = Math.min(...elementsWithIndices);

        setFirstVisibleSeasonIndex(newFirstVisibleSeasonIndex);

        if (seasonIndexOverwrite == null || seasonIndexOverwrite === newFirstVisibleSeasonIndex) {
          setSeasonIndexOverwrite(null);
        }
      },
      { rootMargin: "-1px" },
    );

    refs.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, [refsRef, seasonIndexOverwrite]);

  return [seasonIndexOverwrite ?? firstVisibleSeasonIndex, setSeasonIndexOverwrite] as const;
};
