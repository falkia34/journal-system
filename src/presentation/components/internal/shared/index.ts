'use client';

import dynamic from 'next/dynamic';

export * from './alert-dialog';
export * from './clickable-view-tile';
export * from './empty-row-overlay';
export * from './footer';
export * from './header';
export * from './main';
export * from './section-header';
export * from './sidebar';
export * from './store-provider';
export * from './view-tile';
export * from './submission-status-badge';
export * from './revision-stage-badge';
export * from './feedback-stage-badge';
export * from './feedback-recommendation-badge';
export * from './participant-stage-badge';
export * from './revisions';
export * from './feedbacks';
export * from './decisions';

export const PdfViewer = dynamic(() => import('./pdf-viewer.js').then((mod) => mod.PdfViewer), {
  ssr: false,
});
