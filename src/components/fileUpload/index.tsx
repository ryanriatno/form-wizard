import { useState, useRef } from "react";
import { fileToBase64 } from "../../utils/base64";
import styles from "./index.module.css";

interface FileUploadProps {
  value?: string; // Base64 string
  onChange: (base64: string) => void;
  label?: string;
  accept?: string;
}

export function FileUpload({
  value,
  onChange,
  label = "Photo",
  accept = "image/*",
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);

    try {
      const base64 = await fileToBase64(file);
      setPreview(base64);
      onChange(base64);
    } catch (err) {
      setError("Failed to process image");
      console.error(err);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.fileUpload}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.uploadArea}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={styles.fileInput}
          aria-label={label}
        />
        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Preview" className={styles.preview} />
            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleClick}
                className={styles.replaceButton}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className={styles.removeButton}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder} onClick={handleClick}>
            <span className={styles.placeholderText}>
              Click to upload photo
            </span>
          </div>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

