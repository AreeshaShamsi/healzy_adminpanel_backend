import Blog from "../models/Blog.js";
import { applyLinkExtraction, autosaveBlogContent, buildVersion } from "../services/blog/blogLifecycle.service.js";
import { estimateReadingTime } from "../utils/text.js";
import calculateSEOScore from "../utils/calculateSEOScore.js";

export const createBlog = async (req, res, next) => {
  try {
    const blogData = {
      ...req.body,
    };

    if (req.file) {
      blogData.cover_image_url = req.file.path;
    }

    if (blogData.content_mdx) {
      const linkFields = applyLinkExtraction(blogData.content_mdx);
      blogData.internal_links = linkFields.internal_links;
      blogData.external_links = linkFields.external_links;
      blogData.reading_time = estimateReadingTime(blogData.content_mdx);
      blogData.versions = [buildVersion(blogData.content_mdx)];
    }

    const blog = await Blog.create(blogData);

    res.status(201).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate("author_id", "name photo");

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate("author_id", "name photo shortBio");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (updateData.slug) {
      delete updateData.slug;
    }

    if (req.file) {
      updateData.cover_image_url = req.file.path;
    }

    if (updateData.content_mdx) {
      const linkFields = applyLinkExtraction(updateData.content_mdx);
      updateData.internal_links = linkFields.internal_links;
      updateData.external_links = linkFields.external_links;
      updateData.reading_time = estimateReadingTime(updateData.content_mdx);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

export const autosaveBlog = async (req, res, next) => {
  try {
    const { content_mdx } = req.body;
    if (!content_mdx) {
      return res.status(400).json({
        success: false,
        message: "content_mdx is required",
      });
    }

    const { blog, linkValidation } = await autosaveBlogContent(req.params.id, content_mdx);

    res.status(200).json({
      success: true,
      status: "autosaved",
      link_validation: linkValidation,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const getSeoScore = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const result = calculateSEOScore(blog.toObject());
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
