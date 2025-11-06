import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { Step2 } from "../step2";
import * as api from "@/services/api";
import { useFormValidation } from "@/hooks/useFormValidation";

// Mock dependencies
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock("@/services/api", () => ({
  searchLocations: vi.fn(),
  postBasicInfo: vi.fn(),
  postDetails: vi.fn(),
}));

vi.mock("@/hooks/useFormValidation", () => ({
  useFormValidation: vi.fn(),
}));

interface AutocompleteMockProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: unknown) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

vi.mock("@/components/autocomplete", () => ({
  Autocomplete: ({
    value,
    onChange,
    label,
    error,
    required,
  }: AutocompleteMockProps) => (
    <div>
      {label && (
        <label>
          {label}
          {required && <span>*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search location..."
        data-testid="location-input"
      />
      {error && <span className="error">{error}</span>}
    </div>
  ),
}));

interface FileUploadMockProps {
  value?: string;
  onChange: (base64: string) => void;
  label?: string;
}

vi.mock("@/components/fileUpload", () => ({
  FileUpload: ({ value, onChange, label }: FileUploadMockProps) => (
    <div>
      {label && <label>{label}</label>}
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onChange("data:image/png;base64,mock-base64-data");
          }
        }}
        data-testid="file-upload"
      />
      {value && <span>File uploaded</span>}
    </div>
  ),
}));

import { useNavigate, type NavigateFunction } from "react-router-dom";

const mockNavigate = vi.mocked(useNavigate);
const mockPostBasicInfo = vi.mocked(api.postBasicInfo);
const mockPostDetails = vi.mocked(api.postDetails);
const mockUseFormValidation = vi.mocked(useFormValidation);

describe("Step2 - Submit Flow", () => {
  const mockStep1Data = {
    fullName: "John Doe",
    email: "john.doe@example.com",
    department: "Engineering",
    role: "Engineer",
    employeeId: "EMP001",
  };

  const mockOnDataChange = vi.fn();

  const defaultProps = {
    step1Data: mockStep1Data,
    initialData: undefined,
    onDataChange: mockOnDataChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockNavigate.mockReturnValue(vi.fn() as unknown as NavigateFunction);
    mockUseFormValidation.mockReturnValue({
      validateStep1: vi.fn(() => ({})),
      validateStep2: vi.fn(() => ({})),
      validateEmail: vi.fn(() => true),
    });

    // Mock API calls to resolve immediately (without the 3s delay from api.ts)
    mockPostBasicInfo.mockImplementation(async () => {
      return {
        id: 1,
        ...mockStep1Data,
        role: "Engineer" as const,
      };
    });

    mockPostDetails.mockImplementation(async () => {
      return {
        id: 1,
        employeeId: mockStep1Data.employeeId,
        email: mockStep1Data.email,
        employmentType: "Full-time",
        officeLocation: "Jakarta",
        notes: "",
        photo: undefined,
      };
    });
  });

  const renderStep2 = (props = {}) => {
    return render(
      <BrowserRouter>
        <Step2 {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  describe("Successful Sequential POST Flow", () => {
    it("should submit basicInfo first, then details, and update progress states", async () => {
      const user = userEvent.setup({ delay: null });
      const navigateFn = vi.fn();
      mockNavigate.mockReturnValue(navigateFn);

      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPostBasicInfo).toHaveBeenCalledTimes(1);
        expect(mockPostBasicInfo).toHaveBeenCalledWith({
          fullName: mockStep1Data.fullName,
          email: mockStep1Data.email,
          department: mockStep1Data.department,
          role: mockStep1Data.role,
          employeeId: mockStep1Data.employeeId,
        });
      });

      await waitFor(
        () => {
          expect(mockPostDetails).toHaveBeenCalledTimes(1);
        },
        { timeout: 5000 }
      );

      expect(mockPostDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: mockStep1Data.employeeId,
          email: mockStep1Data.email,
        })
      );
    });

    it("should display progress steps in correct order during submission", async () => {
      const user = userEvent.setup({ delay: null });
      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Submitting basicInfo…")).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(screen.getByText("basicInfo saved!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(screen.getByText("Submitting details…")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(
            screen.getByText("All data processed successfully!")
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it("should navigate to /employees after successful submission", async () => {
      const user = userEvent.setup({ delay: null });
      const navigateFn = vi.fn();
      mockNavigate.mockReturnValue(navigateFn);

      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockPostBasicInfo).toHaveBeenCalled();
          expect(mockPostDetails).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(navigateFn).toHaveBeenCalledWith("/employees");
        },
        { timeout: 2000 }
      );
    });

    it("should disable submit button during submission", async () => {
      const user = userEvent.setup({ delay: null });
      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText("Submitting...")).toBeInTheDocument();
    });
  });

  describe("Progress State Updates", () => {
    it("should show in-progress state for basicInfo submission", async () => {
      const user = userEvent.setup({ delay: null });
      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Submitting basicInfo…")).toBeInTheDocument();
        expect(screen.getByText("basicInfo saved!")).toBeInTheDocument();
      });
    });

    it("should show completed state after basicInfo is saved", async () => {
      const user = userEvent.setup({ delay: null });
      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText("Submitting basicInfo…")).toBeInTheDocument();
          expect(screen.getByText("basicInfo saved!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it("should show in-progress state for details submission", async () => {
      const user = userEvent.setup({ delay: null });
      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText("basicInfo saved!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(screen.getByText("Submitting details…")).toBeInTheDocument();
          expect(screen.getByText("details saved!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it("should show all steps as completed after successful submission", async () => {
      const user = userEvent.setup({ delay: null });
      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText("Submitting basicInfo…")).toBeInTheDocument();
          expect(screen.getByText("basicInfo saved!")).toBeInTheDocument();
          expect(screen.getByText("Submitting details…")).toBeInTheDocument();
          expect(screen.getByText("details saved!")).toBeInTheDocument();
          expect(
            screen.getByText("All data processed successfully!")
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle error during basicInfo submission", async () => {
      const user = userEvent.setup({ delay: null });
      const error = new Error("Failed to submit basicInfo");
      mockPostBasicInfo.mockRejectedValueOnce(error);

      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockPostBasicInfo).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(submitButton).not.toBeDisabled();
        },
        { timeout: 5000 }
      );

      expect(mockPostDetails).not.toHaveBeenCalled();
    });

    it("should handle error during details submission", async () => {
      const user = userEvent.setup({ delay: null });
      const navigateFn = vi.fn();
      mockNavigate.mockReturnValue(navigateFn);
      const error = new Error("Failed to submit details");
      mockPostDetails.mockRejectedValueOnce(error);

      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockPostBasicInfo).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(mockPostDetails).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(submitButton).not.toBeDisabled();
        },
        { timeout: 5000 }
      );

      expect(navigateFn).not.toHaveBeenCalled();
    });

    it("should re-enable submit button after error", async () => {
      const user = userEvent.setup({ delay: null });
      mockPostBasicInfo.mockRejectedValueOnce(new Error("API Error"));

      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(submitButton).not.toBeDisabled();
        },
        { timeout: 5000 }
      );
    });
  });

  describe("Form Validation", () => {
    it("should prevent submission when form is invalid", async () => {
      const user = userEvent.setup({ delay: null });
      mockUseFormValidation.mockReturnValue({
        validateStep1: vi.fn(() => ({})),
        validateStep2: vi.fn((data) => {
          if (!data.officeLocation?.trim()) {
            return { officeLocation: "Office location is required" };
          }
          return {};
        }),
        validateEmail: vi.fn(() => true),
      });

      renderStep2();

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.clear(locationInput);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      const form = submitButton.closest("form");
      if (form) {
        const submitEvent = new Event("submit", {
          bubbles: true,
          cancelable: true,
        });
        form.dispatchEvent(submitEvent);
      } else {
        const buttonElement = submitButton as HTMLButtonElement;
        if (!buttonElement.disabled) {
          await user.click(submitButton);
        }
      }

      await waitFor(
        () => {
          const errorElement = screen.queryByText(
            "Office location is required"
          );
          expect(errorElement).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(mockPostBasicInfo).not.toHaveBeenCalled();
      expect(mockPostDetails).not.toHaveBeenCalled();
    });

    it("should disable submit button when form is invalid", () => {
      mockUseFormValidation.mockReturnValue({
        validateStep1: vi.fn(() => ({})),
        validateStep2: vi.fn(() => ({
          employmentType: "Employment type is required",
        })),
        validateEmail: vi.fn(() => true),
      });

      renderStep2();

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Sequential API Call Order", () => {
    it("should call postBasicInfo before postDetails", async () => {
      const user = userEvent.setup({ delay: null });
      const callOrder: string[] = [];

      mockPostBasicInfo.mockImplementation(async () => {
        callOrder.push("basicInfo");
        return {
          id: 1,
          ...mockStep1Data,
          role: "Engineer" as const,
        };
      });

      mockPostDetails.mockImplementation(async () => {
        callOrder.push("details");
        return {
          id: 1,
          employeeId: mockStep1Data.employeeId,
          email: mockStep1Data.email,
          employmentType: "Full-time",
          officeLocation: "Jakarta",
          notes: "",
        };
      });

      renderStep2();

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, "Jakarta");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(callOrder.length).toBe(2);
          expect(callOrder[0]).toBe("basicInfo");
          expect(callOrder[1]).toBe("details");
        },
        { timeout: 5000 }
      );
    });
  });
});
