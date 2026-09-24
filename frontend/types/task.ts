export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
    id: string;
    created_by?: string;
    title: string;
    description?: string;
    status: TaskStatus | string;
    assigned_to?: string;
    assigned_email?: string;
    created_at: string;
    completed_at?: string;
}

export interface CreateTaskInput {
    title: string;
    description?: string;
    status?: TaskStatus | string;
    assigned_email?: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: TaskStatus | string;
    assigned_email?: string;
}