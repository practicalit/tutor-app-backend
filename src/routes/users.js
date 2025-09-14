const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController').default
const { auth } = require('../middlewares/auth')
const { requireAdmin, adminOrOwner } = require('../middlewares/roleAuth')
const { handleValidationErrors } = require('../middlewares/validation')
const { updateProfileValidation, createUserValidation } = require('./validations/users')

//Admin only
/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', auth, requireAdmin, userController.getUsers)

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
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
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', auth, requireAdmin, createUserValidation, handleValidationErrors, userController.createUser)

// Protected routes - admin or owner (specific routes first)
/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', auth, userController.getProfile)

/**
 * @openapi
 * /users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', auth, updateProfileValidation, handleValidationErrors, userController.updateProfile)

/**
 * @openapi
 * /users/account:
 *   delete:
 *     summary: Deactivate current user account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated
 *       401:
 *         description: Unauthorized
 */
router.delete('/account', auth, userController.deleteAccount)

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (admin or self)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id', auth, adminOrOwner, userController.getUserById)

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update user by ID (admin or self)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put('/:id', auth, adminOrOwner, updateProfileValidation, handleValidationErrors, userController.updateUser)

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/:id', auth, requireAdmin, userController.deleteUser)

module.exports = router