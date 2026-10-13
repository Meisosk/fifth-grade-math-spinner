// Local API server for `npm run dev`. On Netlify, netlify/functions/names.mjs serves the same routes.
import express from "express";
import cors from "cors";
import { getNames, putNames } from "./names.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/names/:user", async (req, res) => {
  const { status, body } = await getNames(req.params.user);
  res.status(status).json(body);
});

app.put("/api/names/:user", async (req, res) => {
  const { status, body } = await putNames(req.params.user, req.body);
  res.status(status).json(body);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Spinner API listening on :${port}`));
