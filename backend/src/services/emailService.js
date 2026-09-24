import { Resend } from 'resend'
import nodemailer from 'nodemailer'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Fallback to Nodemailer if RESEND_API_KEY is not set
const transporter = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    })
    : null

export const sendTaskCreatedEmail = async (toEmail, taskData) => {
    if (!toEmail) return
    const title = typeof taskData === 'string' ? taskData : taskData.title
    const description = typeof taskData === 'string' ? '' : (taskData.description || '')
    const priority = typeof taskData === 'string' ? '' : (taskData.priority || '')
    const subject = `New Task: ${title}`
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937;">
            <h2 style="color: #4F46E5; margin-bottom: 8px;">📋 New Task Assigned</h2>
            <p style="font-size: 14px; margin-bottom: 16px;">A new task has been created and assigned to you:</p>
            <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 6px 0;"><strong>Title:</strong> ${title}</p>
                ${description ? `<p style="margin: 6px 0;"><strong>Description:</strong> ${description}</p>` : ''}
                ${priority ? `<p style="margin: 6px 0;"><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority}</span></p>` : ''}
            </div>
            <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">— TaskFlow Notifications</p>
        </div>
    `

    try {
        if (resend) {
            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'TaskFlow <onboarding@resend.dev>',
                to: [toEmail],
                subject,
                html,
            })
            if (error) {
                console.error('Resend email error:', error)
            } else {
                console.log(`Task creation email sent via Resend to ${toEmail}:`, data?.id)
            }
        } else if (transporter) {
            await transporter.sendMail({
                from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
                to: toEmail,
                subject,
                html,
            })
            console.log(`Task creation email sent via SMTP to ${toEmail}`)
        }
    } catch (error) {
        console.error('Error sending task creation email:', error)
    }
}

export const sendTaskCompletedEmail = async (toEmail, taskData) => {
    if (!toEmail) return
    const title = typeof taskData === 'string' ? taskData : taskData.title
    const description = typeof taskData === 'string' ? '' : (taskData.description || '')
    const subject = `✅ Task Completed: ${title}`
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937;">
            <h2 style="color: #16A34A; margin-bottom: 8px;">✅ Task Completed</h2>
            <p style="font-size: 14px; margin-bottom: 16px;">Good news! The following task has been marked as <b>COMPLETED</b>:</p>
            <div style="background: #F0FDF4; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 6px 0;"><strong>Title:</strong> ${title}</p>
                ${description ? `<p style="margin: 6px 0;"><strong>Description:</strong> ${description}</p>` : ''}
            </div>
            <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">— TaskFlow Notifications</p>
        </div>
    `

    try {
        if (resend) {
            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'TaskFlow <onboarding@resend.dev>',
                to: [toEmail],
                subject,
                html,
            })
            if (error) {
                console.error('Resend completion email error:', error)
            } else {
                console.log(`Task completion email sent via Resend to ${toEmail}:`, data?.id)
            }
        } else if (transporter) {
            await transporter.sendMail({
                from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
                to: toEmail,
                subject,
                html,
            })
            console.log(`Task completion email sent via SMTP to ${toEmail}`)
        }
    } catch (error) {
        console.error('Error sending task completion email:', error)
    }
}