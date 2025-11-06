import { useEffect, useRef, useState } from "react";
import { debounce } from "../utils/debounce";
import { saveDraft, loadDraft, type DraftData, type RoleType } from "../services/storage";

interface UseDraftAutoSaveOptions {
  role: RoleType;
  data: DraftData;
  enabled?: boolean;
  debounceMs?: number;
}

export function useDraftAutoSave({
  role,
  data,
  enabled = true,
  debounceMs = 2000,
}: UseDraftAutoSaveOptions) {
  const debouncedSave = useRef(
    debounce((draftData: DraftData) => {
      if (enabled) {
        saveDraft(role, draftData);
      }
    }, debounceMs)
  );

  useEffect(() => {
    debouncedSave.current(data);
  }, [data, enabled]);
}

export function useDraftRestore(role: RoleType): DraftData | null {
  const [draft, setDraft] = useState<DraftData | null>(null);

  useEffect(() => {
    const savedDraft = loadDraft(role);
    setDraft(savedDraft);
  }, [role]);

  return draft;
}

