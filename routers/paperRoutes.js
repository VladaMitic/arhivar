const express = require('express');
const paperController = require('../controllers/paperController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use(authController.restrictTo('user', 'admin'));

router
  .route('/paper-number/:categoryId')
  .get(paperController.getPapersNumForCategory);

router.route('/recSendData').get(paperController.getRecipientsSenders);

router
  .route('/currentYearPapers')
  .get(
    paperController.aliasCurentYearPapers,
    authController.setUserIdToQuery,
    paperController.getAllPaper
  );

router
  .route('/getNotArhivedPapers')
  .get(
    paperController.aliasNotArhived,
    authController.setUserIdToQuery,
    paperController.getAllPaper
  );

// router
//   .route('/prepareForArhive')
//   .post(authController.setUserIdToBody, paperController.test);

router
  .route('/prepareForArhive')
  .post(
    authController.setUserIdToBody,
    paperController.setPreparingOnSelectedPapers,
    paperController.createArhiveTemplate
  );

router
  .route('/')
  .get(authController.setUserIdToQuery, paperController.getAllPaper)
  .post(authController.setUserIdToBody, paperController.createPaper);

router
  .route('/:id')
  .get(paperController.getPaper)
  .delete(paperController.deletePaper)
  .patch(paperController.updatePaper);

module.exports = router;
