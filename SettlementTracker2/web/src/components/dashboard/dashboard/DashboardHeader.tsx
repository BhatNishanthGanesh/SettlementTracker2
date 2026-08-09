import Link from 'next/link';
import { Download, Plus } from 'lucide-react';

export const DashboardHeader = ({ data, handleExport }:{data: any[]; handleExport: () => void}) => {
  return (
    <header className="mb-8">
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
            <Link href="/dashboard/create-trip">
              <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25">
                <Plus className="w-5 h-5" /> New Trip
              </button>
            </Link>
          </div>
        </div>
      </header> 
  )}