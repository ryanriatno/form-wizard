import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Autocomplete } from "../index";

vi.mock("../../../hooks/useAutocomplete", () => ({
  useAutocomplete: vi.fn(),
}));

import { useAutocomplete } from "../../../hooks/useAutocomplete";

const mockUseAutocomplete = vi.mocked(useAutocomplete);

const mockSearchFn = vi.fn();
const mockGetDisplayValue = (item: { id: number; name: string }) => item.name;

describe("Autocomplete", () => {
  const mockHandleSelect = vi.fn();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockUseAutocomplete.mockClear();
  });

  it("renders and fetches suggestions correctly", async () => {
    const mockSuggestions = [
      { id: 1, name: "Engineering" },
      { id: 2, name: "Operations" },
    ];

    const mockReturnValue = {
      query: "",
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      isOpen: true,
      selectedItem: null,
      handleInputChange: vi.fn(),
      handleSelect: vi.fn(),
      handleBlur: vi.fn(),
      syncValue: vi.fn(),
      clear: vi.fn(),
    };

    mockUseAutocomplete.mockReturnValue(mockReturnValue);

    render(
      <Autocomplete
        value=""
        onChange={mockOnChange}
        onSelect={mockHandleSelect}
        searchFn={mockSearchFn}
        getDisplayValue={mockGetDisplayValue}
        placeholder="Search..."
      />
    );

    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Engineering")).toBeInTheDocument();
      expect(screen.getByText("Operations")).toBeInTheDocument();
    });
  });

  it("handles user input correctly", async () => {
    const user = userEvent.setup();
    const mockHandleInputChange = vi.fn();

    mockUseAutocomplete.mockImplementation(() => ({
      query: "Eng",
      suggestions: [{ id: 1, name: "Engineering" }],
      loading: false,
      error: null,
      isOpen: true,
      selectedItem: null,
      handleInputChange: mockHandleInputChange,
      handleSelect: vi.fn(),
      handleBlur: vi.fn(),
      syncValue: vi.fn(),
      clear: vi.fn(),
    }));

    render(
      <Autocomplete
        value="Eng"
        onChange={mockOnChange}
        onSelect={mockHandleSelect}
        searchFn={mockSearchFn}
        getDisplayValue={mockGetDisplayValue}
        placeholder="Search..."
      />
    );

    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "i");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("displays loading state", () => {
    mockUseAutocomplete.mockImplementation(() => ({
      query: "Eng",
      suggestions: [],
      loading: true,
      error: null,
      isOpen: false,
      selectedItem: null,
      handleInputChange: vi.fn(),
      handleSelect: vi.fn(),
      handleBlur: vi.fn(),
      syncValue: vi.fn(),
      clear: vi.fn(),
    }));

    render(
      <Autocomplete
        value="Eng"
        onChange={mockOnChange}
        onSelect={mockHandleSelect}
        searchFn={mockSearchFn}
        getDisplayValue={mockGetDisplayValue}
      />
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays error message", () => {
    mockUseAutocomplete.mockImplementation(() => ({
      query: "Eng",
      suggestions: [],
      loading: false,
      error: "Failed to fetch",
      isOpen: false,
      selectedItem: null,
      handleInputChange: vi.fn(),
      handleSelect: vi.fn(),
      handleBlur: vi.fn(),
      syncValue: vi.fn(),
      clear: vi.fn(),
    }));

    render(
      <Autocomplete
        value="Eng"
        onChange={mockOnChange}
        onSelect={mockHandleSelect}
        searchFn={mockSearchFn}
        getDisplayValue={mockGetDisplayValue}
      />
    );

    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
  });

  it("handles item selection", async () => {
    const user = userEvent.setup();
    const mockHandleSelect = vi.fn();
    const mockOnSelect = vi.fn();

    mockUseAutocomplete.mockImplementation(() => ({
      query: "Eng",
      suggestions: [{ id: 1, name: "Engineering" }],
      loading: false,
      error: null,
      isOpen: true,
      selectedItem: null,
      handleInputChange: vi.fn(),
      handleSelect: mockHandleSelect,
      handleBlur: vi.fn(),
      syncValue: vi.fn(),
      clear: vi.fn(),
    }));

    render(
      <Autocomplete
        value="Eng"
        onChange={mockOnChange}
        onSelect={mockOnSelect}
        searchFn={mockSearchFn}
        getDisplayValue={mockGetDisplayValue}
      />
    );

    const suggestion = screen.getByText("Engineering");
    await user.click(suggestion);

    expect(mockOnSelect).toHaveBeenCalled();
  });
});
