import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken, setTokenCookie, clearTokenCookie } from '../middlewares/auth.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email already exists.',
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'customer',
      addresses: [],
      wishlist: [],
      isActive: true,
    });

    const token = signToken(user);
    setTokenCookie(res, token);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(201).json({
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    const token = signToken(user);
    setTokenCookie(res, token);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  clearTokenCookie(res);
  res.json({
    message: 'Logged out successfully',
  });
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate('wishlist', 'title slug price images stock ratingAvg');

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
        },
      });
    }

    res.json({
      user,
    });
  } catch (err) {
    next(err);
  }
}
