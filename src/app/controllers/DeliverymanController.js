import * as Yup from 'yup';
import Sequelize from 'sequelize';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const { id } = req.params;

    if (id) {
      const deliverymen = await Deliveryman.findOne({
        attributes: ['id', 'name', 'email', 'created_at'],
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['name', 'path', 'url'],
          },
        ],
        where: {
          id,
        },
      });

      if (!deliverymen) {
        return res.json({
          error: "Deliveryman doesn't exists. Verify your ID, please.",
        });
      }

      return res.json(deliverymen);
    }

    const { Op, where, cast, col } = Sequelize;
    const { page = 1, q = '' } = req.query;

    const deliverymen = await Deliveryman.findAll({
      order: ['id'],
      attributes: ['id', 'name', 'email'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
      where: {
        [Op.or]: [
          where(cast(col('Deliveryman.id'), 'varchar'), {
            [Op.like]: `%${q}%`,
          }),
          {
            name: {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            email: {
              [Op.iLike]: `%${q}%`,
            },
          },
        ],
      },
    });

    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      avatar_id: Yup.string(),
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { avatar_id, name, email } = await Deliveryman.create(req.body);

    return res.json({
      avatar_id,
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

    const deliveryman = await Deliveryman.findByPk(deliverymanId);

    const { avatar_id, email, name } = await deliveryman.update(req.body);

    return res.json({
      avatar_id,
      email,
      name,
    });
  }

  async delete(req, res) {
    const { deliverymanId } = req.params;

    const data = await Deliveryman.destroy({
      where: {
        id: deliverymanId,
      },
    });

    return res.json(data);
  }
}

export default new DeliverymanController();
