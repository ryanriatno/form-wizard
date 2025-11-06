import styles from "./index.module.css";

export type ProgressStep = {
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
};

interface ProgressBarProps {
  steps: ProgressStep[];
}

export function ProgressBar({ steps }: ProgressBarProps) {
  return (
    <div className={styles.progressBar}>
      {steps.map((step, index) => (
        <div key={index} className={styles.step}>
          <div
            className={`${styles.stepIndicator} ${styles[step.status]}`}
            aria-label={step.status}
          >
            {step.status === "completed" && "✓"}
            {step.status === "in-progress" && "⏳"}
            {step.status === "error" && "✗"}
            {step.status === "pending" && ""}
          </div>
          <span className={styles.stepLabel}>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
