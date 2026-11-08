import type { PluginClientContext } from "@getpaseo/plugin/client";
import { generateSmartTitleRpc } from "./shared/smart-title";

type AgentTarget = {
  id: string;
  workspaceId?: string;
  archivedAt?: string | null;
  internal?: boolean;
  status: "initializing" | "idle" | "running" | "error" | "closed";
};

export default function contribute(client: PluginClientContext) {
  const pills = new Map<
    string,
    {
      workspaceId: string;
      remove(): void;
    }
  >();
  let disposed = false;
  let stopAgentUpdates: (() => void) | undefined;
  let releaseDirectory: (() => Promise<void>) | undefined;

  async function renameAgent(agentId: string) {
    await client.rpc(generateSmartTitleRpc, { agentId });
  }

  function removePill(agentId: string) {
    pills.get(agentId)?.remove();
    pills.delete(agentId);
  }

  function syncPill(agent: AgentTarget) {
    const workspaceId = agent.workspaceId;
    if (
      !workspaceId ||
      agent.archivedAt ||
      agent.internal ||
      agent.status === "closed"
    ) {
      removePill(agent.id);
      return;
    }

    const current = pills.get(agent.id);
    if (current?.workspaceId === workspaceId) return;
    current?.remove();

    const registration = client.addComposerPill({
      id: "smart-title",
      workspaceId,
      agentId: agent.id,
      button: {
        title: "根据会话上下文生成更贴切的标题",
        label: "智能标题",
        icon: "Sparkles",
        behavior: {
          kind: "action",
          onPress: () => renameAgent(agent.id),
        },
      },
    });

    pills.set(agent.id, {
      workspaceId,
      remove: () => registration.remove(),
    });
  }

  const removeCommand = client.addCommandCenterItem({
    id: "generate-smart-title",
    title: "智能更新会话标题",
    icon: "Sparkles",
    keywords: ["title", "rename", "标题", "重命名"],
    context: "agent",
    onSelect({ agent }) {
      return renameAgent(agent.id);
    },
  });

  void (async () => {
    const listing = await client.paseo.agents.list({ subscribe: {} });
    if (disposed) {
      await listing.subscription.release();
      return;
    }

    releaseDirectory = () => listing.subscription.release();
    for (const entry of listing.entries) syncPill(entry.agent);

    stopAgentUpdates = client.paseo.agents.subscribe((update) => {
      if (update.kind === "upsert") syncPill(update.agent);
      else removePill(update.agentId);
    });
  })().catch((error) => {
    console.error("[paseo-smart-title] Failed to watch agents", error);
  });

  return () => {
    disposed = true;
    removeCommand();
    stopAgentUpdates?.();
    for (const pill of pills.values()) pill.remove();
    pills.clear();
    void releaseDirectory?.().catch((error) => {
      console.error("[paseo-smart-title] Failed to release agent directory", error);
    });
  };
}
