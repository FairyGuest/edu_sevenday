// Replaced with an empty route table in static demo builds.
const { modelAnswer } = require("../server/assistant-model.cjs");
export default {
  "POST /api/assistant/model": async (req: any, res: any) => {
    res.json({ code: 200, data: await modelAnswer(req.body || {}) });
  },
};
