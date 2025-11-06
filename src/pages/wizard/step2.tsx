import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete } from "@/components/autocomplete";
import { FileUpload } from "@/components/fileUpload";
import { ProgressBar, type ProgressStep } from "@/components/progressBar";
import { searchLocations, postBasicInfo, postDetails } from "@/services/api";
import {
  useFormValidation,
  type ValidationErrors,
} from "@/hooks/useFormValidation";
import type {
  Location,
  EmploymentType,
  BasicInfo,
  Details,
  Role,
} from "@/types/employee";
import styles from "./index.module.css";

export interface Step2Data {
  employmentType: EmploymentType;
  officeLocation: string;
  notes: string;
  photo?: string;
}

interface Step2Props {
  step1Data: {
    fullName: string;
    email: string;
    department: string;
    role: string;
    employeeId: string;
  };
  initialData?: Partial<Step2Data>;
  onDataChange: (data: Partial<Step2Data>) => void;
}

export function Step2({ step1Data, initialData, onDataChange }: Step2Props) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Step2Data>({
    employmentType: initialData?.employmentType || "Full-time",
    officeLocation: initialData?.officeLocation || "",
    notes: initialData?.notes || "",
    photo: initialData?.photo || "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    { label: "Submitting basicInfo…", status: "pending" },
    { label: "basicInfo saved!", status: "pending" },
    { label: "Submitting details…", status: "pending" },
    { label: "details saved!", status: "pending" },
    { label: "All data processed successfully!", status: "pending" },
  ]);

  const { validateStep2 } = useFormValidation();

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const handleChange = (field: keyof Step2Data, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLocationSelect = (location: Location) => {
    handleChange("officeLocation", location.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateStep2(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Submit basicInfo
      setProgressSteps([
        { label: "Submitting basicInfo…", status: "in-progress" },
        { label: "basicInfo saved!", status: "pending" },
        { label: "Submitting details…", status: "pending" },
        { label: "details saved!", status: "pending" },
        { label: "All data processed successfully!", status: "pending" },
      ]);

      const basicInfoData: BasicInfo = {
        fullName: step1Data.fullName,
        email: step1Data.email,
        department: step1Data.department,
        role: step1Data.role as Role,
        employeeId: step1Data.employeeId,
      };

      await postBasicInfo(basicInfoData);

      setProgressSteps((prev) => {
        const updated = [...prev];
        updated[0] = { ...updated[0], status: "completed" };
        updated[1] = { ...updated[1], status: "completed" };
        updated[2] = { ...updated[2], status: "in-progress" };
        return updated;
      });

      // Step 2: Submit details
      const detailsData: Details = {
        employeeId: step1Data.employeeId,
        email: step1Data.email,
        employmentType: formData.employmentType,
        officeLocation: formData.officeLocation,
        notes: formData.notes,
        photo: formData.photo,
      };

      await postDetails(detailsData);

      setProgressSteps((prev) => {
        const updated = [...prev];
        updated[2] = { ...updated[2], status: "completed" };
        updated[3] = { ...updated[3], status: "completed" };
        updated[4] = { ...updated[4], status: "completed" };
        return updated;
      });

      // Redirect after a brief delay
      setTimeout(() => {
        navigate("/employees");
      }, 1000);
    } catch (error) {
      console.error("Submission error:", error);
      setProgressSteps((prev) => {
        const updated = [...prev];
        const failedIndex = prev.findIndex(
          (step) => step.status === "in-progress"
        );
        if (failedIndex !== -1) {
          updated[failedIndex] = { ...updated[failedIndex], status: "error" };
        }
        return updated;
      });
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.employmentType &&
    formData.officeLocation.trim() &&
    Object.keys(errors).length === 0;

  return (
    <form onSubmit={handleSubmit} className={styles.step}>
      <h2 className={styles.stepTitle}>Step 2: Details & Submit</h2>

      <div className={styles.formGroup}>
        <label htmlFor="employmentType" className={styles.label}>
          Employment Type <span className={styles.required}>*</span>
        </label>
        <select
          id="employmentType"
          value={formData.employmentType}
          onChange={(e) =>
            handleChange("employmentType", e.target.value as EmploymentType)
          }
          className={`${styles.select} ${
            errors.employmentType ? styles.inputError : ""
          }`}
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Intern">Intern</option>
        </select>
        {errors.employmentType && (
          <span className={styles.error}>{errors.employmentType}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <Autocomplete<Location>
          value={formData.officeLocation}
          onChange={(value) => handleChange("officeLocation", value)}
          onSelect={handleLocationSelect}
          searchFn={searchLocations}
          getDisplayValue={(loc) => loc.name}
          placeholder="Search location..."
          label="Office Location"
          error={errors.officeLocation}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes" className={styles.label}>
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={4}
          className={styles.textarea}
          placeholder="Additional notes..."
        />
      </div>

      <div className={styles.formGroup}>
        <FileUpload
          value={formData.photo}
          onChange={(base64) => handleChange("photo", base64)}
          label="Photo"
        />
      </div>

      {isSubmitting && <ProgressBar steps={progressSteps} />}

      <div className={styles.actions}>
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={styles.buttonPrimary}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
