const getVerificationEmailTemplate = (name, verificationUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Подтверждение email адреса</h2>
      <p>Здравствуйте, ${name}!</p>
      <p>Спасибо за регистрацию. Для подтверждения вашего email адреса, пожалуйста, нажмите на кнопку ниже:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #4CAF50; 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 4px;
                  display: inline-block;">
          Подтвердить Email
        </a>
      </div>
      <p>Или скопируйте и вставьте следующую ссылку в ваш браузер:</p>
      <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
      <p>Ссылка действительна в течение 24 часов.</p>
      <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
    </div>
  `;
};

const getPasswordResetEmailTemplate = (name, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Сброс пароля</h2>
      <p>Здравствуйте, ${name}!</p>
      <p>Вы запросили сброс пароля. Для создания нового пароля, пожалуйста, нажмите на кнопку ниже:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4CAF50; 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 4px;
                  display: inline-block;">
          Сбросить Пароль
        </a>
      </div>
      <p>Или скопируйте и вставьте следующую ссылку в ваш браузер:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p>Ссылка действительна в течение 10 минут.</p>
      <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
    </div>
  `;
};

module.exports = {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate
}; 