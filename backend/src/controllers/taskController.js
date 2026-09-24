import { TaskModel } from '../models/taskModel.js';
import { sendTaskCreatedEmail, sendTaskCompletedEmail } from '../services/emailService.js';

// GET /api/tasks
export const getTasks = async (req, res) => {
    try {
        const { status, search } = req.query;
        const tasks = await TaskModel.findAll(req.token, { status, search });

        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// POST /api/tasks
export const createTask = async (req, res) => {
    try {
        const { title, assigned_email } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Task title is required' });
        }

        const newTask = await TaskModel.create(req.token, req.user.sub, req.body);

        // Send email notification asynchronously (non-blocking)
        const recipientEmail = assigned_email || req.user.email;
        if (recipientEmail) {
            sendTaskCreatedEmail(recipientEmail, newTask).catch((emailErr) => {
                console.error('Failed to send task creation email notification:', emailErr.message);
            });
        }

        return res.status(201).json(newTask);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedTask = await TaskModel.update(req.token, id, req.body);

        // If status changed to COMPLETED / completed, send completion email notification
        if (status && status.toLowerCase() === 'completed') {
            const recipientEmail = updatedTask.assigned_email || req.user.email;
            if (recipientEmail) {
                sendTaskCompletedEmail(recipientEmail, updatedTask).catch((emailErr) => {
                    console.error('Failed to send task completion email notification:', emailErr.message);
                });
            }
        }

        return res.status(200).json(updatedTask);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await TaskModel.delete(req.token, id);

        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};