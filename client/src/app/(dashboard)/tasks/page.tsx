'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Circle,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { cn, formatDate } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  due_time?: string;
  tags?: string[];
  created_at: string;
}

const priorityColors = {
  low: 'bg-slate-grey/20 text-slate-grey',
  medium: 'bg-brand-blue/10 text-brand-blue',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-danger/10 text-danger',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks?status=${filter === 'all' ? '' : filter}`,
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
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const toggleTaskStatus = async (task: Task) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: newStatus } : t
          )
        );
        toast.success(
          newStatus === 'completed' ? 'Task completed!' : 'Task reopened'
        );
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast.success('Task deleted');
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 text-heading">Tasks</h1>
          <p className="text-body">Manage your tasks and stay organized</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-body" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {(['active', 'completed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-sm text-small font-medium transition-colors',
                filter === f
                  ? 'bg-brand-gradient text-white'
                  : 'bg-white text-body hover:bg-offwhite border border-slate-grey/20'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <p className="text-body mb-4">No tasks found</p>
          <Button
            variant="secondary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create your first task
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleTaskStatus(task)}
                onEdit={() => setEditingTask(task)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <TaskModal
        isOpen={isCreateModalOpen || !!editingTask}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={() => {
          fetchTasks();
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="relative"
    >
      <Card
        variant="default"
        padding="md"
        className={cn(
          'flex items-start gap-3 transition-opacity',
          isCompleted && 'opacity-60'
        )}
      >
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="flex-shrink-0 mt-0.5"
        >
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <Circle className="w-5 h-5 text-slate-grey hover:text-brand-blue transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-body font-medium text-heading',
              isCompleted && 'line-through text-body'
            )}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-small text-body mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Priority */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-sm text-tiny font-medium',
                priorityColors[task.priority]
              )}
            >
              {task.priority}
            </span>

            {/* Due date */}
            {task.due_date && (
              <span className="flex items-center gap-1 text-tiny text-body">
                <Calendar className="w-3 h-3" />
                {formatDate(task.due_date)}
              </span>
            )}

            {/* Due time */}
            {task.due_time && (
              <span className="flex items-center gap-1 text-tiny text-body">
                <Clock className="w-3 h-3" />
                {task.due_time}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-sm hover:bg-offwhite"
          >
            <MoreVertical className="w-4 h-4 text-body" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-sm shadow-elevation-2 border border-slate-grey/10 py-1 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-small text-heading hover:bg-offwhite"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-small text-danger hover:bg-danger/5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: () => void;
}

function TaskModal({ isOpen, onClose, task, onSave }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.due_date || '');
      setPriority(task.priority);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const url = task
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${task.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`;

      const response = await fetch(url, {
        method: task ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          due_date: dueDate || undefined,
          priority,
        }),
      });

      if (response.ok) {
        toast.success(task ? 'Task updated!' : 'Task created!');
        onSave();
      } else {
        toast.error('Failed to save task');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
        />

        <div>
          <label className="block text-small font-medium text-heading mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
            className="w-full px-4 py-3 rounded-sm border border-slate-grey text-body bg-white placeholder:text-slate-grey/60 focus:outline-none focus:ring-4 focus:ring-brand-cyan/12 focus:border-brand-blue resize-none"
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div>
          <label className="block text-small font-medium text-heading mb-1.5">
            Priority
          </label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  'px-3 py-1.5 rounded-sm text-small font-medium transition-all',
                  priority === p
                    ? priorityColors[p]
                    : 'bg-offwhite text-body hover:bg-slate-grey/20'
                )}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {task ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
