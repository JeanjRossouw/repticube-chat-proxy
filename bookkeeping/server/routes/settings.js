import { Router } from 'express';
import db from '../db.js';
import { optionalEmail, optionalText } from '../validate.js';

const router = Router();

router.get('/', (req, res) => {
  const row = db
    .prepare('SELECT company_name, company_address, company_email FROM settings WHERE id = 1')
    .get();
  res.json(row ?? { company_name: '', company_address: '', company_email: '' });
});

router.put('/', (req, res) => {
  const values = {
    company_name: optionalText(req.body.company_name, 'Company name', 120) ?? '',
    company_address: optionalText(req.body.company_address, 'Company address', 400) ?? '',
    company_email: optionalEmail(req.body.company_email, 'Company email') ?? '',
  };

  db.prepare(
    `UPDATE settings
     SET company_name = @company_name, company_address = @company_address, company_email = @company_email
     WHERE id = 1`
  ).run(values);
  res.json(values);
});

export default router;
