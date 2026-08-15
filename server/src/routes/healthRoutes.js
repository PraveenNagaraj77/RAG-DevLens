const express = require("express");

const {
  healthCheck,
  readinessCheck,
} = require("../controllers/healthController");

const router = express.Router();

router.get("/", healthCheck);

router.get("/ready", readinessCheck);

module.exports = router;