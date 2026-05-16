// src/lib/models/Page.ts
import mongoose from "mongoose";

const ComponentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // "Hero", "Menu", "Text", etc.
  props: { type: mongoose.Schema.Types.Mixed, default: {} },
  order: { type: Number, default: 0 },
});

const PageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // "/about", "/menu"
    title: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    components: [ComponentSchema],
    settings: {
      headerVisible: { type: Boolean, default: true },
      footerVisible: { type: Boolean, default: true },
      backgroundColor: { type: String, default: "#000000" },
    },
  },
  { timestamps: true }
);

export const Page = mongoose.models.Page || mongoose.model("Page", PageSchema);
