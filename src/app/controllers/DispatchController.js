import { getHours, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Problem from '../models/Problem';
import Recipient from '../models/Recipient';

class OrderController {
  async start(req, res) {
    const { deliveryId } = req.params;
    const { deliverymanId } = req.body;

    if (getHours(new Date()) < 8 || getHours(new Date()) >= 18) {
      return res.json({
        error: 'The withdrawal date must be between 8am and 6pm',
      });
    }

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: deliverymanId,
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
      },
    });

    if (deliveries.length >= 5) {
      return res
        .status(400)
        .json({ error: 'You can do only 5 withdrawal per day.' });
    }

    const delivery = await Delivery.findByPk(deliveryId);

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
            'zip_code',
          ],
        },
      ],
    });

    return res.json(deliveries);
  }

  async deliveryProblem(req, res) {
    const { deliveryId } = req.params;
    const { page = 1 } = req.query;

    const problems = await Problem.findAll({
      attributes: ['created_at', 'description'],
      limit: 30,
      offset: (page - 1) * 30,
      where: {
        delivery_id: deliveryId,
      },
    });

    return res.json(problems);
  }

  async end(req, res) {
    const { deliveryId } = req.params;
    const { signatureId } = req.body;

    const delivery = await Delivery.findByPk(deliveryId);

    await delivery.update({
      signature_id: signatureId,
      end_date: new Date(),
    });

    return res.json(delivery);
  }
}

export default new OrderController();
