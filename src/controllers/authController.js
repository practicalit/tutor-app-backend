const authService = require('../services/authService')

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body)
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: { user, token }
    })
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({ success: false, message: error.message })
    }
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    })
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message })
  }
}

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.body.token)
    res.status(200).json({ success: true, message: 'Email verified successfully' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email)
    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body)
    res.status(200).json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user, req.body)
    res.status(200).json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

const resendVerification = async (req, res, next) => {
  try {
    await authService.resendVerification(req.user)
    res.status(200).json({ success: true, message: 'Verification email sent successfully' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user, req.token)
    res.status(200).json({ success: true, message: 'Logout successful' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerification
}