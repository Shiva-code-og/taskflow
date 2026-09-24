import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface TaskFilterParams {
  search?: string;
  status?: string;
  priority?: string;
}

/**
 * Fetch all tasks matching the provided filters for the authenticated user.
 */
export async function getTasks(token: string, params: TaskFilterParams = {}): Promise<Task[]> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append('search', params.search);
  if (params.status) searchParams.append('status', params.status);
  if (params.priority) searchParams.append('priority', params.priority);

  const url = `${API_BASE_URL}/tasks?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch tasks (HTTP ${res.status})`);
  }

  return res.json();
}

/**
 * Create a new task.
 */
export async function createTask(token: string, input: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create task (HTTP ${res.status})`);
  }

  return res.json();
}

/**
 * Update an existing task by ID.
 */
export async function updateTask(
  token: string,
  taskId: string,
  updates: UpdateTaskInput
): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update task (HTTP ${res.status})`);
  }

  return res.json();
}

/**
 * Delete a task by ID.
 */
export async function deleteTask(token: string, taskId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete task (HTTP ${res.status})`);
  }

  return true;
}
