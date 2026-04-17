import aiOrchestrator from "../../services/ai/aiOrchestrator.js";

export const generateAll = async (req, res, next) => {
  try {
    const {
      topic,
      primary_keyword,
      secondary_keywords = [],
      industry,
      word_count = 1200,
      provider,
    } = req.body;

    if (!topic || !primary_keyword || !industry) {
      return res.status(400).json({
        success: false,
        message: "topic, primary_keyword and industry are required",
      });
    }

    const content = await aiOrchestrator.generateContent({
      topic,
      primary_keyword,
      secondary_keywords,
      industry,
      word_count,
      provider,
    });

    const seo = await aiOrchestrator.generateSEO({
      topic,
      primary_keyword,
      blog_body: content.content_mdx,
      provider,
    });

    const aeo = await aiOrchestrator.generateAEO({
      topic,
      blog_body: content.content_mdx,
      provider,
    });

    const aio = await aiOrchestrator.generateAIO({
      blog_body: content.content_mdx,
      provider,
    });

    return res.status(200).json({
      success: true,
      data: {
        content_mdx: content.content_mdx,
        meta_title: seo.meta_title,
        meta_description: seo.meta_description,
        slug: seo.slug,
        aeo_answer_block: aeo.aeo_answer_block,
        faq_json: aeo.faq_json,
        llm_summary: aio.llm_summary,
        entities: aio.entities,
        ai_provider_used:
          aio.providerUsed ||
          aeo.providerUsed ||
          seo.providerUsed ||
          content.providerUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};

const FIELD_GENERATORS = {
  meta_title: async ({ blog_body, context, provider }) => {
    const seo = await aiOrchestrator.generateSEO({
      topic: context?.topic || "",
      primary_keyword: context?.primary_keyword || "",
      blog_body,
      provider,
    });
    return { meta_title: seo.meta_title };
  },
  meta_description: async ({ blog_body, context, provider }) => {
    const seo = await aiOrchestrator.generateSEO({
      topic: context?.topic || "",
      primary_keyword: context?.primary_keyword || "",
      blog_body,
      provider,
    });
    return { meta_description: seo.meta_description };
  },
  slug: async ({ blog_body, context, provider }) => {
    const seo = await aiOrchestrator.generateSEO({
      topic: context?.topic || "",
      primary_keyword: context?.primary_keyword || "",
      blog_body,
      provider,
    });
    return { slug: seo.slug };
  },
  aeo_answer_block: async ({ blog_body, context, provider }) => {
    const aeo = await aiOrchestrator.generateAEO({
      topic: context?.topic || "",
      blog_body,
      provider,
    });
    return { aeo_answer_block: aeo.aeo_answer_block };
  },
  faq_json: async ({ blog_body, context, provider }) => {
    const aeo = await aiOrchestrator.generateAEO({
      topic: context?.topic || "",
      blog_body,
      provider,
    });
    return { faq_json: aeo.faq_json };
  },
  llm_summary: async ({ blog_body, provider }) => {
    const aio = await aiOrchestrator.generateAIO({ blog_body, provider });
    return { llm_summary: aio.llm_summary };
  },
  entities: async ({ blog_body, provider }) => {
    const aio = await aiOrchestrator.generateAIO({ blog_body, provider });
    return { entities: aio.entities };
  },
  content_mdx: async ({ context, provider }) => {
    const content = await aiOrchestrator.generateContent({
      topic: context?.topic || "",
      primary_keyword: context?.primary_keyword || "",
      secondary_keywords: context?.secondary_keywords || [],
      industry: context?.industry || "",
      word_count: context?.word_count || 1200,
      provider,
    });
    return { content_mdx: content.content_mdx };
  },
};

export const regenerateField = async (req, res, next) => {
  try {
    const { field_name, blog_body, context = {}, provider } = req.body;

    if (!field_name || !FIELD_GENERATORS[field_name]) {
      return res.status(400).json({
        success: false,
        message: "Unsupported field_name",
      });
    }

    const fieldData = await FIELD_GENERATORS[field_name]({
      blog_body,
      context,
      provider,
    });

    res.status(200).json({
      success: true,
      field_name,
      data: fieldData,
    });
  } catch (error) {
    next(error);
  }
};
