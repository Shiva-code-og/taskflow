import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS instead of implicit TLS
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    }
})

export const sendTaskCreatedEmail = async (toEmail, taskData) => {
    if (!toEmail) return
    const title = typeof taskData === 'string' ? taskData : taskData.title;
    const description = typeof taskData === 'string' ? '' : (taskData.description || '');
    const priority = typeof taskData === 'string' ? '' : (taskData.priority || '');
    try {
        await transporter.sendMail({
            from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
            to: toEmail,
            subject: `New Task: ${title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">📋 New Task Assigned</h2>
                    <p>A new task has been created and assigned to you:</p>
                    <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><b>Title:</b> ${title}</p>
                        ${description ? `<p style="margin: 4px 0;"><b>Description:</b> ${description}</p>` : ''}
                        ${priority ? `<p style="margin: 4px 0;"><b>Priority:</b> ${priority}</p>` : ''}
                    </div>
                    <p style="color: #6B7280; font-size: 12px;">— TaskFlow Notifications</p>
                </div>
            `,
        })
        console.log(`Task creation email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending task creation email:', error);
    }
}

export const sendTaskCompletedEmail = async (toEmail, taskData) => {
    if (!toEmail) return;
    const title = typeof taskData === 'string' ? taskData : taskData.title;
    const description = typeof taskData === 'string' ? '' : (taskData.description || '');
    try {
        await transporter.sendMail({
            from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
            to: toEmail,
            subject: `✅ Task Completed: ${title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16A34A;">✅ Task Completed</h2>
                    <p>Good news! The following task has been marked as <b>COMPLETED</b>:</p>
                    <div style="background: #F0FDF4; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><b>Title:</b> ${title}</p>
                        ${description ? `<p style="margin: 4px 0;"><b>Description:</b> ${description}</p>` : ''}
                    </div>
                    <p style="color: #6B7280; font-size: 12px;">— TaskFlow Notifications</p>
                </div>
            `,
        });
        console.log(`Task completion email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending task completion email:', error);
    }
};