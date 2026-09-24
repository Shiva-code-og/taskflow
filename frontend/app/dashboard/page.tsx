'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { TaskForm } from '@/components/TaskForm';
import { TaskCard } from '@/components/TaskCard';
import { AssignTaskModal } from '@/components/AssignTaskModal';
import { Search, SlidersHorizontal, Loader2, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Editing state for modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // 1. Listen for active session
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Double check with getUser before redirecting
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }
      }

      if (session) {
        setUserEmail(session.user?.email ?? null);
        setSessionToken(session.access_token);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserEmail(session.user?.email ?? null);
        setSessionToken(session.access_token);
      } else {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // 2. Fetch tasks using centralized API client
  const fetchTasks = useCallback(async () => {
    if (!sessionToken) return;

    try {
      setLoading(true);
      const data = await getTasks(sessionToken, {
        search,
        status: statusFilter,
      });

      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionToken, search, statusFilter]);

  useEffect(() => {
    if (sessionToken) {
      fetchTasks();
    }
  }, [sessionToken, fetchTasks]);

  // Handler: Create task
  const handleCreateTask = async (input: CreateTaskInput) => {
    if (!sessionToken) return;
    await createTask(sessionToken, input);
    await fetchTasks();
  };

  // Handler: Update status
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!sessionToken) return;
    await updateTask(sessionToken, taskId, { status: newStatus });
    await fetchTasks();
  };

  // Handler: Update full task from modal
  const handleUpdateTask = async (taskId: string, updates: UpdateTaskInput) => {
    if (!sessionToken) return;
    await updateTask(sessionToken, taskId, updates);
    await fetchTasks();
  };

  // Handler: Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!sessionToken) return;
    await deleteTask(sessionToken, taskId);
    await fetchTasks();
  };

  // Handler: Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Navigation Bar */}
      <Navbar userEmail={userEmail} onSignOut={handleSignOut} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Task Creation Form */}
        <TaskForm onSubmit={handleCreateTask} />

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="task-search"
              type="text"
              placeholder="Search tasks by title, description, or assigned email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 transition cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
        </div>

        {/* Task Grid / Content */}
        {loading && !tasks.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 text-sky-500 mb-3 animate-spin" />
            <p className="text-sm font-medium">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-2xl border-2 border-dashed border-sky-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No tasks found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              {search || statusFilter
                ? 'Try clearing your search or status filter.'
                : 'Get started by creating your first task above!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                onEdit={(t) => setEditingTask(t)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Task Modal */}
      <AssignTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdate={handleUpdateTask}
      />
    </div>
  );
}