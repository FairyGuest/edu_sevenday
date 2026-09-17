import { assistantConversation } from "./teacher/assistantEngine";
export default {
  "POST /api/assistant/chat": (req: any, res: any) => {
    try { res.json({ code: 200, data: assistantConversation(req.body || {}) }); }
    catch (e: any) { res.json({ code: 400, msg: e.message }); }
  },
};
