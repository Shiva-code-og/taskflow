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
    await transporter.sendMail({
        from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: `New Task: ${taskTitle}`,
        html: `<p>A new task <b>"${taskTitle}"</b> has been created and assigned to you.</p>`,
    })
}

export const sendTaskCompletedEmail = async (toEmail, taskTitle) => {
    if (!toEmail) return;
    await transporter.sendMail({
        from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: `✅ Task Completed: ${taskTitle}`,
        html: `<p>Good news! The task <b>"${taskTitle}"</b> has been marked as <b>COMPLETED</b>.</p>`,
    });
};