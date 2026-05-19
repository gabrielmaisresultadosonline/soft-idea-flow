import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "suporte@unidoctelemedicina.com.br",
    pass: "29041997Ga@@",
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: '"UniDoc Telemedicina" <suporte@unidoctelemedicina.com.br>',
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export const clientEmailTemplate = (name: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #0ea5e9;">Recebemos seu agendamento!</h2>
  </div>
  <p>Olá <strong>${name}</strong>,</p>
  <p>Obrigado por escolher a <strong>UniDoc Telemedicina</strong>.</p>
  <p>Este e-mail é para confirmar que recebemos sua solicitação de agendamento com sucesso em nosso sistema.</p>
  <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0; color: #0369a1;"><strong>Próximos passos:</strong></p>
    <p style="margin: 5px 0 0 0;">Nossa equipe administrativa entrará em contato com você via WhatsApp ou E-mail em breve para confirmar o horário exato e fornecer as instruções para sua teleconsulta.</p>
  </div>
  <p>Se você tiver alguma dúvida urgente, pode nos contatar respondendo a este e-mail.</p>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; text-align: center;">UniDoc Telemedicina - Cuidado humanizado onde você estiver.</p>
</div>
`;

export const adminEmailTemplate = (data: { name: string, email: string, whatsapp: string, time: string }) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #0ea5e9;">Novo Agendamento Recebido!</h2>
  </div>
  <p>Olá, você tem um novo agendamento aguardando atendimento no painel administrativo.</p>
  
  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
    <p style="margin: 5px 0;"><strong>Paciente:</strong> ${data.name}</p>
    <p style="margin: 5px 0;"><strong>E-mail:</strong> ${data.email}</p>
    <p style="margin: 5px 0;"><strong>WhatsApp:</strong> ${data.whatsapp}</p>
    <p style="margin: 5px 0;"><strong>Data/Hora Desejada:</strong> ${new Date(data.time).toLocaleString('pt-BR')}</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <a href="https://unidoctelemedicina.com.br/admin" style="background-color: #0ea5e9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Acessar Painel Administrativo</a>
  </div>
  
  <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">Este é um aviso automático do sistema UniDoc.</p>
</div>
`;
