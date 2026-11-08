import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const generateSmartTitleRpc = defineRpc({
  name: "smart-title.generate",
  input: z.object({
    agentId: z.string().min(1),
  }),
  output: z.object({
    title: z.string().min(1),
  }),
});
