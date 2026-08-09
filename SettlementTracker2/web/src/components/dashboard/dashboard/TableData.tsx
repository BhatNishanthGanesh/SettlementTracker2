import { TripTableRow } from "@/components/dashboard/dashboard/TripTableRow";
import { TableSkeleton } from "@/components/dashboard/ui/TableSkeleton";
import { EmptyState } from "@/components/dashboard/ui/EmptyState";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { TripData,DashboardStats } from "@/types/trip.types";


type Props = {
  loading: boolean;
  filteredData: TripData[];
  currentItems: TripData[];
  startIndex: number;
  endIndex: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pages: (number | "ellipsis")[];
  stats: DashboardStats;
};

export function TableData({
  loading,
  filteredData,
  currentItems,
  startIndex,
  endIndex,
  totalPages,
  currentPage,
  setCurrentPage,
  pages,
  stats,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Group
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trip
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Spent
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                I owe
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Received
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Companions
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <TableSkeleton />
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12">
                  <EmptyState onAction={() => {}} />
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <TripTableRow key={item.id} trip={item} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Left */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredData.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(endIndex, filteredData.length)} of {filteredData.length} trips
            <span className="ml-2 text-gray-400 dark:text-gray-500">
              · Page {currentPage} of {totalPages || 1}
            </span>
          </div>

          {/* Center */}
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1" />
              {stats.settledCount} settled
            </span>

            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />
              {stats.pendingCount} pending
            </span>
          </div>

          {/* Right */}
          <div className="flex justify-end">
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {pages.map((page, index) => (
                    <PaginationItem key={index} className="p-1">
                      {page === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          className={
                            currentPage === page
                              ? "bg-indigo-600 text-white px-3 py-1"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}