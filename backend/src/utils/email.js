const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { getVerificationEmailTemplate, getPasswordResetEmailTemplate } = require('./emailTemplates');

class EmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });
  }

  async createTransporter() {
    try {
      const accessToken = await this.oauth2Client.getAccessToken();

      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken.token
        }
      });
    } catch (error) {
      console.error('Error creating transporter:', error);
      throw error;
    }
  }

  async sendVerificationEmail(user, verificationUrl) {
    try {
      const transporter = await this.createTransporter();

      const mailOptions = {
        from: `"Auth Service" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Подтверждение email адреса',
        html: getVerificationEmailTemplate(user.name, verificationUrl)
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(user, resetUrl) {
    try {
      const transporter = await this.createTransporter();

      const mailOptions = {
        from: `"Auth Service" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Сброс пароля',
        html: getPasswordResetEmailTemplate(user.name, resetUrl)
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async verifyConnection() {
    try {
      const transporter = await this.createTransporter();
      await transporter.verify();
      console.log('SMTP connection is ready');
      return true;
    } catch (error) {
      console.error('SMTP connection error:', error);
      return false;
    }
  }
}

module.exports = new EmailService(); 