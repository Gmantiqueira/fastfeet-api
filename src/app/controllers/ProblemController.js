import * as Yup from 'yup';

import Problem from '../models/Problem';
import Delivery from '../models/Delivery';

class ProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const problems = await Problem.findAll({
      order: ['delivery_id'],
      attributes: ['delivery_id', 'description'],
      limit: 30,
      offset: (page - 1) * 30,
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
