'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn, formatDate } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/Toast';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  due_time?: string;
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchTasks = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks?date_range_start=${startDate}&date_range_end=${endDate}&status=active`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [weekStart]);

  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const goToToday = () => {
    const today = new Date();
    setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    setSelectedDate(today);
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => task.due_date === dateStr);
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 text-heading">Schedule</h1>
          <p className="text-body">View and manage your weekly schedule</p>
        </div>
        <Button variant="secondary" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousWeek}
          className="p-2 rounded-sm hover:bg-offwhite"
        >
          <ChevronLeft className="w-5 h-5 text-heading" />
        </button>

        <h2 className="text-h4 text-heading">
          {format(weekStart, 'MMMM yyyy')}
        </h2>

        <button
          onClick={goToNextWeek}
          className="p-2 rounded-sm hover:bg-offwhite"
        >
          <ChevronRight className="w-5 h-5 text-heading" />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'p-3 rounded-md text-center transition-all',
                isSelected
                  ? 'bg-brand-gradient text-white shadow-brand'
                  : isTodayDate
                    ? 'bg-brand-cyan/10 border-2 border-brand-cyan'
                    : 'bg-white border border-slate-grey/10 hover:border-brand-blue'
              )}
            >
              <p className={cn(
                'text-tiny font-medium',
                isSelected ? 'text-white/80' : 'text-body'
              )}>
                {format(day, 'EEE')}
              </p>
              <p className={cn(
                'text-h4 font-semibold',
                isSelected ? 'text-white' : 'text-heading'
              )}>
                {format(day, 'd')}
              </p>
              {dayTasks.length > 0 && (
                <div className="flex justify-center gap-1 mt-1">
                  {dayTasks.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-white/60' : 'bg-brand-blue'
                      )}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Day Details */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-brand-blue" />
          <h3 className="text-h4 text-heading">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedDateTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-body mb-2">No tasks scheduled for this day</p>
            <p className="text-small text-body">
              Use the chat to add tasks: &quot;Add a task for {format(selectedDate, 'EEEE')}&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-sm bg-offwhite"
              >
                {task.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-grey flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={cn(
                    'text-small font-medium',
                    task.status === 'completed'
                      ? 'text-body line-through'
                      : 'text-heading'
                  )}>
                    {task.title}
                  </p>
                  {task.due_time && (
                    <p className="flex items-center gap-1 text-tiny text-body mt-1">
                      <Clock className="w-3 h-3" />
                      {task.due_time}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-sm text-tiny font-medium',
                    task.priority === 'urgent' && 'bg-danger/10 text-danger',
                    task.priority === 'high' && 'bg-warning/10 text-warning',
                    task.priority === 'medium' && 'bg-brand-blue/10 text-brand-blue',
                    task.priority === 'low' && 'bg-slate-grey/20 text-slate-grey'
                  )}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
