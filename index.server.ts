import type { PluginServerContext } from "@getpaseo/plugin/server";
import { generateSmartTitle } from "./server/smart-title";
import { generateSmartTitleRpc } from "./shared/smart-title";

export default function contribute(server: PluginServerContext) {
  server.handle(generateSmartTitleRpc, generateSmartTitle);
  return () => {};
}
