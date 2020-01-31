import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const recipients = await Deliveryman.findAll({
      order: ['name'],
      attributes: ['id', 'name', 'avatar_id', 'email'],
      limit: 30,
      offset: (page - 1) * 30,
    });

    return res.json(recipients);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { name, email } = await Deliveryman.create(req.body);

    return res.json({
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      avatar_id: Yup.string(),
      email: Yup.string().email(),
      name: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { avatar_id, email, name } = await Deliveryman.update(req.body);

    return res.json({
      avatar_id,
      email,
      name,
    });
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.recipientId);

    const data = await deliveryman.update(req.body);

    return res.json(data);
  }
}

export default new DeliverymanController();
