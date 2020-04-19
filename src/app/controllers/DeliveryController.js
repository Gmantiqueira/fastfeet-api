import * as Yup from 'yup';
import { Op, where, cast, col } from 'sequelize';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Recipient from '../models/Recipient';

import RegisterMail from '../jobs/RegisterMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async index(req, res) {
    const { page = 1, q = '' } = req.query;

    const deliveries = await Delivery.findAll({
      order: ['id'],
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      limit: 10,
      offset: (page - 1) * 10,
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
            'zip_code',
          ],
        },
      ],
      where: {
        [Op.or]: [
          where(cast(col('Delivery.id'), 'varchar'), {
            [Op.like]: `%${q}%`,
          }),
          {
            product: {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            '$deliveryman.name$': {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            '$recipient.name$': {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            '$recipient.city$': {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            '$recipient.state$': {
              [Op.iLike]: `%${q}%`,
            },
          },
        ],
      },
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      deliveryman_id: Yup.string().required(),
      recipient_id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { product, deliveryman_id, recipient_id } = await Delivery.create(
      req.body
    );

    const delivery = await Delivery.findOne({
      attributes: ['product'],
      where: { deliveryman_id },
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
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

    const emailData = {
      deliveryman: delivery.deliveryman,
      client: delivery.recipient.name,
      recipient: delivery.recipient,
      product: delivery.product,
    };

    Queue.add(RegisterMail.key, {
      emailData,
    });

    return res.json({
      product,
      deliveryman_id,
      recipient_id,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.string(),
      deliveryman_id: Yup.string(),
      signature_id: Yup.string(),
      product: Yup.string(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliveryId } = req.params;

    const delivery = await Delivery.findByPk(deliveryId);

    const {
      recipient_id,
      deliveryman_id,
      signature_id,
      product,
      canceled_at,
      start_date,
      end_date,
    } = await delivery.update(req.body);

    return res.json({
      recipient_id,
      deliveryman_id,
      signature_id,
      product,
      canceled_at,
      start_date,
      end_date,
    });
  }

  async delete(req, res) {
    const { deliveryId } = req.params;

    const data = await Delivery.destroy({
      where: {
        id: deliveryId,
      },
    });

    return res.json(data);
  }
}

export default new DeliveryController();
