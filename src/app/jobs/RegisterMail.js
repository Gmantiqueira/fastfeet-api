import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegisterMail {
  get key() {
    return 'RegisterMail';
  }

  async handle({ data }) {
    const { emailData } = data;

    Mail.sendMail({
      to: `${emailData.deliveryman.name} <${emailData.deliveryman.email}>`,
      subject: '[Fastfeet] Encomenda registrada',
      template: 'register',
      context: {
        deliveryman: emailData.deliveryman.name,
        client: emailData.recipient.name,
        date: format(new Date(), "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
        address: `${emailData.recipient.street}, ${emailData.recipient.number}, ${emailData.recipient.city} - ${emailData.recipient.state}, ${emailData.recipient.zip_code}`,
        product: emailData.product,
      },
    });
  }
}

export default new RegisterMail();
