import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Step1 } from "./step1";
import { Step2, type Step2Data } from "./step2";
import { useDraftAutoSave, useDraftRestore } from "@/hooks/useDraftAutoSave";
import { clearDraft, type RoleType } from "@/services/storage";
import type { Role } from "@/types/employee";
import styles from "./index.module.css";

interface Step1Data {
  fullName: string;
  email: string;
  department: string;
  role: Role;
  employeeId: string;
}

export default function Wizard() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") || "admin";
  const role: RoleType = roleParam === "ops" ? "ops" : "admin";

  const [currentStep, setCurrentStep] = useState<number>(
    role === "admin" ? 1 : 2
  );
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step1Draft, setStep1Draft] = useState<Partial<Step1Data>>({});
  const [step2Draft, setStep2Draft] = useState<Partial<Step2Data>>({});

  const restoredDraft = useDraftRestore(role);

  useEffect(() => {
    if (restoredDraft) {
      if (restoredDraft.step1) {
        setStep1Draft(restoredDraft.step1 as Partial<Step1Data>);
      }
      if (restoredDraft.step2) {
        setStep2Draft(restoredDraft.step2 as Partial<Step2Data>);
      }
    }
  }, [restoredDraft]);

  // Auto-save drafts
  useDraftAutoSave({
    role,
    data: {
      step1: step1Draft,
      step2: step2Draft,
    },
    enabled: true,
  });

  const handleStep1Next = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep1DataChange = (data: Partial<Step1Data>) => {
    setStep1Draft(data);
  };

  const handleStep2DataChange = (data: Partial<Step2Data>) => {
    setStep2Draft(data);
  };

  const handleClearDraft = () => {
    clearDraft(role);
    setStep1Draft({});
    setStep2Draft({});
    if (currentStep === 1) {
      setStep1Data(null);
    }
  };

  // Ensure ops users start at step 2
  useEffect(() => {
    if (role === "ops" && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [role, currentStep]);

  return (
    <div className={styles.wizard}>
      <div className={styles.wizard__header}>
        <h1 className={styles.wizard__title}>Employee Wizard</h1>
        <div className={styles.wizard__meta}>
          <span className={styles["wizard__role-badge"] as string}>
            Role: {role === "admin" ? "Admin" : "Ops"}
          </span>
          <button
            type="button"
            onClick={handleClearDraft}
            className={styles["wizard__clear-draft-button"]}
          >
            Clear Draft
          </button>
        </div>
      </div>

      <div className={styles["wizard__step-indicator"]}>
        {role === "admin" && (
          <>
            <div
              className={`${styles["wizard__step-dot"]} ${
                currentStep >= 1 ? styles["wizard__step-dot--active"] : ""
              }`}
            >
              1
            </div>
            <div className={styles["wizard__step-line"]} />
            <div
              className={`${styles["wizard__step-dot"]} ${
                currentStep >= 2 ? styles["wizard__step-dot--active"] : ""
              }`}
            >
              2
            </div>
          </>
        )}
        {role === "ops" && (
          <div
            className={`${styles["wizard__step-dot"]} ${styles["wizard__step-dot--active"]}`}
          >
            2
          </div>
        )}
      </div>

      <div className={styles["wizard__content"]}>
        {currentStep === 1 && role === "admin" && (
          <Step1
            initialData={step1Draft}
            onNext={handleStep1Next}
            onDataChange={handleStep1DataChange}
          />
        )}
        {currentStep === 2 && (
          <Step2
            step1Data={
              step1Data || {
                fullName: step1Draft.fullName || "",
                email: step1Draft.email || "",
                department: step1Draft.department || "",
                role: (step1Draft.role as Role) || "Ops",
                employeeId: "",
              }
            }
            initialData={step2Draft}
            onDataChange={handleStep2DataChange}
          />
        )}
      </div>
    </div>
  );
}
