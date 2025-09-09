import React, { useState, useEffect } from 'react';
import { Check, Plus, Edit3, Trash2, GripVertical } from 'lucide-react';
import { habitStorage, type Habit, getTodayString } from '@/lib/habits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HabitListProps {
  onAnalyticsClick: () => void;
}

export const HabitList: React.FC<HabitListProps> = ({ onAnalyticsClick }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [completions, setCompletions] = useState<Record<string, boolean>>({});

  const today = getTodayString();

  useEffect(() => {
    const loadedHabits = habitStorage.getHabits();
    setHabits(loadedHabits.sort((a, b) => a.order - b.order));

    // Load today's completions
    const todayCompletions: Record<string, boolean> = {};
    loadedHabits.forEach(habit => {
      todayCompletions[habit.id] = habitStorage.isCompleted(habit.id, today);
    });
    setCompletions(todayCompletions);
  }, [today]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      order: habits.length,
      createdAt: new Date()
    };

    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    habitStorage.saveHabits(updatedHabits);
    setNewHabitName('');
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id).map((h, index) => ({
      ...h,
      order: index
    }));
    setHabits(updatedHabits);
    habitStorage.saveHabits(updatedHabits);
  };

  const toggleHabitCompletion = (habitId: string) => {
    habitStorage.toggleCompletion(habitId, today);
    setCompletions(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }));
  };

  const moveHabit = (fromIndex: number, toIndex: number) => {
    const newHabits = [...habits];
    const [moved] = newHabits.splice(fromIndex, 1);
    newHabits.splice(toIndex, 0, moved);
    
    const reorderedHabits = newHabits.map((habit, index) => ({
      ...habit,
      order: index
    }));
    
    setHabits(reorderedHabits);
    habitStorage.saveHabits(reorderedHabits);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Today</h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onAnalyticsClick}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            Analytics
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary-hover"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3 max-w-md mx-auto">
        {habits.map((habit, index) => (
          <div
            key={habit.id}
            className="ios-card p-4 slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              {isEditing && (
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <Button
                    onClick={() => deleteHabit(habit.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <button
                onClick={() => toggleHabitCompletion(habit.id)}
                className="flex-shrink-0"
                disabled={isEditing}
              >
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 ease-out
                  ${completions[habit.id] 
                    ? 'bg-ios-green border-ios-green scale-110' 
                    : 'border-border hover:border-ios-green'
                  }
                  ${isEditing ? 'opacity-50' : 'active:scale-95'}
                `}>
                  {completions[habit.id] && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>
              
              <span className={`
                flex-1 text-base font-medium transition-all duration-300
                ${completions[habit.id] 
                  ? 'text-muted-foreground line-through' 
                  : 'text-foreground'
                }
              `}>
                {habit.name}
              </span>
            </div>
          </div>
        ))}

        {/* Add New Habit */}
        {isEditing && (
          <div className="ios-card p-4 slide-in">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Add new habit"
                className="ios-input flex-1 border-0 bg-transparent p-0 focus:ring-0"
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              />
              {newHabitName.trim() && (
                <Button
                  onClick={addHabit}
                  size="sm"
                  className="ios-button px-3 py-1 text-xs"
                >
                  Add
                </Button>
              )}
            </div>
          </div>
        )}

        {habits.length === 0 && !isEditing && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">Tap the edit button to add your first habit</p>
          </div>
        )}
      </div>
    </div>
  );
};