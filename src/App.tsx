/**
 * App.tsx — główny orkiestrator TaskQuest
 */

import React from 'react';
import { AppProvider, useAppContext } from './refactored-src/context/AppContext';
import { useSwipeNavigation } from './refactored-src/utils/useSwipeNavigation';
import { MobileAppBanner } from './components/MobileAppBanner';

import { TopBar } from './refactored-src/layout/TopBar';
import { Navigation } from './refactored-src/layout/Navigation';

import { CharacterView } from './refactored-src/views/CharacterView';
import { ActiveTasksView } from './refactored-src/views/ActiveTasksView';
import { DailyView } from './refactored-src/views/DailyView';
import { WeeklyView } from './refactored-src/views/WeeklyView';
import { MonthlyView } from './refactored-src/views/MonthlyView';
import { AllTasksView } from './refactored-src/views/AllTasksView';
import { ProjectsView } from './refactored-src/views/ProjectsView';
import { SettingsView } from './refactored-src/views/SettingsView';

import { TaskModal } from './refactored-src/modals/TaskModal';
import { CompletedTaskModal } from './refactored-src/modals/CompletedTaskModal';
import { DayDetailModal } from './refactored-src/modals/DayDetailModal';
import { DeleteTaskModal } from './refactored-src/modals/DeleteTaskModal';

import { AboutPage } from './components/AboutPage';
import { MinimalOnboarding } from './components/MinimalOnboarding';
import { LevelUpModal } from './components/LevelUpModal';

function isNativePlatform(): boolean {
    return (
        typeof window !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.() === true
    );
}

function AppShell() {
    const {
        view, setView,
        isPremium,
        selectedProject,
        showAboutPage, setShowAboutPage,
        showOnboarding, handleOnboardingComplete,
        showTaskModal,
        showCompletedTaskModal,
        selectedDayModal,
        pendingDeleteTaskId,
        levelUpQueue, popLevelUp,
    } = useAppContext();

    const isNative = isNativePlatform();

    useSwipeNavigation({
        currentView: view,
        onViewChange: setView,
        isPremium,
        config: isNative ? {} : { minSwipeX: 9999 },
    });

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

    // Na mobile native — padding pod baner AdMob
    // Na mobile web — padding pod MobileAppBanner
    // Na desktop — minimalny padding
    const bottomPadding = isNative ? 'pb-24' : 'pb-4';

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-2 sm:p-4 ${bottomPadding}`}>
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

            {/* Banner o aplikacji mobilnej — tylko na mobile web */}
            <MobileAppBanner />
        </div>
    );
}

export default function App() {
    return (
        <AppProvider>
            <AppShell />
        </AppProvider>
    );
}