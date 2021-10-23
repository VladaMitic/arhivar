const express = require('express');
const paperController = require('../controllers/paperController');
const authController = require('../controllers/authController');
const setCurrentYear = require('../utils/setCurrentYear');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use(authController.restrictTo('user', 'admin'));

// router
//   .route('/paper-number/:categoryId')
//   .get(paperController.getPapersNumForCategory);

router
  .route('/paper-number/:categoryId')
  .get(
    authController.setUserIdToQuery,
    setCurrentYear.setCurrentYear,
    paperController.aliasGetPapersNumForCategory,
    paperController.getAllPaper
  );

router.route('/recSendData').get(paperController.getRecipientsSenders);

router
  .route('/countAllPapers')
  .get(authController.setUserIdToQuery, paperController.countAllPapers);

router
  .route('/countCurrentYearPapers')
  .get(
    authController.setUserIdToQuery,
    setCurrentYear.setCurrentYear,
    paperController.countAllPapers
  );

router
  .route('/currentYearPapers')
  .get(
    authController.setUserIdToQuery,
    setCurrentYear.setCurrentYear,
    paperController.getAllPaper
  );

router
  .route('/getNotArhivedPapers')
  .get(
    authController.setUserIdToQuery,
    paperController.setPreparingOnNotarhived,
    paperController.aliasNotArhived,
    paperController.getAllPaper
  );

router
  .route('/countNotArhivedPapers')
  .get(
    authController.setUserIdToQuery,
    paperController.setPreparingOnNotarhived,
    paperController.aliasNotArhived,
    paperController.countAllPapers
  );

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
