/** Checks if the request body contains the required fields */
export default function requireQuery(fields) {
  return (req, res, next) => {
    if (!req.query) return res.status(400).send("Request query is required.");

    const missing = fields.filter((field) => !(field in req.query));
    if (missing.length > 0)
      return res.status(400).send(`Missing query fields: ${missing.join(", ")}`);

    next();
  };
}
