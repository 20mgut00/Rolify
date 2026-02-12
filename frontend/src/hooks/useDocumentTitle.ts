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

/**
 * React 19 compatible meta tag hook
 * Sets a meta tag in the document head
 */
export function useDocumentMeta(name: string, content: string): void {
  useEffect(() => {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    const isNew = !meta;

    if (isNew) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }

    const previousContent = meta.content;
    meta.content = content;

    return () => {
      if (isNew) {
        meta.remove();
      } else {
        meta.content = previousContent;
      }
    };
  }, [name, content]);
}
