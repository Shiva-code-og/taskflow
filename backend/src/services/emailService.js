// Dynamic Resend loader to prevent runtime failure if Resend is not installed or configured
let resendClient = null
const getResendClient = async () => {
    if (resendClient) return resendClient
    if (!process.env.RESEND_API_KEY) return null
    try {
        const { Resend } = await import('resend')
        resendClient = new Resend(process.env.RESEND_API_KEY)
        return resendClient
    } catch (e) {
        console.warn('[Email] Resend package not available:', e.message)
        return null
    }
}

// Dynamic Nodemailer loader for local development
let transporter = null
const getTransporter = async () => {
    if (transporter) return transporter
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null
    try {
        const nodemailer = (await import('nodemailer')).default
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        })
        return transporter
    } catch (e) {
        console.warn('[Email] Nodemailer package not available:', e.message)
        return null
    }
}

/**
 * Core sendEmail helper.
 * Priority:
 * 1. Brevo HTTPS API (BREVO_API_KEY) -> Works on Render (Port 443), sends to ANY email (300/day free)
 * 2. Resend API (RESEND_API_KEY) -> Falls back to Resend (Note: onboarding@resend.dev only allows sending to account owner)
 * 3. Nodemailer SMTP -> For local development only (blocked by Render free tier)
 */
export const sendEmail = async ({ to, subject, html }) => {
    if (!to) return

    // 1. Primary: Brevo (Sendinblue) HTTPS API
    if (process.env.BREVO_API_KEY) {
        try {
            const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER || 'samalashiva81@gmail.com'
            const senderName = process.env.BREVO_SENDER_NAME || 'TaskFlow'

            console.log(`[Email] Sending via Brevo API to ${to} from ${senderEmail}...`)

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sender: {
                        name: senderName,
                        email: senderEmail,
                    },
                    to: [
                        { email: to }
                    ],
                    subject,
                    htmlContent: html,
                }),
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                console.error(`[Email Error] Brevo API error (${response.status}):`, JSON.stringify(data))
                throw new Error(data.message || `Brevo returned status ${response.status}`)
            }

            console.log(`[Email Success] Email delivered via Brevo to ${to}. MessageId: ${data.messageId || 'ok'}`)
            return data
        } catch (error) {
            console.error('[Email Error] Failed sending via Brevo:', error.message)
            // If neither Resend nor Nodemailer is configured, return
            if (!process.env.RESEND_API_KEY && !process.env.GMAIL_USER) return
        }
    }

    // 2. Fallback: Resend API
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = await getResendClient()
            if (resend) {
                console.log(`[Email] Sending via Resend to ${to}...`)
                const { data, error } = await resend.emails.send({
                    from: process.env.RESEND_FROM || 'TaskFlow <onboarding@resend.dev>',
                    to: [to],
                    subject,
                    html,
                })
                if (error) {
                    console.error('[Email Error] Resend error:', error)
                } else {
                    console.log(`[Email Success] Email delivered via Resend to ${to}:`, data?.id)
                }
                return data
            }
        } catch (error) {
            console.error('[Email Error] Failed sending via Resend:', error.message)
        }
    }

    // 3. Fallback: Nodemailer SMTP (Local development)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        try {
            const transport = await getTransporter()
            if (transport) {
                console.log(`[Email] Sending via SMTP to ${to}...`)
                await transport.sendMail({
                    from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
                    to,
                    subject,
                    html,
                })
                console.log(`[Email Success] Email delivered via SMTP to ${to}`)
            }
        } catch (error) {
            console.error('[Email Error] Failed sending via SMTP (Note: Render blocks SMTP ports):', error.message)
        }
    }

    if (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY && (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD)) {
        console.warn('[Email Warning] No email service configured. Please set BREVO_API_KEY in environment variables.')
    }
}

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

    return sendEmail({ to: toEmail, subject, html })
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

    return sendEmail({ to: toEmail, subject, html })
}