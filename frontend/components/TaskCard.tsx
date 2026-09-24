'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { User, CheckCircle2, Clock, Loader2, Pencil, Trash2, CalendarCheck } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onEdit?: (task: Task) => void;
}

const statusConfig: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  completed: {
    label: 'Completed',
    badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  in_progress: {
    label: 'In Progress',
    badgeClass: 'bg-sky-100 text-sky-700 border border-sky-200',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  pending: {
    label: 'Pending',
    badgeClass: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    icon: <Clock className="w-3 h-3" />,
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
  onEdit,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentStatus = (task.status || 'pending').toLowerCase();
  const config = statusConfig[currentStatus] ?? statusConfig.pending;

  return (
    <div className="group bg-white border border-gray-200 hover:border-sky-300 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
            {task.title}
          </h3>
          {/* Status Badge */}
          <span className={`shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeClass}`}>
            {config.icon}
            {config.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 mb-3 whitespace-pre-line line-clamp-3 leading-relaxed">
          {task.description || 'No description provided.'}
        </p>

        {/* Assignee Chip */}
        {task.assigned_email && (
          <div className="flex items-center gap-1.5 text-xs text-sky-600 font-medium mb-3 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-lg w-fit max-w-full">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[200px]">{task.assigned_email}</span>
          </div>
        )}

        {/* Completed At */}
        {task.completed_at && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
            <CalendarCheck className="w-3 h-3" />
            Completed: {new Date(task.completed_at).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="space-y-2 pt-3 border-t border-gray-100 mt-2">
        {/* Status Dropdown */}
        <select
          value={currentStatus}
          disabled={isUpdatingStatus}
          onChange={(e) => handleStatusUpdate(e.target.value as TaskStatus)}
          className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 transition disabled:opacity-50 cursor-pointer"
        >
          <option value="pending">⏳ Pending</option>
          <option value="in_progress">🔄 In Progress</option>
          <option value="completed">✅ Completed</option>
        </select>

        {/* Edit & Delete Buttons */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              id={`edit-task-${task.id}`}
              onClick={() => onEdit(task)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          )}
          <button
            id={`delete-task-${task.id}`}
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
