import * as Yup from 'yup';

import Problem from '../models/Problem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Recipient from '../models/Recipient';

class ProblemController {
  async index(req, res) {
    const { deliveryId } = req.params;

    const problems = await Problem.findAll({
      where: { delivery_id: deliveryId, canceled_at: null },
      order: ['date'],
      attributes: ['description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: [
            'id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['name', 'path', 'url'],
                },
              ],
            },
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
        },
      ],
    });

    return res.json(problems);
  }

  async store(req, res) {
    const { deliveryId } = req.params;

    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { description } = req.body;

    await Problem.create({
      delivery_id: deliveryId,
      description,
    });

    return res.json({
      deliveryId,
      description,
    });
  }

  async cancel(req, res) {
    const { deliveryId } = req.params;

    const problemExists = await Problem.findOne({
      where: { delivery_id: deliveryId },
    });

    if (!problemExists) {
      return res
        .status(400)
        .json({ error: 'There is no problem with this delivery' });
    }

    const delivery = await Delivery.findByPk(deliveryId);

    await delivery.update({ canceled_at: new Date() });

    return res.json(delivery);
  }
}

export default new ProblemController();
