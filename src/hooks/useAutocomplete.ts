import { useState, useEffect, useCallback, useMemo } from "react";
import { debounce } from "@/utils/debounce";

interface UseAutocompleteOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  getDisplayValue: (item: T) => string;
  debounceMs?: number;
}

export function useAutocomplete<T>({
  searchFn,
  getDisplayValue,
  debounceMs = 300,
}: UseAutocompleteOptions<T>) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
          setSuggestions([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const results = await searchFn(searchQuery);
          setSuggestions(results);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch suggestions"
          );
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs),
    [searchFn, debounceMs]
  );

  const performSearch = useCallback(
    (searchQuery: string) => {
      debouncedSearch(searchQuery);
    },
    [debouncedSearch]
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedItem(null);
    setIsOpen(true);
  };

  const handleSelect = (item: T) => {
    setSelectedItem(item);
    setQuery(getDisplayValue(item));
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  const syncValue = (value: string) => {
    setQuery(value);
    if (selectedItem && getDisplayValue(selectedItem) === value) {
      return;
    }
    setSelectedItem(null);
  };

  const clear = () => {
    setQuery("");
    setSelectedItem(null);
    setSuggestions([]);
    setIsOpen(false);
  };

  return {
    query,
    suggestions,
    loading,
    error,
    selectedItem,
    isOpen,
    handleInputChange,
    handleSelect,
    handleBlur,
    syncValue,
    clear,
  };
}
