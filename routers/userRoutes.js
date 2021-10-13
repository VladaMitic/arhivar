const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const processorRouter = require('./processorRoutes');
const categoryRouter = require('./categoryRoutes');
const paperRouter = require('./paperRoutes');
// const setCurrentYear = require('../utils/setCurrentYear');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/countAllUsers').get(userController.countAllUser);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.subscribeUser, userController.updateUser)
  .delete(userController.deleteUser);

router.use('/:userId/processor', processorRouter);
router.use('/:userId/category', categoryRouter);
router.use('/:userId/paper', paperRouter);

module.exports = router;
