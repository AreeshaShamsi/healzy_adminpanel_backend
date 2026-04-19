import ai from "../services/ai/aiOrchestrator.js";

/**
 * 🔵 STEP 1: Content Brief
 */
export const generateBrief = async (req, res) => {
  try {
    const {
      topic,
      primary_keyword,
      secondary_keywords,
      industry,
      word_count,
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "topic is required",
      });
    }

    const prompt = `
SYSTEM:
You are an expert content strategist for Healzy. You write SEO-optimised, fact-based content.

USER:
Generate a blog content brief.

Topic: ${topic}
Primary Keyword: ${primary_keyword}
Secondary Keywords: ${secondary_keywords}
Industry: ${industry}
Word Count: ${word_count}

Return ONLY JSON:

{
  "title_options": ["title1", "title2", "title3"],
  "outline": [
    { "h2": "section", "description": "what to write" }
  ],
  "audience_framing": "target audience explanation"
}
`;

    const data = await ai.generate({
      prompt,
      expectJSON: true,
    });

    res.json({ success: true, data });

  } catch (err) {
    console.error("❌ STEP 1 Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🟢 STEP 2: Blog Body
 */
export const generateBody = async (req, res) => {
  try {
    const {
      title,
      outline,
      topic,
      primary_keyword,
      secondary_keywords,
      industry,
      word_count,
    } = req.body;

    if (!title || !outline) {
      return res.status(400).json({
        success: false,
        message: "title and outline are required",
      });
    }

    const prompt = `
Write a complete SEO-optimised blog post.

Title: ${title}
Topic: ${topic}

Primary Keyword: ${primary_keyword}
Secondary Keywords: ${secondary_keywords}
Industry: ${industry}
Word Count: ${word_count}

STRUCTURE:
1. Introduction (150–200 words)
2. Direct Answer Block (40–60 words)
3. Follow outline exactly
4. Include table or list
5. Add internal reference
6. FAQ (6 questions)
7. Conclusion

Outline:
${JSON.stringify(outline)}

Rules:
- MDX format
- No JSON
- No markdown backticks
- Return ONLY blog content
`;

    const result = await ai.generate({
      prompt,
      expectJSON: false,
    });

    res.json({
      success: true,
      data: { blog: result },
    });

  } catch (err) {
    console.error("❌ STEP 2 Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🟡 STEP 3: SEO Metadata Extraction
 */
export const generateSEO = async (req, res) => {
  try {
    const { blog_body, primary_keyword } = req.body;

    if (!blog_body || !primary_keyword) {
      return res.status(400).json({
        success: false,
        message: "blog_body and primary_keyword are required",
      });
    }

    const prompt = `
Extract SEO metadata from this blog.

Primary keyword: ${primary_keyword}

Rules:
- meta_title: 50–60 characters, keyword in first 4 words
- meta_description: 140–155 characters, include keyword + benefit
- slug: lowercase, hyphen-separated, no stop words, max 60 chars

Return ONLY JSON:

{
  "meta_title": "",
  "meta_description": "",
  "slug": ""
}

BLOG:
${blog_body}
`;

    const data = await ai.generate({
      prompt,
      expectJSON: true,
    });

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("❌ STEP 3 Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * 🔴 STEP 4: AEO Fields (Answer Engine Optimization)
 */
export const generateAEO = async (req, res) => {
  try {
    const { blog_body, title } = req.body;

    if (!blog_body || !title) {
      return res.status(400).json({
        success: false,
        message: "blog_body and title are required",
      });
    }

    const prompt = `
From the blog content below, extract and structure the AEO fields.

Title: ${title}

aeo_answer_block rules:
- 40–60 words
- Plain language
- Directly answers the title question '${title}'
- First sentence defines the topic
- Second sentence states the primary answer
- No jargon
- No 'In this article'
- Suitable for voice search and Google featured snippet

faq_json rules:
- Extract or rephrase 6–8 questions as real Google search queries (PAA-style)
- Each answer: 40–80 words
- Direct
- First sentence answers the question fully
- No fluff

Return ONLY JSON:

{
  "aeo_answer_block": "",
  "faq_json": [
    {
      "question": "",
      "answer": ""
    }
  ]
}

BLOG CONTENT:
${blog_body}
`.trim();

    const data = await ai.generate({
      prompt,
      expectJSON: true,
    });

    // extra validation (important)
    if (
      !data?.aeo_answer_block ||
      !Array.isArray(data?.faq_json)
    ) {
      throw new Error("Invalid AEO structure from AI");
    }

    res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("❌ STEP 4 Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * 🟣 STEP 5: AIO / LLM Fields
 */
export const generateAIO = async (req, res) => {
  try {
    const { blog_body } = req.body;

    if (!blog_body) {
      return res.status(400).json({
        success: false,
        message: "blog_body is required",
      });
    }

    const prompt = `
From the blog content below, extract AIO and LLM optimisation fields.

llm_summary rules:
- 1–3 sentences
- max 300 characters
- Write as if briefing an AI assistant that might cite this article
- Include:
  - what the article covers
  - who it is for
  - key differentiator or Healzy-specific insight

entity_list rules:
- ONLY meaningful, specific entities
- Remove vague phrases
- No generic terms like "worldwide", "systems", "models"
- Prefer domain-relevant entities

internal_link_suggestions rules:
- Must be specific and SEO-focused
- Avoid generic slugs

Return ONLY JSON:

{
  "llm_summary": "",
  "entity_list": [],
  "internal_link_suggestions": []
}

BLOG CONTENT:
${blog_body}

- No markdown
- No explanation
- No text outside JSON
- Do NOT truncate response
`.trim();

    const data = await ai.generate({
      prompt,
      expectJSON: true,
    });

    // 🔒 strict validation
    if (
      !data?.llm_summary ||
      !Array.isArray(data?.entity_list) ||
      !Array.isArray(data?.internal_link_suggestions)
    ) {
      throw new Error("Invalid AIO structure from AI");
    }

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("❌ STEP 5 Error:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * 🟠 STEP 6: Schema Generation (JSON-LD)*/
export const generateSchema = async (req, res) => {
  try {
    const {
      title,
      meta_description,
      slug,
      faq_json,
      author = "Healzy Team",
      industry,
      llm_summary,
    } = req.body;

    if (!title || !meta_description || !slug || !faq_json) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const baseUrl = "https://yourdomain.com";

    /**
     * ✅ ARTICLE SCHEMA
     */
    const article_schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: meta_description,
      author: {
        "@type": "Person",
        name: author,
      },
      publisher: {
        "@type": "Organization",
        name: "Healzy",
      },
      datePublished: new Date().toISOString(),
      inLanguage: "en",
      articleSection: industry || "General",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${baseUrl}/${slug}`,
      },
    };

    /**
     * ✅ FAQ SCHEMA (FROM AEO)
     */
    const faq_schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq_json.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    /**
     * ✅ AUTHOR SCHEMA
     */
    const author_schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: author,
    };

    /**
     * ✅ OPTIONAL: LLM / AI SUMMARY (AIO SUPPORT)
     * (Not official schema, but useful internally or future-proofing)
     */
    const ai_metadata = {
      llm_summary: llm_summary || "",
    };

    return res.json({
      success: true,
      data: {
        article_schema,
        faq_schema,
        author_schema,
        ai_metadata, // optional layer
      },
    });

  } catch (err) {
    console.error("❌ STEP 6 Error:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// /**
//  * 🚀 ONE-SHOT GENERATION (NO SSE VERSION)
//  */


// /**
//  * 🔁 Helpers
//  */
// const clean = (t = "") => t.replace(/```/g, "").trim();

// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// /**
//  * 🔁 Retry with quota handling
//  */
// const generateWithRetry = async (payload, retries = 3) => {
//   for (let i = 0; i <= retries; i++) {
//     try {
//       const res = await ai.generate(payload);
//       if (res) return res;
//     } catch (err) {
//       if (err.message?.includes("QUOTA_EXHAUSTED")) {
//         console.log("⏳ Quota hit, waiting...");
//         await sleep(5000); // wait 5s before retry
//       } else {
//         console.log(`⚠️ Retry ${i + 1}`);
//       }

//       if (i === retries) throw new Error("All AI providers failed");
//     }
//   }
// };

// /**
//  * 🔧 SEO (NO AI)
//  */
// const generateSEO = (keyword) => {
//   const k = keyword.toLowerCase().trim();

//   return {
//     meta_title: `${keyword} Guide & Benefits | Healzy`.slice(0, 60),
//     meta_description: `${keyword} explained with key benefits, use cases, and insights. Learn how it works and improve results today.`.slice(
//       0,
//       155
//     ),
//     slug: k.replace(/\s+/g, "-").replace(/[^\w-]/g, "").slice(0, 60),
//   };
// };

// /**
//  * 🚀 FINAL PIPELINE (3 CALLS ONLY)
//  */
// export const generateAll = async (req, res) => {
//   try {
//     const {
//       topic,
//       primary_keyword,
//       secondary_keywords = "",
//       industry = "General",
//     } = req.body;

//     if (!topic || !primary_keyword) {
//       return res.status(400).json({
//         success: false,
//         message: "topic & primary_keyword required",
//       });
//     }

//     /**
//      * 🔵 STEP 1: BRIEF
//      */
//     const brief = await generateWithRetry({
//       prompt: `
// Generate blog content brief.

// Topic: ${topic}
// Primary Keyword: ${primary_keyword}

// Return ONLY JSON:
// {
//   "title_options": [],
//   "outline": []
// }
// `,
//       expectJSON: true,
//     });

//     const title = brief?.title_options?.[0] || topic;

//     await sleep(2000); // prevent rate limit

//     /**
//      * 🟢 STEP 2: BLOG (FULL 1200 WORDS)
//      */
//     const blogRaw = await generateWithRetry({
//       prompt: `
// Write a complete SEO-optimised blog.

// Title: ${title}
// Primary Keyword: ${primary_keyword}
// Secondary Keywords: ${secondary_keywords}
// Industry: ${industry}

// Rules:
// - 1100–1300 words
// - Include:
//   1. Introduction (150–200 words)
//   2. Direct Answer Block (40–60 words)
//   3. Main sections with ## headings
//   4. At least 1 list or table
//   5. FAQ (5–6 questions)
//   6. Conclusion with CTA
// - Use simple clean MDX format
// - DO NOT truncate
// - DO NOT return JSON

// Return ONLY blog content
// `,
//       expectJSON: false,
//     });

//     const blog = clean(blogRaw);

//     if (!blog || blog.length < 1000) {
//       throw new Error("Blog generation failed");
//     }

//     await sleep(2000); // prevent rate limit

//     /**
//      * 🟡 STEP 3: SEO (SERVER)
//      */
//     const seo = generateSEO(primary_keyword);

//     /**
//      * 🔴 STEP 4 + 🟣 STEP 5: AEO + AIO (1 CALL)
//      */
//     let aeo = { aeo_answer_block: "", faq_json: [] };
//     let aio = {
//       llm_summary: "",
//       entity_list: [],
//       internal_link_suggestions: [],
//     };

//     try {
//       const meta = await generateWithRetry({
//         prompt: `
// From the blog below extract structured data.

// Return ONLY JSON:

// {
//   "aeo": {
//     "aeo_answer_block": "",
//     "faq_json": []
//   },
//   "aio": {
//     "llm_summary": "",
//     "entity_list": [],
//     "internal_link_suggestions": []
//   }
// }

// BLOG:
// ${blog}
// `,
//         expectJSON: true,
//       });

//       if (meta?.aeo) aeo = meta.aeo;
//       if (meta?.aio) aio = meta.aio;
//     } catch (err) {
//       console.log("⚠️ AEO/AIO fallback used");
//     }

//     /**
//      * 🟠 STEP 6: SCHEMA (SERVER)
//      */
//     const baseUrl = "https://yourdomain.com";

//     const schema = {
//       article_schema: {
//         "@context": "https://schema.org",
//         "@type": "BlogPosting",
//         headline: seo.meta_title,
//         description: seo.meta_description,
//         author: {
//           "@type": "Person",
//           name: "Healzy Team",
//         },
//         publisher: {
//           "@type": "Organization",
//           name: "Healzy",
//           logo: {
//             "@type": "ImageObject",
//             url: `${baseUrl}/logo.png`,
//           },
//         },
//         datePublished: new Date().toISOString(),
//         dateModified: new Date().toISOString(),
//         mainEntityOfPage: {
//           "@type": "WebPage",
//           "@id": `${baseUrl}/${seo.slug}`,
//         },
//         inLanguage: "en",
//       },

//       faq_schema: {
//         "@context": "https://schema.org",
//         "@type": "FAQPage",
//         mainEntity: (aeo.faq_json || []).map((f) => ({
//           "@type": "Question",
//           name: f.question,
//           acceptedAnswer: {
//             "@type": "Answer",
//             text: f.answer,
//           },
//         })),
//       },
//     };

//     /**
//      * ✅ FINAL RESPONSE
//      */
//     return res.json({
//       success: true,
//       data: {
//         brief,
//         blog,
//         seo,
//         aeo,
//         aio,
//         schema,
//       },
//     });
//   } catch (err) {
//     console.error("❌ PIPELINE ERROR:", err.message);

//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };