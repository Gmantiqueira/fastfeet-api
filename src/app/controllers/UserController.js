import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    return res.json({ msg: 'default' });
  }
}

export default new UserController();
