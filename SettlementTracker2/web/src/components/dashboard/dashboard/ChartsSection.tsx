// @ts-ignore
import { Bar, Doughnut } from "react-chartjs-2";
import { TrendingUp, PieChart } from "lucide-react";
import "@/lib/chart.config";


export const ChartsSection = ({ chartData, groupData }:{chartData: any; groupData: any}) => {
    return (
        <section className="mb-8">
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
        </section>
    );
}