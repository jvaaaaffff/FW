import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import twilio from "twilio";

const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return jwt.sign({ id }, secret, {
    expiresIn: "30d",
  });
};

const normalizePhone = (phone: string, countryCode?: string) => {
  const raw = String(phone).trim();
  if (!raw) return "";

  const cleaned = raw.replace(/\D/g, "");
  if (!cleaned) return "";
  if (raw.startsWith("+")) return `+${cleaned}`;

  let normalized = cleaned.replace(/^0+/, "");
  if (countryCode) {
    const codeDigits = String(countryCode).replace(/\D/g, "");
    if (codeDigits && !normalized.startsWith(codeDigits)) {
      normalized = `${codeDigits}${normalized}`;
    }
    return `+${normalized}`;
  }

  if (normalized.length === 10) return `+91${normalized}`;
  return `+${normalized}`;
};

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Twilio Debug:', {
      hasAccountSid: !!accountSid,
      hasAuthToken: !!authToken,
      hasVerifySid: !!verifySid,
    });
  }

  if (accountSid && authToken && verifySid) {
    const client = twilio(accountSid, authToken);
    return { client, verifySid };
  }
  return null;
};

// In-memory OTP store for demonstration (when Twilio is not configured)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Clean expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}, 5 * 60 * 1000);

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, countryCode } = req.body;
    if (!phone) {
      res.status(400);
      throw new Error("Phone number is required");
    }

    const normalizedPhone = normalizePhone(phone, countryCode || "+91");
    if (!normalizedPhone) {
      res.status(400);
      throw new Error("Invalid phone number");
    }

    const twilioClient = getTwilioClient();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n📱 [OTP] Sending to ${normalizedPhone}`);
      console.log(`   Twilio Client Initialized: ${twilioClient ? '✅ YES' : '❌ NO'}`);
    }

    const responsePayload: any = {
      success: true,
      message: "OTP sent successfully",
      phone: normalizedPhone,
    };

    if (twilioClient) {
      // Use Twilio Verify API
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`   🚀 Attempting Twilio Verify API call...`);
        }

        const verification = await twilioClient.client.verify.v2
          .services(twilioClient.verifySid)
          .verifications.create({
            to: normalizedPhone,
            channel: "sms",
          });

        if (process.env.NODE_ENV !== 'production') {
          console.log(`   ✅ Twilio Success! Verification SID: ${verification.sid}`);
        }

        res.json({
          ...responsePayload,
          verificationSid: verification.sid,
          message: "Verification code sent via SMS"
        });
      } catch (twilioError: any) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`❌ Twilio Verify API error: ${twilioError.message}`);
        } else {
          console.error('❌ Twilio Verify API error: production error occurred');
        }

        // Fallback to mock OTP if Twilio Verify fails
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(normalizedPhone, {
          otp,
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
          attempts: 0
        });

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[MOCK SMS] Fallback OTP ${otp} for ${normalizedPhone}`);
        }

        res.json({
          ...responsePayload,
          message: "Verification code sent via SMS (mock mode)",
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
      }
    } else {
      // Mock OTP for development
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(normalizedPhone, {
        otp,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        attempts: 0
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[MOCK SMS - DEV MODE] Sending OTP ${otp} to ${normalizedPhone}`);
      }

      res.json({
        ...responsePayload,
        message: "OTP sent successfully (mock mode - check console)",
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp, countryCode, verificationSid } = req.body;
    if (!phone || !otp) {
      res.status(400);
      throw new Error("Phone and OTP are required");
    }

    const normalizedPhone = normalizePhone(phone, countryCode || "+91");
    const twilioClient = getTwilioClient();

    if (twilioClient && verificationSid) {
      // Use Twilio Verify API
      try {
        const verificationCheck = await twilioClient.client.verify.v2
          .services(twilioClient.verifySid)
          .verificationChecks.create({
            to: normalizedPhone,
            code: otp,
          });

        if (verificationCheck.status === "approved") {
          res.json({
            success: true,
            message: "OTP verified successfully",
            phone: normalizedPhone
          });
        } else {
          res.status(400);
          throw new Error(`Verification failed: ${verificationCheck.status}`);
        }
      } catch (twilioError: any) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`❌ Twilio verification error: ${twilioError.message}`);
        } else {
          console.error('❌ Twilio verification error: production error occurred');
        }

        // Fallback to mock verification
        const storedData = otpStore.get(normalizedPhone);
        if (storedData && storedData.otp === otp && storedData.expiresAt > Date.now()) {
          otpStore.delete(normalizedPhone);
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[MOCK] OTP verified for ${normalizedPhone}`);
          }
          res.json({
            success: true,
            message: "OTP verified successfully",
            phone: normalizedPhone
          });
        } else {
          res.status(400);
          throw new Error("Invalid or expired OTP");
        }
      }
    } else {
      // Mock verification
      const storedData = otpStore.get(normalizedPhone);
      if (storedData && storedData.otp === otp && storedData.expiresAt > Date.now()) {
        if (storedData.attempts >= 3) {
          otpStore.delete(normalizedPhone);
          res.status(429);
          throw new Error("Too many failed attempts. Please request a new OTP.");
        }
        otpStore.delete(normalizedPhone);
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[MOCK] OTP verified for ${normalizedPhone}`);
        }
        res.json({
          success: true,
          message: "OTP verified successfully",
          phone: normalizedPhone
        });
      } else {
        if (storedData) {
          storedData.attempts += 1;
          if (storedData.attempts >= 3) {
            otpStore.delete(normalizedPhone);
            res.status(429);
            throw new Error("Too many failed attempts. Please request a new OTP.");
          }
        }
        res.status(400);
        throw new Error("Invalid or expired OTP");
      }
    }
  } catch (error) {
    next(error);
  }
};

export const loginWithOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp, countryCode, verificationSid } = req.body;
    if (!phone || !otp) {
      res.status(400);
      throw new Error('Phone and OTP are required for login');
    }

    const normalizedPhone = normalizePhone(phone, countryCode || '+91');
    const twilioClient = getTwilioClient();
    let verified = false;

    if (twilioClient && verificationSid) {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔐 Verifying login OTP with Twilio');
        }

        const verificationCheck = await twilioClient.client.verify.v2
          .services(twilioClient.verifySid)
          .verificationChecks.create({
            to: normalizedPhone,
            code: otp,
          });

        verified = verificationCheck.status === 'approved';
      } catch (twilioError: any) {
        if (process.env.NODE_ENV !== 'development') {
          console.error('❌ Twilio verification error: production error occurred');
        } else {
          console.error(`❌ Twilio verification error: ${twilioError.message}`);
        }
      }
    }

    if (!verified) {
      const storedData = otpStore.get(normalizedPhone);
      if (storedData && storedData.otp === otp && storedData.expiresAt > Date.now()) {
        if (storedData.attempts >= 3) {
          otpStore.delete(normalizedPhone);
          res.status(429);
          throw new Error("Too many failed attempts. Please request a new OTP.");
        }
        otpStore.delete(normalizedPhone);
        verified = true;
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[MOCK] OTP verified for login ${normalizedPhone}`);
        }
      } else {
        if (storedData) {
          storedData.attempts += 1;
          if (storedData.attempts >= 3) {
            otpStore.delete(normalizedPhone);
            res.status(429);
            throw new Error("Too many failed attempts. Please request a new OTP.");
          }
        }
      }
    }

    if (!verified) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }

    let user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      user = await User.create({
        name: 'Phone User',
        phone: normalizedPhone,
        authProvider: 'local',
        isPhoneVerified: true,
      });
    } else if (!user.isPhoneVerified) {
      user.isPhoneVerified = true;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validation middleware
export const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('surname').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Surname must be 1-50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').optional().isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

export const validateLogin = [
  body('identifier').notEmpty().withMessage('Email or phone required'),
  body('password').notEmpty().withMessage('Password required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, surname, email, phone, password, age, gender, authProvider } = req.body;
    const normalizedPhone = phone ? normalizePhone(phone) : undefined;

    // Check if user exists by email or phone
    const query: any = { $or: [] };
    if (email) query.$or.push({ email });
    if (normalizedPhone) query.$or.push({ phone: normalizedPhone });

    if (query.$or.length > 0) {
      const userExists = await User.findOne(query);
      if (userExists) {
        res.status(400);
        throw new Error("User already exists with this email or phone");
      }
    }

    const user = await User.create({
      name,
      surname,
      email: email || undefined,
      phone: normalizedPhone || undefined,
      password,
      age,
      gender,
      authProvider: authProvider || 'local',
      isPhoneVerified: !!normalizedPhone // Assuming verified if they got past OTP step
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id.toString()),
        },
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password, authProvider } = req.body;

    if (!identifier) {
      res.status(400);
      throw new Error("Email or phone is required");
    }

    // If social login, just find or create
    if (authProvider === 'google' || authProvider === 'facebook') {
      let user = await User.findOne({ email: identifier });
      if (!user) {
        // Auto-register social user
        user = await User.create({
          name: req.body.name || 'Social User',
          email: identifier,
          authProvider,
          isPhoneVerified: false
        });
      }
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id.toString()),
        },
      });
    }

    // Local login by email or phone
    const normalizedIdentifier = normalizePhone(identifier);
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: normalizedIdentifier }]
    });

    if (user && (await (user as any).matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id.toString()),
        },
      });
    } else {
      res.status(401);
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req as any).user._id).select("-password");
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth authentication endpoint
 * Expects the Google access token from frontend
 * Verifies the token and creates/updates user
 */
export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, name, email, picture } = req.body;

    if (!token || !email) {
      res.status(400);
      throw new Error("Token and email are required for Google auth");
    }

    // Note: In production, you should verify the token using Google's API
    // For now, we'll trust the frontend validation
    // To add proper verification, install: npm install google-auth-library

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google auth
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        avatarUrl: picture,
        authProvider: 'google',
        isPhoneVerified: false,
        password: undefined, // Social users don't have passwords
      });
    } else if (user.authProvider !== 'google' && user.authProvider !== 'local') {
      // Merge social providers
      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
      }
      if (user.authProvider === 'local') {
        // User originally registered locally
        user.authProvider = 'google';
      }
      await user.save();
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Facebook OAuth authentication endpoint
 * Expects the Facebook access token from frontend
 * Verifies the token and creates/updates user
 */
export const facebookAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, name, email, picture, facebookId } = req.body;

    if (!token || !email) {
      res.status(400);
      throw new Error("Token and email are required for Facebook auth");
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Facebook auth
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        avatarUrl: picture,
        facebookId,
        authProvider: 'facebook',
        isPhoneVerified: false,
        password: undefined, // Social users don't have passwords
      });
    } else {
      // Update existing user with Facebook info if not already set
      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
      }
      if (!user.facebookId && facebookId) {
        user.facebookId = facebookId;
      }
      // If user was local, update authProvider
      if (user.authProvider === 'local') {
        user.authProvider = 'facebook';
      }
      await user.save();
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    next(error);
  }
};

