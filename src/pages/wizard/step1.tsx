import { useState, useEffect } from "react";
import { Autocomplete } from "@/components/autocomplete";
import { searchDepartments } from "@/services/api";
import { useEmployeeId } from "@/hooks/useEmployeeId";
import {
  useFormValidation,
  type ValidationErrors,
} from "@/hooks/useFormValidation";
import type { Department, Role } from "@/types/employee";
import styles from "./index.module.css";

interface Step1Data {
  fullName: string;
  email: string;
  department: string;
  role: Role;
  employeeId: string;
}

interface Step1Props {
  initialData?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
  onDataChange: (data: Partial<Step1Data>) => void;
}

export function Step1({ initialData, onNext, onDataChange }: Step1Props) {
  const [formData, setFormData] = useState<Step1Data>({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    department: initialData?.department || "",
    role: initialData?.role || "Ops",
    employeeId: initialData?.employeeId || "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const employeeId = useEmployeeId(formData.department);
  const { validateStep1 } = useFormValidation();

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  useEffect(() => {
    if (employeeId) {
      setFormData((prev) => ({ ...prev, employeeId }));
    }
  }, [employeeId]);

  const handleChange = (field: keyof Step1Data, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDepartmentSelect = (dept: Department) => {
    handleChange("department", dept.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateStep1(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onNext({ ...formData, employeeId });
  };

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.department.trim() &&
    formData.role &&
    Object.keys(errors).length === 0;

  return (
    <form onSubmit={handleSubmit} className={styles.step}>
      <h2 className={styles.stepTitle}>Step 1: Basic Information</h2>

      <div className={styles.formGroup}>
        <label htmlFor="fullName" className={styles.label}>
          Full Name <span className={styles.required}>*</span>
        </label>
        <input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          className={`${styles.input} ${
            errors.fullName ? styles.inputError : ""
          }`}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
        />
        {errors.fullName && (
          <span id="fullName-error" className={styles.error}>
            {errors.fullName}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email <span className={styles.required}>*</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <span id="email-error" className={styles.error}>
            {errors.email}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <Autocomplete<Department>
          value={formData.department}
          onChange={(value) => handleChange("department", value)}
          onSelect={handleDepartmentSelect}
          searchFn={searchDepartments}
          getDisplayValue={(dept) => dept.name}
          placeholder="Search department..."
          label="Department"
          error={errors.department}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="role" className={styles.label}>
          Role <span className={styles.required}>*</span>
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => handleChange("role", e.target.value as Role)}
          className={`${styles.select} ${errors.role ? styles.inputError : ""}`}
        >
          <option value="Ops">Ops</option>
          <option value="Admin">Admin</option>
          <option value="Engineer">Engineer</option>
          <option value="Finance">Finance</option>
        </select>
        {errors.role && <span className={styles.error}>{errors.role}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="employeeId" className={styles.label}>
          Employee ID
        </label>
        <input
          id="employeeId"
          type="text"
          value={employeeId}
          readOnly
          className={styles.inputReadonly}
          aria-label="Auto-generated Employee ID"
        />
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          disabled={!isFormValid}
          className={styles.buttonPrimary}
        >
          Next
        </button>
      </div>
    </form>
  );
}
