import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Target } from 'lucide-react';
import { habitStorage, type Habit, formatDate } from '@/lib/habits';
import { Button } from '@/components/ui/button';

interface AnalyticsProps {
  onBackClick: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onBackClick }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    setHabits(habitStorage.getHabits());
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
      const dateStr = formatDate(date);
      const isToday = dateStr === formatDate(new Date());
      
      // Calculate completion rate for this day
      const completedHabits = habits.filter(habit => 
        habitStorage.isCompleted(habit.id, dateStr)
      ).length;
      const completionRate = habits.length > 0 ? completedHabits / habits.length : 0;

      days.push(
        <div
          key={day}
          className={`
            h-8 w-8 rounded-lg flex items-center justify-center text-sm font-medium
            relative transition-all duration-200
            ${isToday ? 'ring-2 ring-primary' : ''}
          `}
        >
          <div
            className={`
              absolute inset-0 rounded-lg transition-all duration-200
              ${completionRate === 1 ? 'bg-ios-green' : 
                completionRate > 0.5 ? 'bg-ios-blue/60' : 
                completionRate > 0 ? 'bg-ios-blue/30' : 'bg-muted/30'}
            `}
          />
          <span className={`
            relative z-10 
            ${completionRate > 0.5 ? 'text-white' : 'text-foreground'}
          `}>
            {day}
          </span>
        </div>
      );
    }

    return days;
  };

  const getOverallStats = () => {
    const totalHabits = habits.length;
    if (totalHabits === 0) return { completion: 0, streak: 0, consistency: 0 };

    const today = formatDate(new Date());
    const completedToday = habits.filter(habit => 
      habitStorage.isCompleted(habit.id, today)
    ).length;

    const completion = (completedToday / totalHabits) * 100;

    // Calculate average streak
    const streaks = habits.map(habit => habitStorage.getStreakCount(habit.id));
    const avgStreak = streaks.reduce((sum, streak) => sum + streak, 0) / totalHabits;

    // Calculate consistency over last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return formatDate(date);
    });

    const consistencyData = last30Days.map(date => {
      const completed = habits.filter(habit => 
        habitStorage.isCompleted(habit.id, date)
      ).length;
      return completed / totalHabits;
    });

    const consistency = consistencyData.reduce((sum, rate) => sum + rate, 0) / 30 * 100;

    return { completion, streak: Math.round(avgStreak), consistency };
  };

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 mt-2">
        <Button
          onClick={onBackClick}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="ios-card p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-ios-green/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-ios-green" />
            </div>
            <div className="text-lg font-semibold text-foreground">{Math.round(stats.completion)}%</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
          
          <div className="ios-card p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-ios-blue/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-ios-blue" />
            </div>
            <div className="text-lg font-semibold text-foreground">{stats.streak}</div>
            <div className="text-xs text-muted-foreground">Avg Streak</div>
          </div>
          
          <div className="ios-card p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="text-lg font-semibold text-foreground">{Math.round(stats.consistency)}%</div>
            <div className="text-xs text-muted-foreground">30d Avg</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="ios-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                ←
              </Button>
              <Button
                onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                →
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted/30"></div>
              <span>0%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-ios-blue/30"></div>
              <span>1-50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-ios-blue/60"></div>
              <span>51-99%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-ios-green"></div>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Individual Habit Streaks */}
        {habits.length > 0 && (
          <div className="ios-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Current Streaks</h3>
            <div className="space-y-3">
              {habits.map(habit => {
                const streak = habitStorage.getStreakCount(habit.id);
                return (
                  <div key={habit.id} className="flex items-center justify-between">
                    <span className="text-foreground font-medium">{habit.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-primary">{streak}</span>
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};