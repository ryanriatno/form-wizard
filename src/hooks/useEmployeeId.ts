import { useState, useEffect } from "react";
import { getBasicInfo } from "@/services/api";

export function useEmployeeId(department: string): string {
  const [employeeId, setEmployeeId] = useState("");

  useEffect(() => {
    if (!department) {
      setEmployeeId("");
      return;
    }

    const generateEmployeeId = async () => {
      try {
        const existingBasicInfo = await getBasicInfo();
        const deptPrefix = department
          .substring(0, 3)
          .toUpperCase()
          .padEnd(3, "X");
        const existingCount = existingBasicInfo.filter((info) =>
          info.employeeId.startsWith(deptPrefix)
        ).length;
        const sequence = (existingCount + 1).toString().padStart(3, "0");
        setEmployeeId(`${deptPrefix}-${sequence}`);
      } catch (error) {
        console.error("Failed to generate employee ID:", error);
        const deptPrefix = department
          .substring(0, 3)
          .toUpperCase()
          .padEnd(3, "X");
        const timestamp = Date.now().toString().slice(-3);
        setEmployeeId(`${deptPrefix}-${timestamp}`);
      }
    };

    generateEmployeeId();
  }, [department]);

  return employeeId;
}
