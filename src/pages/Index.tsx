import React, { useState } from 'react';
import { HabitList } from '@/components/HabitList';
import { Analytics } from '@/components/Analytics';

const Index = () => {
  const [currentView, setCurrentView] = useState<'habits' | 'analytics'>('habits');

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'habits' ? (
        <HabitList onAnalyticsClick={() => setCurrentView('analytics')} />
      ) : (
        <Analytics onBackClick={() => setCurrentView('habits')} />
      )}
    </div>
  );
};

export default Index;
