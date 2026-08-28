'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Field, Input, Label } from '@mood-trip/ui';
import type {
  DestinationPlace,
  DestinationSuggestion,
} from '@mood-trip/validators';
import { searchDestinationSuggestions } from '@/api/geocoding/api';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

// Match tokonoma-ui Select dropdown styles (components/select).
const selectContentClassName = [
  'relative z-50 overflow-hidden rounded-md border border-border bg-surface-elevated text-text-primary shadow-[var(--shadow-card-raised)]',
  'max-h-60',
].join(' ');

const selectItemClassName = [
  'relative flex w-full cursor-default select-none flex-col items-start gap-0.5 rounded-sm py-2 px-3 text-left text-sm outline-none',
  'data-highlighted:bg-surface data-highlighted:text-text-primary',
].join(' ');

const selectStatusClassName = 'px-3 py-2 text-sm text-text-muted';

type DestinationAutocompleteProps = {
  value: DestinationPlace | null;
  onValueChange: (value: DestinationPlace | null) => void;
  error?: string;
};

function toDestinationPlace(
  suggestion: DestinationSuggestion,
): DestinationPlace {
  return {
    label: suggestion.label,
    lat: suggestion.lat,
    lng: suggestion.lng,
    countryCode: suggestion.countryCode,
  };
}

const DestinationAutocomplete = ({
  value,
  onValueChange,
  error,
}: DestinationAutocompleteProps) => {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState(value?.label ?? '');
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const hasSelectableSuggestions =
    !isLoading && !searchError && suggestions.length > 0;

  useEffect(() => {
    if (!hasSelectableSuggestions || activeIndex < 0) {
      return;
    }

    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, hasSelectableSuggestions]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const clearScheduledSearch = (): void => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  const resetPanel = (): void => {
    setSuggestions([]);
    setIsLoading(false);
    setSearchError(false);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const scheduleSearch = (trimmedQuery: string): void => {
    clearScheduledSearch();
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (
      trimmedQuery.length < MIN_QUERY_LENGTH ||
      value?.label === trimmedQuery
    ) {
      resetPanel();
      return;
    }

    setIsLoading(true);
    setSearchError(false);
    setIsOpen(true);
    debounceRef.current = window.setTimeout(() => {
      void searchDestinationSuggestions(trimmedQuery)
        .then((results) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setSuggestions(results);
          setActiveIndex(results.length > 0 ? 0 : -1);
          setIsOpen(true);
          setSearchError(results.length === 0);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setSuggestions([]);
          setSearchError(true);
          setIsOpen(true);
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        });
    }, DEBOUNCE_MS);
  };

  const handleInputChange = (nextQuery: string): void => {
    setQuery(nextQuery);
    setActiveIndex(-1);
    if (value && nextQuery.trim() !== value.label) {
      onValueChange(null);
    }
    scheduleSearch(nextQuery.trim());
  };

  const handleSelect = (suggestion: DestinationSuggestion): void => {
    clearScheduledSearch();
    requestIdRef.current += 1;
    const place = toDestinationPlace(suggestion);
    onValueChange(place);
    setQuery(place.label);
    resetPanel();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    if (!hasSelectableSuggestions) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current < 0 ? 0 : (current + 1) % suggestions.length,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current < 0
          ? suggestions.length - 1
          : (current - 1 + suggestions.length) % suggestions.length,
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const showPanel =
    isOpen && (isLoading || searchError || suggestions.length > 0);

  const activeOptionId =
    hasSelectableSuggestions && activeIndex >= 0
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  const helperText =
    error ??
    'Pick a destination from the suggestions so the map lands in the right place.';

  return (
    <Field>
      <Label htmlFor="destination" required>
        Destination
      </Label>
      <div ref={rootRef} className="relative" onKeyDownCapture={handleKeyDown}>
        <Input
          id="destination"
          variant="inset"
          value={query}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event.target.value)
          }
          onFocus={() => {
            if (isLoading || searchError || suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Kyoto, Lisbon, Big Sur..."
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          autoComplete="off"
          required
        />

        {showPanel ? (
          <ul
            id={listboxId}
            role="listbox"
            className={`${selectContentClassName} absolute mt-1 w-full overflow-y-auto p-1`}
          >
            {isLoading ? (
              <li className={selectStatusClassName} aria-live="polite">
                Searching destinations...
              </li>
            ) : null}

            {!isLoading && searchError ? (
              <li className={`${selectStatusClassName} text-error`}>
                Could not load suggestions. Try again.
              </li>
            ) : null}

            {!isLoading && !searchError && suggestions.length === 0 ? (
              <li className={selectStatusClassName}>No destinations found.</li>
            ) : null}

            {!isLoading
              ? suggestions.map((suggestion, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <li
                      key={`${suggestion.label}-${suggestion.lat}-${suggestion.lng}`}
                      id={`${listboxId}-option-${index}`}
                    >
                      <button
                        ref={(element) => {
                          optionRefs.current[index] = element;
                        }}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        data-highlighted={isActive ? '' : undefined}
                        className={selectItemClassName}
                        onMouseEnter={() => {
                          setActiveIndex(index);
                        }}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleSelect(suggestion);
                        }}
                      >
                        <span className="font-medium">
                          {suggestion.primary}
                        </span>
                        {suggestion.context ? (
                          <span className="text-xs text-text-muted">
                            {suggestion.context}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })
              : null}
          </ul>
        ) : null}
      </div>
      <p className={`min-h-4 text-xs ${error ? 'text-red-500' : 'opacity-60'}`}>
        {helperText}
      </p>
    </Field>
  );
};

export default DestinationAutocomplete;
