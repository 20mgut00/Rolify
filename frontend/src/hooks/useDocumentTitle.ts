import { useEffect } from 'react';

/**
 * React 19 compatible document title hook
 * Sets the document title and cleans up on unmount
 *
 * In React 19, you can also use <title> directly in components
 * but this hook provides backwards compatibility and cleanup
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
