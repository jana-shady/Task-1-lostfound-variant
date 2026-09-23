import { Item } from "../models/Item.js";
import Joi from "joi";

const categories = [
  "electronics",
  "clothing",
  "documents",
  "accessories",
  "other",
];

const statuses = ["lost", "found", "claimed"];

// Used when creating an item.
// Title is required; the remaining fields are optional.
const createItemSchema = Joi.object({
  title: Joi.string().trim().required(),

  description: Joi.string().trim().allow(""),

  category: Joi.string().valid(...categories),

  status: Joi.string().valid(...statuses),

  location: Joi.string().trim().allow(""),

  reportedBy: Joi.string().hex().length(24),
});

// Used when updating an item.
// All fields are optional, but at least one must be provided.
const updateItemSchema = Joi.object({
  title: Joi.string().trim(),

  description: Joi.string().trim().allow(""),

  category: Joi.string().valid(...categories),

  status: Joi.string().valid(...statuses),

  location: Joi.string().trim().allow(""),

  reportedBy: Joi.string().hex().length(24),
}).min(1);


// GET /api/items
export async function getAllItems(req, res, next) {
  try {
    const filter = {};

    if (req.query.status) {
      if (!statuses.includes(req.query.status)) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.category) {
      if (!categories.includes(req.query.category)) {
        return res.status(400).json({
          message: "Invalid category",
        });
      }

      filter.category = req.query.category;
    }

    const items = await Item.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}


// GET /api/items/:id
export async function getItem(req, res, next) {
  try {
    const item = await Item.findById(req.params.id).populate(
      "reportedBy",
      "name email"
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}


// POST /api/items
export async function createItem(req, res, next) {
  try {
    const { error, value } = createItemSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const item = await Item.create(value);

    await item.populate("reportedBy", "name email");

    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}


// PATCH /api/items/:id
export async function updateItem(req, res, next) {
  try {
    const { error, value } = updateItemSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      value,
      {
        new: true,
        runValidators: true,
      }
    ).populate("reportedBy", "name email");

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}


// DELETE /api/items/:id
export async function deleteItem(req, res, next) {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    return res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}