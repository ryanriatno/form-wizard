const DRAFT_ADMIN_KEY = "draft_admin";
const DRAFT_OPS_KEY = "draft_ops";

export type RoleType = "admin" | "ops";

export interface DraftData {
  step1?: {
    fullName: string;
    email: string;
    department: string;
    role: string;
  };
  step2?: {
    employmentType: string;
    officeLocation: string;
    notes: string;
    photo?: string;
  };
}

export function getDraftKey(role: RoleType): string {
  return role === "admin" ? DRAFT_ADMIN_KEY : DRAFT_OPS_KEY;
}

export function saveDraft(role: RoleType, data: DraftData): void {
  const key = getDraftKey(role);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
}

export function loadDraft(role: RoleType): DraftData | null {
  const key = getDraftKey(role);
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load draft:", error);
    return null;
  }
}

export function clearDraft(role: RoleType): void {
  const key = getDraftKey(role);
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
}
