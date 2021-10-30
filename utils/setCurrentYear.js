exports.setCurrentYear = (req, res, next) => {
  const yearNow = new Date(Date.now()).getFullYear();
  req.query.createdAtYear = yearNow.toString();
  next();
};
