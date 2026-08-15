const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} = require("../validators/projectValidator");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(createProjectSchema),
  createProject
);

router.get(
  "/",
  getProjects
);

router.get(
  "/:id",
  validate(projectIdSchema),
  getProjectById
);

router.put(
  "/:id",
  validate(updateProjectSchema),
  updateProject
);

router.delete(
  "/:id",
  validate(projectIdSchema),
  deleteProject
);

module.exports = router;