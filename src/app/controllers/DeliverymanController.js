import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverymen = await Deliveryman.findAll({
      order: ['name'],
      attributes: ['id', 'name', 'email'],
      limit: 30,
      offset: (page - 1) * 30,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymen);
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

    const { deliverymanId } = req.params;

    const deliveryman = Deliveryman.findByPk(deliverymanId);

    const { avatar_id, email, name } = await deliveryman.update(req.body);

    return res.json({
      avatar_id,
      email,
      name,
    });
  }

  async delete(req, res) {
    const { deliverymanId } = req.params;

    const data = await Deliveryman.delete({
      where: {
        deliveryman_id: deliverymanId,
      },
    });

    return res.json(data);
  }
}

export default new DeliverymanController();