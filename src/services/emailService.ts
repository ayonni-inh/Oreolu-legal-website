export async function sendEmailNotification(to: string, subject: string, html: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || data.error || 'Failed to send email');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error calling email API:', error.message || error);
    return { success: false, error: error.message || error };
  }
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to OROELU GODWIN AGIDI & CO",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #001F3F; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">Welcome, ${name}!</h1>
        <p>Thank you for registering with <strong>OROELU GODWIN AGIDI & CO</strong>. Your account has been successfully created.</p>
        <p>You can now access our secure client portal to:</p>
        <ul>
          <li>Track your case status</li>
          <li>Upload and manage legal documents</li>
          <li>Schedule appointments</li>
          <li>Communicate directly with our legal team</li>
        </ul>
        <div style="margin-top: 30px; padding: 20px; bg-color: #f9f9f9; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: #666;">If you have any questions, please reply to this email or contact us through the portal.</p>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">&copy; ${new Date().getFullYear()} OROELU GODWIN AGIDI & CO. All rights reserved.</p>
      </div>
    `
  }),
  bookingConfirmation: (name: string, service: string, date: string, time: string) => ({
    subject: "Appointment Confirmation - OROELU GODWIN AGIDI & CO",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #001F3F; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">Appointment Confirmed</h1>
        <p>Hello ${name},</p>
        <p>Your appointment for <strong>${service}</strong> has been successfully scheduled.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
        </div>
        <p>You can view and manage your appointments in the client portal.</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">&copy; ${new Date().getFullYear()} OROELU GODWIN AGIDI & CO. All rights reserved.</p>
      </div>
    `
  })
};
