const express = require('express');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use(authController.restrictTo('user', 'admin'));

router
  .route('/activeCategory')
  .get(
    categoryController.aliasActiveCategory,
    authController.setUserIdToQuery,
    categoryController.aliasSortByBaseNumber,
    categoryController.getAllCategory
  );

router
  .route('/')
  .get(
    authController.setUserIdToQuery,
    categoryController.aliasSortByBaseNumber,
    categoryController.getAllCategory
  )
  .post(authController.setUserIdToBody, categoryController.createCategory);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .delete(categoryController.deleteCategory)
  .patch(categoryController.updateCategory);

module.exports = router;
