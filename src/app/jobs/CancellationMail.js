import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { emailData } = data;

    Mail.sendMail({
      to: `${emailData.deliveryman.name} <${emailData.deliveryman.email}>`,
      subject: '[Fastfeet] Encomenda cancelada',
      template: 'cancellation',
      context: {
        deliveryman: emailData.deliveryman.name,
        product: emailData.product,
        client: emailData.client,
        problem: emailData.problem,
        date: format(new Date(), "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new CancellationMail();
