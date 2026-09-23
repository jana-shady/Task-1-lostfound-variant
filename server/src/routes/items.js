import express from "express";

import {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const router = express.Router();

// GET /api/items
// POST /api/items
router
  .route("/")
  .get(getAllItems)
  .post(createItem);

router
  .route("/:id")
  .get(getItem)
  .patch(updateItem)
  .delete(deleteItem);

export default router;