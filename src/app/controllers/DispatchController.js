import { getHours } from 'date-fns';

import Delivery from '../models/Delivery';
import File from '../models/File';
import Recipient from '../models/Recipient';

class OrderController {
  async start(req, res) {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findByPk(deliveryId);

    if (getHours(new Date()) < 8 || getHours(new Date()) >= 18) {
      return res
        .status(400)
        .json({ error: 'The withdrawal date must be between 8am and 6pm' });
    }

    await delivery.update({ start_date: new Date() });

    return res.json(delivery);
  }

  async pending(req, res) {
    const { deliverymanId } = req.params;

    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: deliverymanId,
        canceled_at: null,
      },
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      limit: 30,
      offset: (page - 1) * 30,
      order: ['created_at'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'adjunct',
            'city',
            'state',
            'country',
            'zip_code',
          ],
        },
      ],
    });

    return res.json(deliveries);
  }

  async end(req, res) {
    const { deliveryId } = req.params;
    const { signature_id } = req.body;

    const delivery = await Delivery.findByPk(deliveryId);

    await delivery.update({
      signature_id,
      end_date: new Date(),
    });

    return res.json(delivery);
  }
}

export default new OrderController();
