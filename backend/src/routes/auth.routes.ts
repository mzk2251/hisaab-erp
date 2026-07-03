import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  companyCode: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, companyCode } = loginSchema.parse(req.body);

    const company = await prisma.company.findUnique({ where: { code: companyCode } });
    if (!company) {
      res.status(401).json({ error: 'Invalid company code' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { email, companyId: company.id, isActive: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET ?? 'dev-secret';
    const token = jwt.sign(
      { userId: user.id, companyId: company.id, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      company: { id: company.id, name: company.name, code: company.code },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, companyId: true },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
