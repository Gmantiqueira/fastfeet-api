import * as Yup from 'yup';

import Problem from '../models/Problem';
import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class ProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const problems = await Problem.findAll({
      attributes: ['id', 'delivery_id', 'description'],
      limit: 10,
      offset: (page - 1) * 10,
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
    const { problemId } = req.params;

    const problem = await Problem.findByPk(problemId);

    if (!problem) {
      return res
        .status(400)
        .json({ error: 'Não há problemas com essa entrega!' });
    }

    const delivery = await Delivery.findOne({
      attributes: ['product', 'canceled_at'],
      where: { id: problem.delivery_id },
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
      ],
    });

    const emailData = {
      deliveryman: delivery.deliveryman,
      product: delivery.product,
      client: delivery.recipient.name,
      problem: problem.description,
    };

    await Delivery.update(
      { canceled_at: new Date() },
      { returning: true, where: { id: problem.delivery_id } }
    );

    Queue.add(CancellationMail.key, {
      emailData,
    });

    return res.json(delivery);
  }
}

export default new ProblemController();
