'use client';

import { useEffect } from 'react';

export default function MouseGuard() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Optional: Prevent drag start if strict
    // const handleDragStart = (e: DragEvent) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
       document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return null;
}
