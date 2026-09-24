'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, UpdateTaskInput } from '@/types/task';
import { X, FileText, Mail, AlignLeft, Loader2, Save } from 'lucide-react';

interface AssignTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: string, updates: UpdateTaskInput) => Promise<void>;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen,
  task,
  onClose,
  onUpdate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [assignedEmail, setAssignedEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus((task.status as TaskStatus) || 'pending');
      setAssignedEmail(task.assigned_email || '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        assigned_email: assignedEmail.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-sky-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Edit & Reassign Task</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              Title <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
          </div>

          {/* Assign to Email */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              Assign to <span className="text-gray-400 font-normal ml-1">(collaborator Gmail)</span>
            </label>
            <input
              type="email"
              placeholder="collaborator@gmail.com"
              value={assignedEmail}
              onChange={(e) => setAssignedEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 transition cursor-pointer"
            >
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-sky-500" />
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              id="save-task-btn"
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm rounded-xl transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="w-4 h-4" />Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
