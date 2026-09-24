import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    }
})

export const sendTaskCreatedEmail = async (toEmail, taskTitle) => {
    if (!toEmail) return
    try {
        await transporter.sendMail({
            from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
            to: toEmail,
            subject: `New Task: ${taskTitle}`,
            html: `<p>A new task <b>"${taskTitle}"</b> has been created and assigned to you.</p>`,
        })
        console.log(`Task creation email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending task creation email:', error);
    }
}

export const sendTaskCompletedEmail = async (toEmail, taskTitle) => {
    if (!toEmail) return;
    try {
        await transporter.sendMail({
            from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
            to: toEmail,
            subject: `✅ Task Completed: ${taskTitle}`,
            html: `<p>Good news! The task <b>"${taskTitle}"</b> has been marked as <b>COMPLETED</b>.</p>`,
        });
        console.log(`Task completion email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending task completion email:', error);
    }
};