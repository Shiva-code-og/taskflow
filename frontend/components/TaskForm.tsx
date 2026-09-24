'use client';

import React, { useState } from 'react';
import { CreateTaskInput, TaskStatus } from '@/types/task';
import { Plus, Loader2, FileText, Mail, AlignLeft } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (task: CreateTaskInput) => Promise<void>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [assignedEmail, setAssignedEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        assigned_email: assignedEmail.trim() || undefined,
      });
      setTitle('');
      setDescription('');
      setStatus('pending');
      setAssignedEmail('');
    } catch (err) {
      console.error('Error submitting task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-5 sm:p-6 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-sm">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Create New Task</h2>
          <p className="text-xs text-gray-400">Create and assign tasks to yourself or collaborators</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Title Input */}
          <div className="md:col-span-6">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Design homepage mockup..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              required
            />
          </div>

          {/* Assignee Email */}
          <div className="md:col-span-6">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              Assign to <span className="text-gray-400 font-normal ml-1">(collaborator Gmail)</span>
            </label>
            <input
              type="email"
              placeholder="colleague@gmail.com"
              value={assignedEmail}
              onChange={(e) => setAssignedEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-sky-500" />
            Description <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Add details, instructions, or links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-1">
          <button
            id="add-task-btn"
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Task
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
