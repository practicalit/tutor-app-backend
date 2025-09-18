import db from '../database/models/index.js'
const { User } = db

export const getProfile = (user) => user

export const updateProfile = async (user, data) => {
  await user.update({
    firstName: data.firstName || user.firstName,
    lastName: data.lastName || user.lastName
  })
  return user
}

export const deactivateAccount = async (user) => {
  await user.update({ isActive: false })
}

export const getUsers = async (page, limit) => {
  const offset = (page - 1) * limit
  return await User.findAndCountAll({
    where: { isActive: true },
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  })
}

export const createUser = async (data) => {
  const existingUser = await User.findByEmail(data.email)
  if (existingUser) throw new Error('User with this email already exists')
  return await User.create({
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'user'
  })
}

export const getUserById = async (id) => {
  const user = await User.findByPk(id)
  if (!user || !user.isActive) throw new Error('User not found')
  return user
}

export const updateUser = async (id, data, currentUser) => {
  const user = await User.findByPk(id)
  if (!user || !user.isActive) throw new Error('User not found')
  const updateData = {
    firstName: data.firstName || user.firstName,
    lastName: data.lastName || user.lastName
  }
  if (data.role && currentUser.role === 'admin') updateData.role = data.role
  await user.update(updateData)
  return user
}

export const deleteUser = async (id, currentUser) => {
  const user = await User.findByPk(id)
  if (!user || !user.isActive) throw new Error('User not found')
  if (user.id === currentUser.id) throw new Error('Cannot delete your own account')
  await user.update({ isActive: false })
}