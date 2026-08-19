import type { ReactElement } from 'react';
import type { Metadata } from 'next';
import NotFoundView from './_components/NotFoundView';

export const metadata: Metadata = {
  title: 'Page not found · Mood Trip',
};

export default function NotFound(): ReactElement {
  return <NotFoundView />;
}
