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
    const subject = `📋 New Task Assigned: ${title}`
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Task Assigned</title>
        </head>
        <body style="margin: 0; padding: 24px; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="background-color: #FFFFFF; padding: 28px 28px 16px 28px; border-bottom: 2px solid #4F46E5;">
                    <div style="display: inline-block; padding: 6px 12px; background-color: #EEF2FF; color: #4F46E5; font-size: 12px; font-weight: 700; border-radius: 6px; letter-spacing: 0.5px; text-transform: uppercase;">
                        TaskFlow • New Assignment
                    </div>
                    <h1 style="margin: 16px 0 6px 0; font-size: 22px; font-weight: 700; color: #0F172A;">
                        ${title}
                    </h1>
                    <p style="margin: 0; font-size: 14px; color: #64748B;">
                        A new task has been assigned to you.
                    </p>
                </div>

                <div style="padding: 24px 28px; background-color: #FFFFFF;">
                    ${description ? `
                    <div style="margin-bottom: 20px;">
                        <span style="font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Description</span>
                        <p style="margin: 6px 0 0 0; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap; background-color: #FFFFFF; padding: 12px 14px; border: 1px solid #E2E8F0; border-radius: 8px;">${description}</p>
                    </div>
                    ` : ''}

                    <div style="display: flex; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F1F5F9;">
                        ${priority ? `
                        <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 8px; display: inline-block;">
                            <span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase;">Priority: </span>
                            <span style="font-size: 13px; font-weight: 700; color: #4F46E5; text-transform: capitalize;">${priority}</span>
                        </div>
                        ` : ''}
                        <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 8px; display: inline-block; margin-left: 8px;">
                            <span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase;">Status: </span>
                            <span style="font-size: 13px; font-weight: 700; color: #F59E0B;">Pending</span>
                        </div>
                    </div>
                </div>

                <div style="padding: 16px 28px; background-color: #FFFFFF; border-top: 1px solid #F1F5F9; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94A3B8;">
                        This is an automated notification from TaskFlow. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Task Completed</title>
        </head>
        <body style="margin: 0; padding: 24px; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="background-color: #FFFFFF; padding: 28px 28px 16px 28px; border-bottom: 2px solid #10B981;">
                    <div style="display: inline-block; padding: 6px 12px; background-color: #ECFDF5; color: #059669; font-size: 12px; font-weight: 700; border-radius: 6px; letter-spacing: 0.5px; text-transform: uppercase;">
                        TaskFlow • Task Completed
                    </div>
                    <h1 style="margin: 16px 0 6px 0; font-size: 22px; font-weight: 700; color: #0F172A;">
                        ${title}
                    </h1>
                    <p style="margin: 0; font-size: 14px; color: #64748B;">
                        This task has been marked as <b>COMPLETED</b>.
                    </p>
                </div>

                <div style="padding: 24px 28px; background-color: #FFFFFF;">
                    ${description ? `
                    <div style="margin-bottom: 20px;">
                        <span style="font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Task Details</span>
                        <p style="margin: 6px 0 0 0; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap; background-color: #FFFFFF; padding: 12px 14px; border: 1px solid #E2E8F0; border-radius: 8px;">${description}</p>
                    </div>
                    ` : ''}

                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #F1F5F9;">
                        <div style="background-color: #FFFFFF; border: 1px solid #A7F3D0; padding: 10px 14px; border-radius: 8px; display: inline-block;">
                            <span style="font-size: 11px; font-weight: 600; color: #059669; text-transform: uppercase;">Status: </span>
                            <span style="font-size: 13px; font-weight: 700; color: #059669;">✅ Completed</span>
                        </div>
                    </div>
                </div>

                <div style="padding: 16px 28px; background-color: #FFFFFF; border-top: 1px solid #F1F5F9; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94A3B8;">
                        This is an automated notification from TaskFlow. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
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