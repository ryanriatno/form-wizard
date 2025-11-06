import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBasicInfo, getDetails } from "../../services/api";
import { Pagination } from "../../components/pagination";
import type { Employee, Role } from "../../types/employee";
import styles from "./index.module.css";

const ITEMS_PER_PAGE = 10;

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const [basicInfoList, detailsList] = await Promise.all([
        getBasicInfo(),
        getDetails(),
      ]);

      const mergedEmployees: Employee[] = basicInfoList.map((basic) => {
        const matchingDetail = detailsList.find(
          (detail) =>
            detail.email === basic.email ||
            detail.employeeId === basic.employeeId
        );

        return {
          ...basic,
          employmentType: matchingDetail?.employmentType,
          officeLocation: matchingDetail?.officeLocation,
          notes: matchingDetail?.notes,
          photo: matchingDetail?.photo,
        };
      });

      detailsList.forEach((detail) => {
        const exists = mergedEmployees.some(
          (emp) =>
            emp.email === detail.email || emp.employeeId === detail.employeeId
        );
        if (!exists) {
          mergedEmployees.push({
            fullName: "—",
            email: detail.email,
            department: "—",
            role: "Ops" as Role,
            employeeId: detail.employeeId,
            employmentType: detail.employmentType,
            officeLocation: detail.officeLocation,
            notes: detail.notes,
            photo: detail.photo,
          });
        }
      });

      setEmployees(mergedEmployees);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch employees"
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(employees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEmployees = employees.slice(startIndex, endIndex);

  const handleAddEmployee = () => {
    navigate("/wizard?role=admin");
  };

  if (loading) {
    return (
      <div className={styles.employees}>
        <div className={styles.loading}>Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.employees}>
        <div className={styles.error}>{error}</div>
        <button onClick={fetchEmployees} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.employees}>
      <div className={styles.header}>
        <h1 className={styles.title}>Employees</h1>
        <button onClick={handleAddEmployee} className={styles.addButton}>
          + Add Employee
        </button>
      </div>

      {employees.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No employees found.</p>
          <button onClick={handleAddEmployee} className={styles.addButton}>
            + Add Employee
          </button>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((employee) => (
                  <tr key={employee.employeeId || employee.email}>
                    <td>
                      {employee.photo ? (
                        <img
                          src={employee.photo}
                          alt={employee.fullName}
                          className={styles.photo}
                        />
                      ) : (
                        <span className={styles.placeholder}>—</span>
                      )}
                    </td>
                    <td>{employee.fullName || "—"}</td>
                    <td>{employee.department || "—"}</td>
                    <td>{employee.role || "—"}</td>
                    <td>{employee.officeLocation || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
