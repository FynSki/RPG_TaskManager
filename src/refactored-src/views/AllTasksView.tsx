/**
 * AllTasksView — widok wszystkich zadań z wyszukiwarką i filtrami
 * Wyciągnięty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { RarityBadge } from "../components/RarityBadge";
import { DateRangeFilter } from "../../components/DateRangeFilter";

export function AllTasksView() {
    const {
        sortedTasks, projects, taskClasses, skills,
        searchQuery, setSearchQuery,
        filterDate, setFilterDate,
        customDateFrom, setCustomDateFrom,
        customDateTo, setCustomDateTo,
        filterPriority, setFilterPriority,
        filterProject, setFilterProject,
        showCompletedQuests, setShowCompletedQuests,
        toggleTask, openEditModal, requestDeleteTask,
        openCompletedTaskView, openTaskModal,
    } = useAppContext();

    const filteredTasks = sortedTasks.filter(task => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
            const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
            const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

            const matches =
                task.name.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                project?.name.toLowerCase().includes(query) ||
                taskClass?.name.toLowerCase().includes(query) ||
                skill?.name.toLowerCase().includes(query);

            if (!matches) return false;
        }

        if (filterDate !== 'all') {
            const today = new Date().toISOString().split('T')[0];
            if (filterDate === 'custom') {
                if (customDateFrom && task.dueDate && task.dueDate < customDateFrom) return false;
                if (customDateTo && task.dueDate && task.dueDate > customDateTo) return false;
                if ((customDateFrom || customDateTo) && !task.dueDate) return false;
            } else if (filterDate === 'overdue' && task.dueDate) {
                if (task.dueDate >= today || task.completed) return false;
            } else if (filterDate === 'today') {
                if (task.dueDate !== today) return false;
            } else if (filterDate === 'tomorrow') {
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                if (task.dueDate !== tomorrow) return false;
            } else if (filterDate === 'week') {
                const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                if (!task.dueDate || task.dueDate > weekFromNow) return false;
            } else if (filterDate === 'no-date') {
                if (task.dueDate && !task.isFlexible) return false;
            }
        }

        if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
        if (filterProject !== 'all' && task.projectId !== filterProject) return false;

        return true;
    });

    const activeCount = filteredTasks.filter(t => !t.completed).length;
    const completedCount = filteredTasks.filter(t => t.completed).length;
    const hasActiveFilters = filterDate !== 'all' || filterPriority !== 'all' || filterProject !== 'all';

    function clearFilters() {
        setFilterDate('all');
        setFilterPriority('all');
        setFilterProject('all');
        setCustomDateFrom('');
        setCustomDateTo('');
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header z wyszukiwarką i filtrami */}
            <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h2 className="text-2xl font-semibold">All Quests</h2>
                    <button
                        onClick={() => openTaskModal()}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
                    >
                        + Add Quest
                    </button>
                </div>

                {/* Wyszukiwarka */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400">🔍</span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search quests by name, description, project, class, or skill..."
                        className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filtry */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <DateRangeFilter
                        filterDate={filterDate}
                        setFilterDate={setFilterDate}
                        customDateFrom={customDateFrom}
                        setCustomDateFrom={setCustomDateFrom}
                        customDateTo={customDateTo}
                        setCustomDateTo={setCustomDateTo}
                    />

                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Priority</label>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Priorities</option>
                            <option value="common">⚪ Common</option>
                            <option value="rare">🔵 Rare</option>
                            <option value="epic">🟣 Epic</option>
                            <option value="legendary">🟠 Legendary</option>
                            <option value="unique">🟡 Unique</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Project</label>
                        <select
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Projects</option>
                            <option value="no-project">📋 No Project</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-sm text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">
                        <span>✕</span><span>Clear all filters</span>
                    </button>
                )}

                {(searchQuery || hasActiveFilters) && (
                    <div className="mt-3 text-sm text-slate-400">
                        Found <span className="text-indigo-400 font-semibold">{filteredTasks.length}</span> quest{filteredTasks.length !== 1 ? 's' : ''}
                        {filteredTasks.length > 0 && <span> ({activeCount} active, {completedCount} completed)</span>}
                    </div>
                )}
            </div>

            {/* Brak wyników */}
            {(searchQuery || hasActiveFilters) && filteredTasks.length === 0 ? (
                <div className="bg-slate-800 rounded-xl shadow p-8 border border-slate-700 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No quests found</h3>
                    <p className="text-slate-400 mb-4">
                        {searchQuery
                            ? <>No quests match "<span className="text-indigo-400">{searchQuery}</span>"</>
                            : 'No quests match the selected filters'}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition">
                                Clear search
                            </button>
                        )}
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition">
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Aktywne zadania */}
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-2xl">⚔️</span>
                            <h3 className="text-xl font-semibold text-indigo-400">Active Quests</h3>
                            <span className="ml-auto text-sm text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
                                {activeCount} active
                            </span>
                        </div>

                        <div className="space-y-3">
                            {activeCount === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="text-lg mb-2">
                                        {searchQuery || hasActiveFilters ? 'No active quests match your criteria' : 'No active quests'}
                                    </p>
                                    <p className="text-sm">
                                        {searchQuery || hasActiveFilters ? 'Try adjusting your search or filters' : 'Start your adventure by creating your first quest!'}
                                    </p>
                                </div>
                            ) : (
                                filteredTasks.filter(t => !t.completed).map(task => {
                                    const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                    const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                    const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                                    return (
                                        <div key={task.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-indigo-500/50 transition-all">
                                            <div className="flex items-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={false}
                                                    onChange={() => toggleTask(task.id)}
                                                    className="mt-1 w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold">{task.name}</h3>
                                                            {task.description && <p className="text-sm text-slate-400 mt-1">{task.description}</p>}
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">{task.xpReward} XP</span>
                                                                <span className="text-xs px-3 py-1 rounded-full bg-yellow-900 text-yellow-300 border border-yellow-700">🪙 {task.goldReward}</span>
                                                                {task.priority && <RarityBadge rarity={task.priority} />}
                                                                {task.dueDate && <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">📅 {task.dueDate}</span>}
                                                                {task.isFlexible && <span className="text-xs px-3 py-1 rounded-full bg-teal-900 text-teal-300 border border-teal-700">🕐 Flexible</span>}
                                                                {project && <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: project.color, color: project.color, backgroundColor: `${project.color}20` }}>{project.name}</span>}
                                                                {taskClass && <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: taskClass.color, color: taskClass.color, backgroundColor: `${taskClass.color}20` }}>{taskClass.name}</span>}
                                                                {skill && <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: skill.color, color: skill.color, backgroundColor: `${skill.color}20` }}>{skill.name}</span>}
                                                                {task.isRecurring && <span className="text-xs px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">🔄 {task.recurringType}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button onClick={() => openEditModal(task)} className="text-slate-400 hover:text-indigo-400 transition">✏️</button>
                                                            <button onClick={() => requestDeleteTask(task.id)} className="text-slate-400 hover:text-rose-400 transition">🗑️</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Ukończone zadania */}
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700">
                        <div
                            className="flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition"
                            onClick={() => setShowCompletedQuests(!showCompletedQuests)}
                        >
                            <span className="text-xl text-slate-400">{showCompletedQuests ? '▼' : '▶'}</span>
                            <span className="text-2xl">✅</span>
                            <h3 className="text-xl font-semibold text-green-400">Completed Quests</h3>
                            <span className="ml-auto text-sm text-slate-400 bg-slate-700 px-3 py-1 rounded-full">{completedCount} completed</span>
                        </div>

                        {showCompletedQuests && (
                            <div className="space-y-3">
                                {completedCount === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <p className="text-lg mb-2">
                                            {searchQuery || hasActiveFilters ? 'No completed quests match your criteria' : 'No completed quests yet'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredTasks.filter(t => t.completed).map(task => {
                                        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                        const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                        const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                                        return (
                                            <div
                                                key={task.id}
                                                className="bg-slate-900 rounded-lg p-4 border border-slate-700 opacity-60 cursor-pointer hover:opacity-80 hover:border-green-500/50 transition-all"
                                                onClick={() => openCompletedTaskView(task)}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={true}
                                                        onChange={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                                                        className="mt-1 w-5 h-5 rounded border-slate-600 text-green-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-semibold line-through text-slate-500">{task.name}</h3>
                                                                {task.description && <p className="text-sm text-slate-400 mt-1">{task.description}</p>}
                                                                <div className="flex flex-wrap gap-2 mt-3">
                                                                    <span className="text-xs px-3 py-1 rounded-full bg-green-900 text-green-300 border border-green-700">✓ {task.xpReward} XP</span>
                                                                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-900 text-yellow-300 border border-yellow-700">🪙 {task.goldReward}</span>
                                                                    {task.priority && <RarityBadge rarity={task.priority} />}
                                                                    {task.dueDate && <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">📅 {task.dueDate}</span>}
                                                                    {project && <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: project.color, color: project.color, backgroundColor: `${project.color}20` }}>{project.name}</span>}
                                                                    {taskClass && <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: taskClass.color, color: taskClass.color, backgroundColor: `${taskClass.color}20` }}>{taskClass.name}</span>}
                                                                    {skill && <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: skill.color, color: skill.color, backgroundColor: `${skill.color}20` }}>{skill.name}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 ml-4" onClick={e => e.stopPropagation()}>
                                                                <button onClick={() => openEditModal(task)} className="text-slate-400 hover:text-indigo-400 transition">✏️</button>
                                                                <button onClick={() => requestDeleteTask(task.id)} className="text-slate-400 hover:text-rose-400 transition">🗑️</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}