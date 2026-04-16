import Blog from "../../models/Blog.js";
import { estimateReadingTime } from "../../utils/text.js";
import extractLinksFromMDX from "../../utils/extractLinks.js";

export const buildVersion = (content_mdx) => ({
  content_mdx,
  timestamp: new Date(),
});

export const applyLinkExtraction = (content_mdx) => {
  const links = extractLinksFromMDX(content_mdx || "");

  return {
    internal_links: links.internalLinks,
    external_links: links.externalLinks.map((url) => ({ url, rel: "nofollow noopener noreferrer" })),
    linkValidation: {
      internalCount: links.internalCount,
      externalCount: links.externalCount,
      isValid: links.isValid,
      violations: links.ruleViolations,
    },
  };
};

export const autosaveBlogContent = async (id, content_mdx) => {
  const blog = await Blog.findById(id);
  if (!blog) {
    const error = new Error("Blog not found");
    error.statusCode = 404;
    throw error;
  }

  const version = buildVersion(content_mdx || blog.content_mdx);
  const versions = [...(blog.versions || []), version].slice(-10);
  const linkFields = applyLinkExtraction(content_mdx || blog.content_mdx);

  blog.content_mdx = content_mdx || blog.content_mdx;
  blog.versions = versions;
  blog.reading_time = estimateReadingTime(blog.content_mdx);
  blog.status = "autosaved";
  blog.internal_links = linkFields.internal_links;
  blog.external_links = linkFields.external_links;

  await blog.save();

  return {
    blog,
    linkValidation: linkFields.linkValidation,
  };
};
