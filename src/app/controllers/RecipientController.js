import * as Yup from 'yup';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const recipients = await Recipient.findAll({
      order: ['name'],
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
      limit: 30,
      offset: (page - 1) * 30,
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
      country: Yup.string().required(),
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
      country,
      zip_code,
    } = await Recipient.create(req.body);

    return res.json({
      name,
      street,
      number,
      adjunct,
      city,
      state,
      country,
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
      country: Yup.string(),
      zip_code: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.findByPk(req.recipientId);

    const {
      name,
      street,
      number,
      adjunct,
      city,
      state,
      country,
      zip_code,
    } = await recipient.update(req.body);

    return res.json({
      name,
      street,
      number,
      adjunct,
      city,
      state,
      country,
      zip_code,
    });
  }

  async delete(req, res) {
    const recipient = await Recipient.findByPk(req.recipientId);

    const data = await recipient.delete(req.body);

    return res.json(data);
  }
}

export default new RecipientController();
