'use client';

import { useSearchParams } from 'next/navigation';
import { ButtonLink } from '@mood-trip/ui';
import { buildListUrl } from '@/lib/list-url';

type ListPaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  pageParamKey?: string;
};

export function ListPagination({
  basePath,
  page,
  totalPages,
  pageParamKey = 'page',
}: ListPaginationProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const hrefForPage = (targetPage: number): string =>
    buildListUrl(basePath, searchParams, {
      [pageParamKey]: String(targetPage),
    });

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-text-muted">
        Page {page} of {totalPages || 1}
      </p>
      <div className="flex gap-2">
        {hasPrev ? (
          <ButtonLink href={hrefForPage(page - 1)} variant="outline" size="sm">
            Previous
          </ButtonLink>
        ) : (
          <span className="inline-flex h-9 items-center px-3 text-sm text-text-muted">
            Previous
          </span>
        )}
        {hasNext ? (
          <ButtonLink href={hrefForPage(page + 1)} variant="outline" size="sm">
            Next
          </ButtonLink>
        ) : (
          <span className="inline-flex h-9 items-center px-3 text-sm text-text-muted">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
