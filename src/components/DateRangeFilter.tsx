import { useState } from 'react';

interface DateRangeFilterProps {
    filterDate: string;
    setFilterDate: (value: string) => void;
    customDateFrom: string;
    setCustomDateFrom: (value: string) => void;
    customDateTo: string;
    setCustomDateTo: (value: string) => void;
}

export function DateRangeFilter({
    filterDate,
    setFilterDate,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo
}: DateRangeFilterProps) {
    const [showCalendar, setShowCalendar] = useState(false);

    const handleQuickSelect = (value: string) => {
        setFilterDate(value);
        if (value !== 'custom') {
            setShowCalendar(false);
            // Clear custom dates when switching to quick select
            setCustomDateFrom('');
            setCustomDateTo('');
        } else {
            setShowCalendar(true);
        }
    };

    const handleApplyCustom = () => {
        if (customDateFrom || customDateTo) {
            setFilterDate('custom');
            setShowCalendar(false);
        }
    };

    const handleClearCustom = () => {
        setCustomDateFrom('');
        setCustomDateTo('');
        setFilterDate('all');
        setShowCalendar(false);
    };

    // Format date for display
    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="relative">
            <label className="block text-xs text-slate-400 mb-1.5">Due Date</label>

            {/* Quick Select Dropdown */}
            <select
                value={filterDate === 'custom' && (customDateFrom || customDateTo) ? 'custom' : filterDate}
                onChange={(e) => handleQuickSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="all">All Dates</option>
                <option value="overdue">⚠️ Overdue</option>
                <option value="today">📅 Today</option>
                <option value="tomorrow">📅 Tomorrow</option>
                <option value="week">📅 This Week</option>
                <option value="no-date">🕐 No Date</option>
                <option value="custom">📆 Custom Range...</option>
            </select>

            {/* Custom Date Range Display */}
            {filterDate === 'custom' && (customDateFrom || customDateTo) && (
                <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                    <span>📆</span>
                    <span>
                        {customDateFrom ? formatDateDisplay(customDateFrom) : 'Any'}
                        {' → '}
                        {customDateTo ? formatDateDisplay(customDateTo) : 'Any'}
                    </span>
                    <button
                        onClick={handleClearCustom}
                        className="text-slate-500 hover:text-slate-300 transition"
                        title="Clear custom range"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Calendar Popup */}
            {showCalendar && (
                <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 z-50 w-full sm:w-auto">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">From Date (optional)</label>
                            <input
                                type="date"
                                value={customDateFrom}
                                onChange={(e) => setCustomDateFrom(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1">To Date (optional)</label>
                            <input
                                type="date"
                                value={customDateTo}
                                onChange={(e) => setCustomDateTo(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="text-xs text-slate-500 italic">
                            Leave empty for open-ended range
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-700">
                            <button
                                onClick={handleApplyCustom}
                                disabled={!customDateFrom && !customDateTo}
                                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm rounded-lg transition"
                            >
                                Apply
                            </button>
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Presets (Optional) */}
            {filterDate !== 'custom' && !showCalendar && (
                <div className="mt-2 flex flex-wrap gap-1">
                    <button
                        onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            setCustomDateFrom(today);
                            setCustomDateTo(today);
                            setFilterDate('custom');
                        }}
                        className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition"
                        title="Filter to specific date"
                    >
                        📅 Pick Date
                    </button>
                </div>
            )}
        </div>
    );
}

// Demo component showing usage
export default function DateRangeFilterDemo() {
    const [filterDate, setFilterDate] = useState('all');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');

    // Example tasks
    const tasks = [
        { id: 1, name: 'Task 1', dueDate: '2024-12-10', completed: false },
        { id: 2, name: 'Task 2', dueDate: '2024-12-15', completed: false },
        { id: 3, name: 'Task 3', dueDate: '2024-12-20', completed: false },
        { id: 4, name: 'Task 4', dueDate: '2024-12-25', completed: false },
    ];

    // Filter logic
    const filteredTasks = tasks.filter(task => {
        if (filterDate === 'all') return true;

        const today = new Date().toISOString().split('T')[0];

        if (filterDate === 'custom') {
            if (customDateFrom && task.dueDate < customDateFrom) return false;
            if (customDateTo && task.dueDate > customDateTo) return false;
            return true;
        }

        if (filterDate === 'today') return task.dueDate === today;
        if (filterDate === 'overdue') return task.dueDate < today && !task.completed;

        return true;
    });

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white mb-6">Date Range Filter Demo</h1>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="max-w-xs">
                        <DateRangeFilter
                            filterDate={filterDate}
                            setFilterDate={setFilterDate}
                            customDateFrom={customDateFrom}
                            setCustomDateFrom={setCustomDateFrom}
                            customDateTo={customDateTo}
                            setCustomDateTo={setCustomDateTo}
                        />
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-300 mb-3">
                            Filtered Tasks ({filteredTasks.length})
                        </h3>
                        <div className="space-y-2">
                            {filteredTasks.map(task => (
                                <div key={task.id} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-200">{task.name}</span>
                                        <span className="text-sm text-slate-400">{task.dueDate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Filter State:</h3>
                        <pre className="text-xs text-slate-500 bg-slate-900 rounded p-3 overflow-x-auto">
                            {JSON.stringify({ filterDate, customDateFrom, customDateTo }, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
