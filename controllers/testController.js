import aiOrchestrator from "../services/ai/aiOrchestrator.js";

/**
 * 🚀 Main API
 */
export const generateAll = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.topic) {
      return res.status(400).json({
        success: false,
        message: "topic is required",
      });
    }

    const result = await aiOrchestrator.generateAllInOne(payload);

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};