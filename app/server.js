import express from "express";
import expressValidation from 'express-validation';

import path from 'path';
import { fileURLToPath } from 'url';

import routes from "./server/routes/index.js";
import { bridgeAddress } from "./server/utils.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.set('trust proxy', true)

const port = process.env["PORT"] || 3000;

app.get("/", function(_req, res) {
  res.sendFile("index.html");
});

app.use("/", routes);

app.use((err, req, res, _next) => {
  if (err instanceof expressValidation.ValidationError) {
    res.status(err.statusCode).json(err);
  } else {
    res.status(500).json({
      status: 500,
      message: err
    });
  }
});

app.listen(port, async function() {
  console.log(`Server listening on ${port}`);

  console.log(
    "Bridge Archethic's address",
    bridgeAddress
  );
});
