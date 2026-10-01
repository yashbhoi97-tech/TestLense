import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'trustlense_fallback_secret_39281';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export async function register(req, res, next) {
  try {
    const validated = registerSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: validated.error.errors[0]?.message || 'Invalid registration data',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const { name, email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'An account with this email already exists',
          code: 'EMAIL_ALREADY_EXISTS'
        }
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    const token = generateToken(user._id);

    await logAuditEvent({
      userId: user._id,
      action: 'USER_REGISTER',
      req
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validated = loginSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid email or password format',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const { email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    const token = generateToken(user._id);

    await logAuditEvent({
      userId: user._id,
      action: 'USER_LOGIN',
      req
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          createdAt: req.user.createdAt
        }
      }
    });
  } catch (err) {
    next(err);
  }
}
