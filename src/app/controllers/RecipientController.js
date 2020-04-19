import * as Yup from 'yup';
import Sequelize from 'sequelize';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { Op, where, cast, col } = Sequelize;
    const { page = 1, q = '' } = req.query;

    const recipients = await Recipient.findAll({
      order: ['id'],
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
      limit: 10,
      offset: (page - 1) * 10,
      where: {
        [Op.or]: [
          where(cast(col('Recipient.id'), 'varchar'), {
            [Op.like]: `%${q}%`,
          }),
          {
            name: {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            street: {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            number: {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            city: {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            state: {
              [Op.like]: `%${q}%`,
            },
          },
        ],
      },
    });

    return res.json(recipients);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      name,
      street,
      number,
      adjunct,
      city,
      state,
      zip_code,
    } = await Recipient.create(req.body);

    return res.json({
      name,
      street,
      number,
      adjunct,
      city,
      state,
      zip_code,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      zip_code: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipientId } = req.params;
    const recipient = await Recipient.findByPk(recipientId);

    const {
      name,
      street,
      number,
      adjunct,
      city,
      state,
      zip_code,
    } = await recipient.update(req.body);

    return res.json({
      name,
      street,
      number,
      adjunct,
      city,
      state,
      zip_code,
    });
  }

  async delete(req, res) {
    const { recipientId } = req.params;

    const data = await Recipient.destroy({
      where: {
        id: recipientId,
      },
    });

    return res.json(data);
  }
}

export default new RecipientController();
