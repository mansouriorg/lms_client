'use client';

import { useEffect, useRef, useState } from 'react';
import { WORK_CHANGED, recountDue } from './work-counts';

// A number of the menu (student questions, session requests, projects to
// review, assignments to do). `load` asks the API; it must be the same
// function on every render (declare it outside the component), or null while
// nobody is signed in. The number is loaded when the area opens, again on a
// page change (`pathname`) when the last count is older than 30 seconds, and
// at once when a page announces that the work changed (lib/work-counts.ts).
// null while unknown or when it could not be loaded: the menu then shows no
// number.
export function useWorkCount(load: (() => Promise<number>) | null, pathname: string): number | null {
  const [count, setCount] = useState<number | null>(null);
  const [changes, setChanges] = useState(0);
  // When the number was last asked for, and after which announced change
  const asked = useRef<{ at: number | null; changes: number }>({ at: null, changes: 0 });

  useEffect(() => {
    const changed = () => setChanges((value) => value + 1);
    window.addEventListener(WORK_CHANGED, changed);
    return () => window.removeEventListener(WORK_CHANGED, changed);
  }, []);

  useEffect(() => {
    if (load === null) return;
    const now = Date.now();
    // A page change soon after the last count keeps the number (one request
    // less per click); an announced change always counts again
    if (changes === asked.current.changes && recountDue(asked.current.at, now) === false) return;
    asked.current = { at: now, changes };
    let active = true;
    let answered = false;
    load().then(
      (value) => {
        answered = true;
        if (active) setCount(value);
      },
      () => {
        answered = true;
        if (active) setCount(null);
      },
    );
    return () => {
      active = false;
      // Stopped before the answer (a fast page change, or React running the
      // effect twice in development): the next run asks again
      if (answered === false) asked.current = { at: null, changes };
    };
  }, [load, pathname, changes]);

  return count;
}
