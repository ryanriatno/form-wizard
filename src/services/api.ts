import type {
  Department,
  Location,
  BasicInfo,
  Details,
} from "@/types/employee";

const API_BASE_STEP1 =
  import.meta.env.VITE_API_BASE_STEP1 || "http://localhost:4001";
const API_BASE_STEP2 =
  import.meta.env.VITE_API_BASE_STEP2 || "http://localhost:4002";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function postJson<T>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Department endpoints
export async function searchDepartments(query: string): Promise<Department[]> {
  const url = `${API_BASE_STEP1}/departments?name_like=${encodeURIComponent(
    query
  )}`;
  return fetchJson<Department[]>(url);
}

// Location endpoints
export async function searchLocations(query: string): Promise<Location[]> {
  const url = `${API_BASE_STEP2}/locations?name_like=${encodeURIComponent(
    query
  )}`;
  return fetchJson<Location[]>(url);
}

// BasicInfo endpoints
export async function getBasicInfo(): Promise<BasicInfo[]> {
  return fetchJson<BasicInfo[]>(`${API_BASE_STEP1}/basicInfo`);
}

export async function postBasicInfo(data: BasicInfo): Promise<BasicInfo> {
  await delay(3000);
  return postJson<BasicInfo>(`${API_BASE_STEP1}/basicInfo`, data);
}

// Details endpoints
export async function getDetails(): Promise<Details[]> {
  return fetchJson<Details[]>(`${API_BASE_STEP2}/details`);
}

export async function postDetails(data: Details): Promise<Details> {
  await delay(3000);
  return postJson<Details>(`${API_BASE_STEP2}/details`, data);
}
