export interface Habit {
  id: string;
  name: string;
  order: number;
  createdAt: Date;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

const HABITS_KEY = 'habits';
const COMPLETIONS_KEY = 'habit_completions';

export const habitStorage = {
  getHabits(): Habit[] {
    const stored = localStorage.getItem(HABITS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((h: any) => ({
      ...h,
      createdAt: new Date(h.createdAt)
    }));
  },

  saveHabits(habits: Habit[]): void {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },

  getCompletions(): HabitCompletion[] {
    const stored = localStorage.getItem(COMPLETIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveCompletions(completions: HabitCompletion[]): void {
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
  },

  toggleCompletion(habitId: string, date: string): void {
    const completions = this.getCompletions();
    const existingIndex = completions.findIndex(
      c => c.habitId === habitId && c.date === date
    );

    if (existingIndex >= 0) {
      completions[existingIndex].completed = !completions[existingIndex].completed;
    } else {
      completions.push({ habitId, date, completed: true });
    }

    this.saveCompletions(completions);
  },

  isCompleted(habitId: string, date: string): boolean {
    const completions = this.getCompletions();
    const completion = completions.find(
      c => c.habitId === habitId && c.date === date
    );
    return completion?.completed || false;
  },

  getStreakCount(habitId: string): number {
    const completions = this.getCompletions()
      .filter(c => c.habitId === habitId && c.completed)
      .map(c => c.date)
      .sort();

    if (completions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    // Check backwards from today
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (completions.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayString = (): string => {
  return formatDate(new Date());
};