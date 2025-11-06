import { useState } from 'react';
import type { Task, Character, Project, Skill, TaskClass, RecurringTaskCompletion } from '../refactored-src/types';
import {
    exportToJSON,
    downloadJSON,
    parseImportedJSON,
    generateFilename,
} from '../refactored-src/utils/exportImportUtils';

interface DataManagementProps {
    tasks: Task[];
    character: Character;
    projects: Project[];
    skills: Skill[];
    taskClasses: TaskClass[];
    recurringCompletions: RecurringTaskCompletion[];
    onImport: (data: {
        tasks: Task[];
        character: Character;
        projects: Project[];
        skills: Skill[];
        taskClasses: TaskClass[];
        recurringCompletions: RecurringTaskCompletion[];
    }) => void;
}

export function DataManagement({
    tasks,
    character,
    projects,
    skills,
    taskClasses,
    recurringCompletions,
    onImport,
}: DataManagementProps) {
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleExport = () => {
        const jsonData = exportToJSON(
            tasks,
            character,
            projects,
            skills,
            taskClasses,
            recurringCompletions
        );
        downloadJSON(jsonData, generateFilename());
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonString = e.target?.result as string;
            const importedData = parseImportedJSON(jsonString);

            if (!importedData) {
                setImportStatus('error');
                alert('❌ Invalid backup file! Please check the file and try again.');
                return;
            }

            // Confirm before importing
            const confirm = window.confirm(
                '⚠️ This will replace ALL your current data!\n\n' +
                `Backup contains:\n` +
                `• ${importedData.data.tasks?.length || 0} tasks\n` +
                `• Level ${importedData.data.character?.level || 1} character\n` +
                `• ${importedData.data.projects?.length || 0} projects\n\n` +
                'Are you sure you want to import this backup?'
            );

            if (confirm) {
                onImport({
                    tasks: importedData.data.tasks || [],
                    character: importedData.data.character,
                    projects: importedData.data.projects || [],
                    skills: importedData.data.skills || [],
                    taskClasses: importedData.data.taskClasses || [],
                    recurringCompletions: importedData.data.recurringCompletions || [],
                });

                setImportStatus('success');
                setTimeout(() => setImportStatus('idle'), 3000);

                // Reset file input
                event.target.value = '';
            }
        };

        reader.onerror = () => {
            setImportStatus('error');
            alert('❌ Error reading file. Please try again.');
        };

        reader.readAsText(file);
    };

    return (
        <div className="bg-indigo-900 rounded-xl p-6 border border-indigo-700">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-indigo-100 mb-2">
                    📦 Backup & Restore
                </h3>
                <p className="text-indigo-200 text-sm">
                    Export your data to JSON file for backup or transfer to another device.
                </p>
            </div>

            {/* Export Section */}
            <div className="mb-6">
                <button
                    onClick={handleExport}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl"
                >
                    ⬇️ Export Data (JSON)
                </button>
                <p className="text-xs text-indigo-300 mt-2">
                    Download a backup file with all your data
                </p>
            </div>

            {/* Import Section */}
            <div className="pt-4 border-t border-indigo-700 mb-6">
                <p className="text-indigo-200 text-sm mb-3 font-medium">
                    Import data from a backup file:
                </p>
                <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="w-full px-4 py-3 bg-slate-800 border border-indigo-600 rounded-lg text-slate-100 
                             file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 
                             file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 
                             file:cursor-pointer cursor-pointer transition"
                />
                <p className="text-xs text-indigo-300 mt-2">
                    ⚠️ Importing will replace all your current data
                </p>

                {/* Import Status Messages */}
                {importStatus === 'success' && (
                    <div className="mt-3 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-sm">
                        ✅ Data imported successfully!
                    </div>
                )}
                {importStatus === 'error' && (
                    <div className="mt-3 p-3 bg-rose-900/50 border border-rose-700 rounded-lg text-rose-200 text-sm">
                        ❌ Failed to import data. Please check the file.
                    </div>
                )}
            </div>

            {/* Statistics */}
            <div className="pt-4 border-t border-indigo-700">
                <p className="text-xs text-indigo-300 mb-3 font-medium">Current data:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-indigo-800/50">
                        <div className="text-slate-400 text-xs mb-1">Tasks</div>
                        <div className="text-2xl font-bold text-indigo-300">{tasks.length}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            {tasks.filter(t => t.completed).length} completed
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-indigo-800/50">
                        <div className="text-slate-400 text-xs mb-1">Level</div>
                        <div className="text-2xl font-bold text-indigo-300">{character.level}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            {character.unspentPoints} points
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-indigo-800/50">
                        <div className="text-slate-400 text-xs mb-1">Total XP</div>
                        <div className="text-2xl font-bold text-indigo-300">
                            {character.totalXp.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {character.xp} current
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-indigo-800/50">
                        <div className="text-slate-400 text-xs mb-1">Projects</div>
                        <div className="text-2xl font-bold text-indigo-300">{projects.length}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            {skills.length} skills
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-indigo-800/30">
                <p className="text-xs text-indigo-200 font-medium mb-2">💡 Backup Tips:</p>
                <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Export regularly to avoid data loss</li>
                    <li>• Store backups in multiple locations (Drive, email)</li>
                    <li>• Test import occasionally to ensure backups work</li>
                    <li>• Create backup before major changes or updates</li>
                </ul>
            </div>
        </div>
    );
}