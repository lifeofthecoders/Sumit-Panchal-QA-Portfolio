let dbConnected = false;

export const setDatabaseConnected = (status) => {
  dbConnected = Boolean(status);
};

export const requireDatabase = (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      ok: false,
      message: "Database unavailable. Please try again later.",
    });
  }

  next();
};
