class CustomError {
  constructor(statusCode, message){
    Object.assign(this, {statusCode, message});
  }
}

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError){
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err.name === "BadRequest"){
    return res.status(400).json({message: err.message});
  }
  if (err.name === "Unauthorized"){
    return res.status(401).json({message: err.message});
  }
  if (err.name === "Forbidden"){
    return res.status(403).json({message: err.message});
  }
  if (err.name === "NotFound"){
    return res.status(404).json({message: err.message});
  }
  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
};

module.exports = { CustomError, errorHandler };