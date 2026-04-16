import mongoose from "mongoose";

const countWords = (str = "") => {
  const text = str.trim();
  return text ? text.split(/\s+/).length : 0;
};

const hasOnlyOneH1 = (content) => {
  if (!content) return false;
  const markdownH1 = (content.match(/^# .+/gm) || []).length;
  const htmlH1 = (content.match(/<h1[^>]*>.*?<\/h1>/gi) || []).length;
  return markdownH1 + htmlH1 === 1;
};

const versionSchema = new mongoose.Schema(
  {
    content_mdx: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [50, "Title must be at least 50 characters"],
      maxlength: [65, "Title cannot exceed 65 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      maxlength: [60, "Slug cannot exceed 60 characters"],
      match: [
        /^[a-z0-9-]+$/,
        "Slug must be lowercase, hyphen-separated, and contain only letters and numbers",
      ],
    },
    meta_title: {
      type: String,
      required: true,
      minlength: [50, "Meta title must be at least 50 characters"],
      maxlength: [60, "Meta title cannot exceed 60 characters"],
      validate: {
        validator(v) {
          return v.endsWith("| Healzy");
        },
        message: "Meta title must end with '| Healzy'",
      },
    },
    meta_description: {
      type: String,
      required: true,
      minlength: [140, "Meta description must be at least 140 characters"],
      maxlength: [155, "Meta description cannot exceed 155 characters"],
    },
    primary_keyword: {
      type: String,
      trim: true,
    },
    secondary_keywords: {
      type: [String],
      default: [],
    },
    content_mdx: {
      type: String,
      required: true,
      validate: [
        {
          validator(v) {
            return countWords(v) >= 1200;
          },
          message: "Content must contain at least 1200 words",
        },
        {
          validator(v) {
            return hasOnlyOneH1(v);
          },
          message: "Content must contain exactly one H1 tag (either '# ' or '<h1>')",
        },
      ],
    },
    aeo_answer_block: {
      type: String,
      required: true,
      validate: {
        validator(v) {
          const words = countWords(v);
          return words >= 40 && words <= 60;
        },
        message: "AEO answer block must be between 40 and 60 words",
      },
    },
    faq_json: {
      type: [
        {
          question: { type: String, required: true },
          answer: {
            type: String,
            required: true,
            validate: {
              validator(v) {
                const words = countWords(v);
                return words >= 40 && words <= 80;
              },
              message: "FAQ answer must be between 40 and 80 words",
            },
          },
        },
      ],
      validate: [
        {
          validator(v) {
            return v && v.length >= 4;
          },
          message: "FAQ must contain at least 4 items",
        },
      ],
    },
    llm_summary: {
      type: String,
      required: true,
      maxlength: [300, "LLM summary cannot exceed 300 characters"],
      validate: {
        validator(v) {
          const sentences = v.split(/[.!?]+/).filter(Boolean);
          return sentences.length >= 1 && sentences.length <= 3;
        },
        message: "LLM summary must be between 1 and 3 sentences",
      },
    },
    entities: {
      type: [String],
      default: [],
    },
    ai_provider_used: {
      type: String,
      default: "",
      trim: true,
    },
    versions: {
      type: [versionSchema],
      default: [],
    },
    reading_time: {
      type: Number,
      min: [0, "Reading time cannot be negative"],
      default: 0,
    },
    cover_image_url: {
      type: String,
      required: [true, "Cover image URL is required"],
    },
    cover_image_alt: {
      type: String,
      required: true,
      maxlength: [125, "Cover image alt text cannot exceed 125 characters"],
      validate: {
        validator(v) {
          return !/img of|image of|picture of/i.test(v);
        },
        message: "Alt text should not contain phrases like 'image of', 'img of', etc.",
      },
    },
    internal_links: {
      type: [String],
      validate: [
        {
          validator(v) {
            return v && v.length >= 3;
          },
          message: "Must contain at least 3 internal links",
        },
      ],
    },
    external_links: {
      type: [
        {
          url: { type: String, required: true },
          rel: {
            type: String,
            required: true,
            match: [
              /(?:^|\s)(nofollow|noreferrer|noopener|sponsored)(?:\s|$)/i,
              "Must include rel attribute like 'nofollow' or 'noopener'",
            ],
          },
        },
      ],
      validate: [
        {
          validator(v) {
            return v && v.length <= 2;
          },
          message: "Maximum 2 external links are allowed",
        },
      ],
    },
    status: {
      type: String,
      enum: ["draft", "autosaved", "published"],
      default: "draft",
    },
    published_at: {
      type: Date,
      validate: {
        validator() {
          if (this.status === "published" && !this.published_at) {
            return false;
          }
          return true;
        },
        message: "Published date is required when status is published",
      },
    },
  },
  { timestamps: true }
);

blogSchema.pre("save", function preSave(next) {
  if (this.content_mdx) {
    this.reading_time = Math.max(1, Math.ceil(countWords(this.content_mdx) / 200));
  }

  if (this.status === "published" && !this.published_at) {
    this.published_at = new Date();
  }

  next();
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
