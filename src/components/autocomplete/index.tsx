import { useEffect } from "react";
import { useAutocomplete } from "../../hooks/useAutocomplete";
import styles from "./index.module.css";

interface AutocompleteProps<T> {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  searchFn: (query: string) => Promise<T[]>;
  getDisplayValue: (item: T) => string;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

export function Autocomplete<T>({
  value,
  onChange,
  onSelect,
  searchFn,
  getDisplayValue,
  placeholder,
  label,
  error,
  required,
}: AutocompleteProps<T>) {
  const {
    suggestions,
    loading,
    error: searchError,
    isOpen,
    query,
    handleInputChange,
    handleSelect,
    handleBlur,
    syncValue,
  } = useAutocomplete({
    searchFn,
    getDisplayValue,
  });

  useEffect(() => {
    if (value !== undefined && value !== query) {
      syncValue(value);
    }
  }, [value, query, syncValue]);

  const handleInputChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    handleInputChange(newValue);
    onChange(newValue);
  };

  const handleItemClick = (item: T) => {
    handleSelect(item);
    onSelect(item);
  };

  return (
    <div className={styles.autocomplete}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={value}
          onChange={handleInputChangeWrapper}
          onBlur={handleBlur}
          onFocus={() => {
            // Suggestions will be shown if available
          }}
          placeholder={placeholder}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${label}-error` : undefined}
        />
        {loading && <span className={styles.loader}>Loading...</span>}
      </div>
      {error && (
        <span id={`${label}-error`} className={styles.error}>
          {error}
        </span>
      )}
      {searchError && <span className={styles.error}>{searchError}</span>}
      {isOpen && suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((item, index) => (
            <li
              key={index}
              className={styles.suggestionItem}
              onClick={() => handleItemClick(item)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {getDisplayValue(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
