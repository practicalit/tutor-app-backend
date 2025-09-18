import * as userService from '../services/userService.js'

const getProfile = async (req, res, next) => {
  try {
    const user = userService.getProfile(req.user)
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    })
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user, req.body)
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    })
  } catch (error) {
    next(error)
  }
}

const deleteAccount = async (req, res, next) => {
  try {
    await userService.deactivateAccount(req.user)
    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    })
  } catch (error) {
    next(error)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const { count, rows: users } = await userService.getUsers(page, limit)
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          hasNext: page * limit < count,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    })
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ success: false, message: error.message })
    }
    next(error)
  }
}

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id)
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    })
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message })
    }
    next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user)
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    })
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message })
    }
    next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user)
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message })
    }
    if (error.message === 'Cannot delete your own account') {
      return res.status(400).json({ success: false, message: error.message })
    }
    next(error)
  }
}

export default {
  getProfile,
  updateProfile,
  deleteAccount,
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
}