'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Label } from '@mood-trip/ui';
import { buildListUrl } from '@/lib/list-url';

type ListSearchFormProps = {
  basePath: string;
  inputId: string;
  label: string;
  placeholder?: string;
  searchParamKey?: string;
  minLength?: number;
};

export function ListSearchForm({
  basePath,
  inputId,
  label,
  placeholder = 'At least 2 characters',
  searchParamKey = 'search',
  minLength = 2,
}: ListSearchFormProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get(searchParamKey) ?? '';
  const [value, setValue] = useState(initialSearch);

  const _applySearch = (nextValue: string): void => {
    const trimmed = nextValue.trim();
    const searchUpdate =
      trimmed.length >= minLength ? trimmed : null;

    router.push(
      buildListUrl(basePath, searchParams, {
        [searchParamKey]: searchUpdate,
        page: '1',
      }),
    );
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    _applySearch(value);
  };

  const handleClear = (): void => {
    setValue('');
    _applySearch('');
  };

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex min-w-60 flex-1 flex-col gap-1">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          id={inputId}
          variant="inset"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
        />
      </div>
      <Button type="submit" variant="accent" size="sm">
        Search
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleClear}>
        Clear
      </Button>
    </form>
  );
}
