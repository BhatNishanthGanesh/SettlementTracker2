// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Download, Plus, Trash2, 
  DollarSign, Users, AlertCircle, UserX,
  TrendingUp, PieChart
} from 'react-feather';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Types
import { EditFormData } from '@/app/(dashboard)/types';

// Services
import { ExportService } from '@/app/(dashboard)/services/ExportService';

// Hooks
import { useTripData } from '@/hooks/useTripData';

// Components
import { StatCard } from '@/components/dashboard/StatCard';
import { TripTableRow } from '@/components/dashboard/TripTableRow';
import { TripModal } from '@/components/dashboard/TripModal';
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation';
import { TableSkeleton } from '@/components/dashboard/TableSkeleton';
import { EmptyState } from '@/components/dashboard/EmptyState';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState<EditFormData>({ 
    name: '', 
    expense: '', 
    spent: '', 
    recieved: '', 
    category: '',
    companionInput: '',
    companions: []
  });

  const { 
    data, 
    loading, 
    updateTrip, 
    deleteTrip, 
    filterTrips, 
    getStats, 
    getChartData, 
    getGroupData,
  } = useTripData();

  const stats = getStats();
  const chartData = getChartData();
  const groupData = getGroupData();
  
  const exportService = new ExportService();

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const filteredData = filterTrips({ search: searchQuery, status: filterStatus });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const handleUpdate = () => {
    const { name, expense, spent, recieved, category, companions } = editForm;
    const spentNum = parseFloat(spent) || 0;
    const recievedNum = parseFloat(recieved) || 0;
    const status = spentNum === recievedNum ? 'settled' : spentNum > recievedNum ? 'pending' : 'overdue';
    
    updateTrip(selectedItemId, { 
      name, 
      expense, 
      spent: spentNum, 
      recieved: recievedNum, 
      status, 
      category, 
      companions 
    });
    setShowModal(false);
  };

  const handleDelete = () => {
    deleteTrip(selectedItemId);
    setShowConfirmation(false);
  };


  const addCompanion = () => {
    const name = editForm.companionInput.trim();
    if (name && !editForm.companions.includes(name)) {
      setEditForm({ 
        ...editForm, 
        companions: [...editForm.companions, name],
        companionInput: ''
      });
    }
  };

  const removeCompanion = (name: string) => {
    setEditForm({
      ...editForm,
      companions: editForm.companions.filter(c => c !== name)
    });
  };

  const handleExport = () => {
    exportService.exportToCSV(filteredData);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        endPage = 4;
      }
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      if (startPage > 2) {
        pages.push('ellipsis');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span>Settlement Tracker</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span>Track, settle, and manage group expenses</span>
              <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
              <span className="text-sm">{data.length} active trips</span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <Link href="/post">
              <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25">
                <Plus className="w-5 h-5" /> New Trip
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={DollarSign}
            label="Total Spent"
            value={`₹${stats.totalSpent.toLocaleString('en-IN')}`}
            subtitle={`Avg. ₹${stats.averageSpent.toFixed(0)} per trip`}
            color="bg-indigo-500"
          />
          <StatCard 
            icon={Users}
            label="Total Trips"
            value={stats.totalTrips}
            subtitle={`${stats.settledCount} settled · ${stats.pendingCount} pending`}
            color="bg-blue-500"
          />
          <StatCard 
            icon={AlertCircle}
            label="Pending Balance"
            value={`₹${stats.pendingBalance.toLocaleString('en-IN')}`}
            subtitle={`${stats.pendingCount + stats.overdueCount} unsettled trips`}
            color="bg-amber-500"
          />
          <StatCard 
            icon={UserX}
            label="Yet to Pay"
            value={stats.pendingCount + stats.overdueCount}
            subtitle={`${stats.overdueCount} overdue`}
            color="bg-rose-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Spending vs Received
            </h3>
            <div className="h-64">
              {chartData && (
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'top',
                        labels: { color: '#6b7280', boxWidth: 12, padding: 16 }
                      }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                      },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Trip Categories
            </h3>
            <div className="h-64">
              {groupData && (
                <Doughnut 
                  data={groupData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'bottom',
                        labels: { color: '#6b7280', boxWidth: 10, padding: 8 }
                      }
                    },
                    cutout: '65%'
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search trips, expenses, companions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
           
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="settled">Settled</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trip</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expense</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Received</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Companions</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
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
                    <TripTableRow
                      key={item.id}
                      trip={item}
                    />
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
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                  {stats.settledCount} settled
                </span>
                <span>
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>
                  {stats.pendingCount} pending
                </span>
                <span>
                  <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1"></span>
                  {stats.overdueCount} overdue
                </span>
              </div>

              {/* Right */}
              <div className="flex justify-end">
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      {/* Previous */}
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {/* Pages */}
                      {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index} className='p-1'>
                          {page === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              isActive={currentPage === page}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page as number);
                              }}
                              className={currentPage === page ? "bg-indigo-600 text-white px-3 py-1" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      {/* Next */}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TripModal
        isOpen={showModal}
        formData={editForm}
        onClose={() => setShowModal(false)}
        onSave={handleUpdate}
        onFormChange={(data) => setEditForm({ ...editForm, ...data })}
        onAddCompanion={addCompanion}
        onRemoveCompanion={removeCompanion}
      />

      <DeleteConfirmation
        isOpen={showConfirmation}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmation(false)}
      />
    </main>
  );
}