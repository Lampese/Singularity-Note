"use client";

import { useRouter } from "next/navigation";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { DialogBase } from "@/components/ui/DialogBase";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import { ThemeModeSwitch } from "@/components/ui/ThemeModeSwitch";
import { useAccountInfo } from "@/hooks/useAccountInfo";
import type { UserPreferences } from "@/lib/api/account";
import {
  formatDailyFileParseLimit,
  getSubscriptionPlan,
  getSubscriptionPlanLabel,
} from "@/lib/billing/catalog";
import {
  normalizeSendShortcutPreference,
  SEND_SHORTCUT_LABELS,
} from "@/lib/userPreferences";
import { cn } from "@/lib/utils";

export interface AccountInfoDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  workspaceCount: number;
  conversationCount: number;
  onOpenSubscription: () => void;
}

export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onReplayTour?: () => void;
}

function formatBytes(bytes: number): string {
  const MB = 1024 * 1024;
  const GB = 1024 * MB;

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < GB) return `${(bytes / MB).toFixed(bytes % MB === 0 ? 0 : 1)} MB`;
  return `${(bytes / GB).toFixed(bytes % GB === 0 ? 0 : 1)} GB`;
}

function formatBytesParts(bytes: number): { value: string; unit: string } {
  const [value, unit = ""] = formatBytes(bytes).split(" ");
  return { value, unit };
}

function storagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

function progressColor(pct: number): string {
  if (pct < 60) return "bg-success";
  if (pct < 85) return "bg-warning";
  return "bg-error";
}

function progressTrackGradient(pct: number): string {
  if (pct < 60) return "bg-success/12";
  if (pct < 85) return "bg-warning/12";
  return "bg-error/12";
}

const USAGE_BAR_TRACK_CLASS = "h-1.5 overflow-hidden rounded-full";

export function AccountInfoDialog({
  open,
  onClose,
  email,
  workspaceCount,
  conversationCount,
  onOpenSubscription,
}: AccountInfoDialogProps) {
  const { data: account, loading } = useAccountInfo();
  const initial = email.split("@")[0]?.[0]?.toUpperCase() || "?";
  const pct = account ? storagePercent(account.storage_used_bytes, account.storage_limit_bytes) : 0;
  const plan = account ? getSubscriptionPlan(account.plan.name) : null;
  const currentPlanLabel = account ? planLabel(account.plan.name) : "加载中...";
  const currentPlanBadge = (plan?.id ?? account?.plan.name ?? "free").toUpperCase();
  const storageLimitParts = account ? formatBytesParts(account.plan.storage_bytes_limit) : null;

  return (
    <DialogBase
      open={open}
      title="账户信息"
      onClose={onClose}
      panelClassName="max-w-md p-0"
      panelStyle={{ paddingBlock: "0px", paddingInline: "0px" }}
      panelContent={(
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto pt-14">
          <AccountIdentityHeader
            email={email}
            initial={initial}
            secondaryLabel={currentPlanLabel}
          />

          <div className="mx-6 mt-4 rounded-[22px] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-panel))] px-5 py-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/20">
                <span className="text-xs font-bold text-accent">
                  {currentPlanBadge.slice(0, 1)}
                </span>
              </div>
              <span className="text-sm font-semibold text-text">{currentPlanLabel}</span>
              <span className="ml-auto rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent">
                {currentPlanBadge}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-text">
                  {storageLimitParts ? storageLimitParts.value : "—"}
                  {storageLimitParts ? (
                    <span className="ml-0.5 text-xs font-normal text-text-muted">
                      {storageLimitParts.unit}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-text-muted">存储空间</div>
              </div>
              <div>
                <div className="text-lg font-bold text-text">
                  {account ? account.plan.monthly_credits : "—"}
                  <span className="ml-0.5 text-xs font-normal text-text-muted">/月</span>
                </div>
                <div className="text-xs text-text-muted">月积分</div>
              </div>
              <div>
                <div className="text-lg font-bold text-text">
                  {account
                    ? formatDailyFileParseLimit(account.plan.daily_file_parse_limit)
                    : "—"}
                </div>
                <div className="text-xs text-text-muted">文件解析</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-text">
                  {account ? account.plan.max_workspaces : "—"}
                  <span className="ml-0.5 text-xs font-normal text-text-muted">个</span>
                </div>
                <div className="text-xs text-text-muted">工作区上限</div>
              </div>
              <div>
                <div className="text-lg font-bold text-text">
                  {account ? account.plan.max_conversations_per_workspace : "—"}
                  <span className="ml-0.5 text-xs font-normal text-text-muted">条/区</span>
                </div>
                <div className="text-xs text-text-muted">会话上限</div>
              </div>
              <div>
                <div className="text-lg font-bold text-text">&#x221E;</div>
                <div className="text-xs text-text-muted">网络搜索</div>
              </div>
            </div>
            <ControlButton
              type="button"
              variant="outline"
              className="mt-4 min-h-[44px] w-full rounded-2xl px-4 text-sm font-semibold"
              onClick={() => {
                onClose();
                onOpenSubscription();
              }}
            >
              <ArrowSquareOutIcon size={16} weight="bold" />
              查看套餐
            </ControlButton>
          </div>

          <div className="mx-6 mt-4">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs font-medium text-text-muted">存储用量</span>
              {account ? (
                <span className="text-xs tabular-nums text-text-muted">
                  {formatBytes(account.storage_used_bytes)} / {formatBytes(account.storage_limit_bytes)}
                </span>
              ) : null}
            </div>
            {loading ? (
              <div className="h-1.5 animate-pulse rounded-full bg-panel" />
            ) : (
              <div className={cn(USAGE_BAR_TRACK_CLASS, progressTrackGradient(pct))}>
                <div
                  className={cn(
                    "h-full rounded-full transition-all [transition-duration:var(--motion-duration-slow)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
                    progressColor(pct),
                  )}
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              </div>
            )}
          </div>

          <div className="mx-6 mt-4 flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">当前积分余额</span>
            {loading ? (
              <div className="h-4 w-16 animate-pulse rounded bg-panel" />
            ) : (
              <span className="text-sm font-bold tabular-nums text-text">
                {account?.credits_balance ?? 0} <span className="text-xs font-normal text-text-muted">积分</span>
              </span>
            )}
          </div>

          {account ? (
            <div className="mx-6 mt-4 space-y-3 pb-6">
              <UsageBar label="工作区" used={workspaceCount} limit={account.plan.max_workspaces} />
              <UsageBar
                label="当前工作区会话"
                used={conversationCount}
                limit={account.plan.max_conversations_per_workspace}
              />
            </div>
          ) : null}
        </div>
      )}
    />
  );
}

export function SettingsDialog({
  open,
  onClose,
  email,
  onReplayTour,
}: SettingsDialogProps) {
  const { data: account } = useAccountInfo();
  const initial = email.split("@")[0]?.[0]?.toUpperCase() || "?";

  return (
    <DialogBase
      open={open}
      title="设置"
      onClose={onClose}
      panelClassName="max-w-md p-0"
      panelStyle={{ paddingBlock: "0px", paddingInline: "0px" }}
      panelContent={(
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto pt-14 pb-6">
          <AccountIdentityHeader
            email={email}
            initial={initial}
            secondaryLabel={account?.preferences ? "偏好与界面" : "完善你的学习体验"}
          />

          <PreferencesSection preferences={account?.preferences ?? null} />
          <AppearanceSection />

          {onReplayTour ? (
            <div className="mx-6 mt-4 rounded-[22px] bg-panel/70 p-4">
              <div className="mb-3 flex items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">帮助</span>
              </div>
              <div className="grid gap-2">
                {onReplayTour ? (
                  <ControlButton
                    type="button"
                    variant="menuProminent"
                    className="min-h-[44px] w-full justify-between rounded-2xl px-4 text-sm font-semibold"
                    onClick={onReplayTour}
                  >
                    界面引导
                    <ArrowSquareOutIcon size={16} weight="bold" />
                  </ControlButton>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    />
  );
}

function AccountIdentityHeader({
  email,
  initial,
  secondaryLabel,
}: {
  email: string;
  initial: string;
  secondaryLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 pt-6 pb-2">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-text-inverse">
        {initial}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-base font-semibold text-text">{email}</span>
        <span className="text-xs text-text-muted">{secondaryLabel}</span>
      </div>
    </div>
  );
}

function planLabel(name: string): string {
  return getSubscriptionPlanLabel(name);
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-text-muted">{label}</span>
        <span className="text-xs tabular-nums text-text-muted">{used} / {limit}</span>
      </div>
      <div className={cn(USAGE_BAR_TRACK_CLASS, progressTrackGradient(pct))}>
        <div
          className={cn(
            "h-full rounded-full transition-all [transition-duration:var(--motion-duration-slow)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
            progressColor(pct),
          )}
          style={{ width: `${Math.max(pct, limit > 0 ? 1 : 0)}%` }}
        />
      </div>
    </div>
  );
}

const SUBJECT_LABELS: Record<string, string> = {
  none: "不指定",
  stem: "理工科",
  humanities: "人文社科",
  business: "商科经济",
  medical: "医学生物",
  art: "艺术设计",
  law: "法学",
  other: "其他",
};
const EDUCATION_LABELS: Record<string, string> = {
  high_school: "高中生",
  undergraduate: "本科生",
  graduate: "研究生",
  phd: "博士生",
  professional: "职业学习者",
  casual: "来聊天的",
};
const LEARNING_STYLE_LABELS: Record<string, string> = {
  thorough: "讲透原理",
  concise: "直给结论",
  example: "多举例子",
  guided: "引导思考",
  unsure: "不确定",
};
const INTERACTION_STYLE_LABELS: Record<string, string> = {
  auto: "自动适应",
  formal: "正经严肃",
  casual: "轻松随意",
  encouraging: "多多鼓励",
};

function PreferencesSection({ preferences }: { preferences: UserPreferences | null }) {
  const router = useRouter();
  const openPreferenceSetup = () => router.push("/onboarding?entry=settings");

  if (!preferences) {
    return (
      <div className="mx-6 mt-4">
        <ControlButton
          type="button"
          variant="secondary"
          onClick={openPreferenceSetup}
          className="min-h-[44px] w-full rounded-2xl bg-panel/80 px-4 py-3 text-sm font-medium text-text hover:bg-surface-sub"
        >
          设置学习偏好
        </ControlButton>
      </div>
    );
  }

  return (
    <div className="mx-6 mt-4 rounded-[22px] bg-panel/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">学习偏好</span>
        <ControlButton
          type="button"
          variant="unstyled"
          onClick={openPreferenceSetup}
          className="flex items-center gap-1 text-xs text-accent transition-colors hover:text-accent-hover"
        >
          <ArrowSquareOutIcon size={12} weight="bold" />
          重新设置
        </ControlButton>
      </div>
      <div className="space-y-1.5 text-sm">
        {(preferences.subjects?.length ?? 0) > 0 ? (
          <PrefRow
            label="学科"
            value={
              (preferences.subjects ?? []).map((subject) => SUBJECT_LABELS[subject] ?? subject).join("、")
              + (preferences.custom_subjects ? `（${preferences.custom_subjects}）` : "")
            }
          />
        ) : null}
        {preferences.education_level ? (
          <PrefRow
            label="阶段"
            value={EDUCATION_LABELS[preferences.education_level] ?? preferences.education_level}
          />
        ) : null}
        {preferences.learning_style ? (
          <PrefRow
            label="学习"
            value={LEARNING_STYLE_LABELS[preferences.learning_style] ?? preferences.learning_style}
          />
        ) : null}
        {preferences.interaction_style ? (
          <PrefRow
            label="交互"
            value={INTERACTION_STYLE_LABELS[preferences.interaction_style] ?? preferences.interaction_style}
          />
        ) : null}
        <PrefRow
          label="发送"
          value={SEND_SHORTCUT_LABELS[normalizeSendShortcutPreference(preferences.send_shortcut)]}
        />
        {preferences.nickname ? <PrefRow label="称呼" value={preferences.nickname} /> : null}
      </div>
    </div>
  );
}

function PrefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-10 shrink-0 text-xs text-text-muted">{label}</span>
      <span className="text-xs text-text">{value}</span>
    </div>
  );
}

function AppearanceSection() {
  return (
    <div className="mx-6 mt-4 rounded-[22px] bg-panel/70 p-4">
      <div className="mb-3 flex items-center">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">外观</span>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-[18px] bg-surface/75 px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-text">颜色模式</div>
          <div className="mt-1 text-xs leading-5 text-text-muted">
            在亮色、暗色和跟随系统之间切换。
          </div>
        </div>
        <ThemeModeSwitch
          placement="inline"
          showModeLabel
          containerClassName="shrink-0"
          labelClassName="text-xs font-semibold text-text-secondary"
        />
      </div>
    </div>
  );
}
