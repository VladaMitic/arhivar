exports.setCurrentYear = (req, res, next) => {
  const yearNow = new Date(Date.now()).getFullYear();
  req.query.createdAt = { gte: new Date(`${yearNow}-01-01`) };
  next();
};
