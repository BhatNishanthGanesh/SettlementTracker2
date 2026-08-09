'use client';

import React, { useState, useEffect } from 'react';
import { exportTripsToCSV } from "@/lib/exportData";

import { useDashboardData  } from '@/hooks/useDashboardData';
import { usePagination } from '@/hooks/usePagination';

import { DashboardHeader } from '@/components/dashboard/dashboard/DashboardHeader';
import { StatsSection } from '@/components/dashboard/dashboard/StatsSection';
import { ChartsSection } from '@/components/dashboard/dashboard/ChartsSection';
import { SearchAction } from '@/components/dashboard/dashboard/SearchAction';
import { TableData } from '@/components/dashboard/dashboard/TableData';

import { ITEMS_PER_PAGE } from '@/constants/pagination.constant';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    loading,
    filterTrips,
    stats,
    chartData,
    groupData,
  } = useDashboardData();
  console.log(stats)

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const filteredData = filterTrips({ search: searchQuery, status: filterStatus });
  const {
    totalPages,
    startIndex,
    endIndex,
    currentItems,
    pages,
  } = usePagination(filteredData, currentPage, ITEMS_PER_PAGE);

  const handleExport = () => {
    exportTripsToCSV(filteredData);
  };


  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DashboardHeader data={filteredData} handleExport={handleExport} />

        {/* Stats Grid */}
        <StatsSection stats={stats} />

        {/* Charts Row */}
        <ChartsSection chartData={chartData} groupData={groupData} />

        {/* Search & Actions */}
        <SearchAction
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        {/* Table */}
        <TableData
          loading={loading}
          filteredData={filteredData}
          currentItems={currentItems}
          startIndex={startIndex}
          endIndex={endIndex}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pages={pages}
          stats={stats}
        />
      </div>
    </main>
  );
}