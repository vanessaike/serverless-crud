export function throwError(message, status) {
  const error = new Error(message);
  error.statusCode = status;
  throw error;
}

export function errorHandling(error, next) {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  next(error);
}
