import Blog from "../../models/Blog.js";
import calculateSEOScore from "../../utils/calculateSEOScore.js";

export const blockLowScorePublish = async (req, res, next) => {
  try {
    const requestedStatus = req.body?.status;

    if (requestedStatus !== "published") {
      return next();
    }

    const adminOverride = req.body?.admin_override === true || req.headers["x-admin-override"] === "true";
    if (adminOverride) {
      return next();
    }

    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const { score, failedChecks } = calculateSEOScore({
      ...blog.toObject(),
      ...req.body,
    });

    if (score < 60) {
      return res.status(400).json({
        success: false,
        message: "Publish blocked: SEO score below threshold",
        seo_score: score,
        failed_checks: failedChecks,
      });
    }

    req.seoScore = score;
    next();
  } catch (error) {
    next(error);
  }
};

export default blockLowScorePublish;
