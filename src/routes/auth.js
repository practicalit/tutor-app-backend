const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const { auth } = require('../middlewares/auth')
const { handleValidationErrors } = require('../middlewares/validation')
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  changePasswordValidation
} = require('./validations/auth')

//Public routes
/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', registerValidation, handleValidationErrors, authController.register)

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with email/password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: JWT tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 refreshToken: { type: string }
 *       401:
 *         description: Invalid credentials
 */ 
router.post('/login', loginValidation, handleValidationErrors, authController.login)

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired token
 */
router.post('/verify-email', verifyEmailValidation, handleValidationErrors, authController.verifyEmail)

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Password reset email sent (always 200 for security)
 */
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, authController.forgotPassword)

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, authController.resetPassword)

//Protedcted routes
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user (invalidate token)
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', auth, authController.logout)

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Change password (authenticated)
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/change-password', auth, changePasswordValidation, handleValidationErrors, authController.changePassword)

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent
 *       401:
 *         description: Unauthorized
 */
router.post('/resend-verification', auth, authController.resendVerification)

module.exports = router