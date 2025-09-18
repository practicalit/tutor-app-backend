const db = require('../database/models').default
const { Op } = require('sequelize')
const tokenGenerator = require('../helpers/tokenGenerator')
const { sendVerificationEmail, sendPasswordResetEmail } = require('../helpers/emailService')
const jwt = require('jsonwebtoken')

const { User, BlacklistedToken } = db
const { generateJWT, generateEmailVerificationToken, generatePasswordResetToken } = tokenGenerator

exports.register = async ({ email, password, firstName, lastName }) => {
  const existingUser = await User.findByEmail(email)
  if (existingUser) throw new Error('User with this email already exists')

  const emailVerificationToken = generateEmailVerificationToken()
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    emailVerificationToken,
    emailVerificationExpires
  })

  try {
    await sendVerificationEmail(user, emailVerificationToken)
  } catch (e) {
    // Log but don't fail registration
    console.error('Error sending verification email:', e)
  }

  const token = generateJWT({ id: user.id })
  return { user, token }
}

exports.login = async ({ email, password }) => {
  const user = await User.findByEmail(email)
  if (!user || !user.isActive) throw new Error('Invalid credentials')

  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) throw new Error('Invalid credentials')

  await user.update({ lastLoginAt: new Date() })
  const token = generateJWT({ id: user.id })
  return { user, token }
}

exports.verifyEmail = async (token) => {
  const user = await User.findOne({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { [Op.gt]: new Date() }
    }
  })
  if (!user) throw new Error('Invalid or expired verification token')

  await user.update({
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null
  })
}

exports.forgotPassword = async (email) => {
  const user = await User.findByEmail(email)
  if (!user || !user.isActive) return // Always return success for security

  const resetToken = generatePasswordResetToken()
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000)

  await user.update({
    passwordResetToken: resetToken,
    passwordResetExpires: resetExpires
  })

  await sendPasswordResetEmail(user, resetToken)
}

exports.resetPassword = async ({ token, password }) => {
  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { [Op.gt]: new Date() }
    }
  })
  if (!user) throw new Error('Invalid or expired reset token')

  await user.update({
    password,
    passwordResetToken: null,
    passwordResetExpires: null
  })
}

exports.changePassword = async (user, { currentPassword, newPassword }) => {
  const isCurrentPasswordValid = await user.comparePassword(currentPassword)
  if (!isCurrentPasswordValid) throw new Error('Current password is incorrect')

  await user.update({ password: newPassword })
}

exports.resendVerification = async (user) => {
  if (user.isEmailVerified) throw new Error('Email is already verified')

  const emailVerificationToken = generateEmailVerificationToken()
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await user.update({
    emailVerificationToken,
    emailVerificationExpires
  })

  await sendVerificationEmail(user, emailVerificationToken)
}

exports.logout = async (user, token) => {
  if (!token) throw new Error('No token provided')
  const decoded = jwt.decode(token)
  const expiresAt = new Date(decoded.exp * 1000)
  await BlacklistedToken.create({
    token,
    userId: user.id,
    expiresAt,
    reason: 'logout'
  })
}