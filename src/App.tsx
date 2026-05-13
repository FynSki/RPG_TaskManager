/**
 * App.tsx — główny orkiestrator TaskQuest
 * Po refaktoryzacji: ~80 linii zamiast 3317.
 *
 * Stan i logika → AppContext
 * Widoki        → refactored-src/views/
 * Modale        → refactored-src/modals/
 * Layout        → refactored-src/layout/
 */

import React from 'react';
import { AppProvider, useAppContext } from './refactored-src/context/AppContext';

// Layout
import { TopBar } from './refactored-src/layout/TopBar';
import { Navigation } from './refactored-src/layout/Navigation';

// Widoki
import { CharacterView } from './refactored-src/views/CharacterView';
import { ActiveTasksView } from './refactored-src/views/ActiveTasksView';
import { DailyView } from './refactored-src/views/DailyView';
import { WeeklyView } from './refactored-src/views/WeeklyView';
import { MonthlyView } from './refactored-src/views/MonthlyView';
import { AllTasksView } from './refactored-src/views/AllTasksView';
import { ProjectsView } from './refactored-src/views/ProjectsView';
import { SettingsView } from './refactored-src/views/SettingsView';

// Modale
import { TaskModal } from './refactored-src/modals/TaskModal';
import { CompletedTaskModal } from './refactored-src/modals/CompletedTaskModal';
import { DayDetailModal } from './refactored-src/modals/DayDetailModal';
import { DeleteTaskModal } from './refactored-src/modals/DeleteTaskModal';

// Istniejące komponenty (bez zmian)
import { AboutPage } from './components/AboutPage';
import { MinimalOnboarding } from './components/MinimalOnboarding';
import { LevelUpModal } from './components/LevelUpModal';

// ─── Shell ────────────────────────────────────────────────────────────────────

function AppShell() {
    const {
        view,
        selectedProject,
        showAboutPage, setShowAboutPage,
        showOnboarding, handleOnboardingComplete,
        showTaskModal,
        showCompletedTaskModal,
        selectedDayModal,
        pendingDeleteTaskId,
        levelUpQueue, popLevelUp,
    } = useAppContext();

    if (showAboutPage) {
        return <AboutPage onClose={() => setShowAboutPage(false)} />;
    }

    const VIEWS: Record<string, React.ReactElement> = {
        character: <CharacterView />,
        activeTasks: <ActiveTasksView />,
        daily: <DailyView />,
        weekly: <WeeklyView />,
        monthly: <MonthlyView />,
        all: <AllTasksView />,
        projects: <ProjectsView />,
        settings: <SettingsView />,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-2 sm:p-4">
            {showOnboarding && (
                <MinimalOnboarding onComplete={handleOnboardingComplete} />
            )}

            <div className="max-w-7xl mx-auto">
                {!selectedProject && <TopBar />}
                {!selectedProject && <Navigation />}
                {VIEWS[view] ?? null}
            </div>

            {showTaskModal && <TaskModal />}
            {showCompletedTaskModal && <CompletedTaskModal />}
            {selectedDayModal && <DayDetailModal />}
            {pendingDeleteTaskId && <DeleteTaskModal />}

            {levelUpQueue.length > 0 && (
                <LevelUpModal
                    isOpen={true}
                    onClose={popLevelUp}
                    levelUpData={levelUpQueue[0]}
                />
            )}
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
    return (
        <AppProvider>
            <AppShell />
        </AppProvider>
    );
}