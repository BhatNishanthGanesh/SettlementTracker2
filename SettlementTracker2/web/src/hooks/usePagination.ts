import { useMemo } from "react";
import { getPageNumbers } from "@/lib/pagination";

export function usePagination<T>(
  data: T[],
  currentPage: number,
  itemsPerPage: number
) {
  return useMemo(() => {
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      totalPages,
      startIndex,
      endIndex,
      currentItems: data.slice(startIndex, endIndex),
      pages: getPageNumbers(currentPage, totalPages),
    };
  }, [data, currentPage, itemsPerPage]);
}