import { getSupabaseUserClient } from '../services/supabaseService.js';

export const TaskModel = {
    // Fetch tasks with search and filtering
    async findAll(token, { status, search }) {
        const supabase = getSupabaseUserClient(token);

        let query = supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.ilike('status', status);
        }
        
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,assigned_email.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // Find a single task by ID
    async findById(token, taskId) {
        const supabase = getSupabaseUserClient(token);
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single();

        if (error) throw error;
        return data;
    },

    // Create a new task (matches exact Supabase schema)
    async create(token, userId, taskData) {
        const { title, description, status, assigned_email, assigned_to } = taskData;
        const supabase = getSupabaseUserClient(token);

        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    created_by: userId,
                    title,
                    description: description || null,
                    status: status || 'pending',
                    assigned_email: assigned_email || null,
                    assigned_to: assigned_to || null,
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update task by ID (matches exact Supabase schema)
    async update(token, taskId, taskData) {
        const { title, description, status, assigned_email, assigned_to } = taskData;
        const supabase = getSupabaseUserClient(token);

        const updatePayload = {};
        if (title !== undefined) updatePayload.title = title;
        if (description !== undefined) updatePayload.description = description;
        if (status !== undefined) {
            updatePayload.status = status;
            if (status.toLowerCase() === 'completed') {
                updatePayload.completed_at = new Date().toISOString();
            }
        }
        if (assigned_email !== undefined) updatePayload.assigned_email = assigned_email;
        if (assigned_to !== undefined) updatePayload.assigned_to = assigned_to;

        const { data, error } = await supabase
            .from('tasks')
            .update(updatePayload)
            .eq('id', taskId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete task by ID
    async delete(token, taskId) {
        const supabase = getSupabaseUserClient(token);

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) throw error;
        return true;
    },
};