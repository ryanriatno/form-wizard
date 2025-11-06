import styles from "./index.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      {onPageSizeChange && pageSize && (
        <div className={styles.pageSizeSelector}>
          <label htmlFor="pageSize" className={styles.pageSizeLabel}>
            Items per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={styles.pageSizeSelect}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className={styles.pageControls}>
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={styles.pageButton}
          aria-label="Previous page"
        >
          Previous
        </button>
        <div className={styles.pageNumbers}>
          {getPageNumbers().map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                onClick={() => handlePageClick(page as number)}
                className={`${styles.pageNumber} ${
                  currentPage === page ? styles.active : ""
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={styles.pageButton}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}

