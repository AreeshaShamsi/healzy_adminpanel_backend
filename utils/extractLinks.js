const markdownLinkRegex = /\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const htmlAnchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;

const isExternal = (url = "") => /^https?:\/\//i.test(url);

export const extractLinksFromMDX = (mdx = "") => {
  const links = [];

  let match;
  while ((match = markdownLinkRegex.exec(mdx)) !== null) {
    links.push(match[1]);
  }

  while ((match = htmlAnchorRegex.exec(mdx)) !== null) {
    links.push(match[1]);
  }

  const internalLinks = [];
  const externalLinks = [];

  links.forEach((href) => {
    if (isExternal(href)) {
      externalLinks.push(href);
    } else {
      internalLinks.push(href);
    }
  });

  const ruleViolations = [];
  if (internalLinks.length < 3) {
    ruleViolations.push("Minimum 3 internal links required");
  }
  if (externalLinks.length > 2) {
    ruleViolations.push("Maximum 2 external links allowed");
  }

  return {
    internalLinks,
    externalLinks,
    internalCount: internalLinks.length,
    externalCount: externalLinks.length,
    isValid: ruleViolations.length === 0,
    ruleViolations,
  };
};

export default extractLinksFromMDX;
