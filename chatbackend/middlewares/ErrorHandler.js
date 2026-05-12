class CustomError {
  constructor(statusCode, message){
    Object.assign(this, { statusCode, message });
  }
}

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError){
    res.status(err.statusCode).json(err.message);
    return;
  }
  console.error(err);
  res.sendStatus(500);
  return;
};

module.exports = { CustomError, errorHandler };
