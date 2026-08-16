"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useCallback, useEffect, useMemo, type ComponentType } from "react";
import { fetchPreferences, updatePreferences, type UserPreferences } from "@/lib/api/account";
import { getWorkspaceId } from "@/lib/auth/token";
import { armWorkspaceTour } from "@/lib/onboarding/workspaceTour";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Input } from "@/components/ui/Input";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SEND_SHORTCUT,
  normalizeSendShortcutPreference,
  SEND_SHORTCUT_LABELS,
  type SendShortcutPreference,
} from "@/lib/userPreferences";
import {
  ArrowLeftIcon,
  ProhibitIcon,
  AtomIcon,
  BookOpenTextIcon,
  ChartLineUpIcon,
  FirstAidKitIcon,
  PaletteIcon,
  ScalesIcon,
  DotsThreeIcon,
  BackpackIcon,
  GraduationCapIcon,
  MicroscopeIcon,
  FlaskIcon,
  BriefcaseIcon,
  ChatCircleDotsIcon,
  TreeStructureIcon,
  TargetIcon,
  ListBulletsIcon,
  CompassIcon,
  QuestionIcon,
  ShuffleIcon,
  UserIcon,
  SmileyIcon,
  HeartIcon,
  type IconProps,
} from "@phosphor-icons/react";

type PhosphorIcon = ComponentType<IconProps>;

const SUBJECTS: { id: string; label: string; desc: string; icon: PhosphorIcon }[] = [
  { id: "none", label: "不指定", desc: "不限定特定领域", icon: ProhibitIcon },
  { id: "stem", label: "理工科", desc: "数学 · 物理 · 计算机 · 工程", icon: AtomIcon },
  { id: "humanities", label: "人文社科", desc: "文学 · 历史 · 哲学 · 社会学", icon: BookOpenTextIcon },
  { id: "business", label: "商科经济", desc: "金融 · 管理 · 经济学", icon: ChartLineUpIcon },
  { id: "medical", label: "医学生物", desc: "临床 · 生物 · 药学", icon: FirstAidKitIcon },
  { id: "art", label: "艺术设计", desc: "美术 · 设计 · 音乐 · 影视", icon: PaletteIcon },
  { id: "law", label: "法学", desc: "法律 · 政治", icon: ScalesIcon },
  { id: "other", label: "其他", desc: "以上都不太合适", icon: DotsThreeIcon },
];

const EDUCATION_LEVELS: { id: string; label: string; icon: PhosphorIcon }[] = [
  { id: "high_school", label: "高中生", icon: BackpackIcon },
  { id: "undergraduate", label: "本科生", icon: GraduationCapIcon },
  { id: "graduate", label: "研究生", icon: MicroscopeIcon },
  { id: "phd", label: "博士生", icon: FlaskIcon },
  { id: "professional", label: "职业学习者", icon: BriefcaseIcon },
  { id: "casual", label: "我只是来聊天的", icon: ChatCircleDotsIcon },
];

const LEARNING_STYLES: { id: string; label: string; desc: string; icon: PhosphorIcon }[] = [
  { id: "thorough", label: "讲透原理", desc: "帮我把知识点从原理讲清楚", icon: TreeStructureIcon },
  { id: "concise", label: "直给结论", desc: "别废话，直接告诉我答案", icon: TargetIcon },
  { id: "example", label: "多举例子", desc: "用例子帮我理解", icon: ListBulletsIcon },
  { id: "guided", label: "引导思考", desc: "别直接给答案，带我一步步想", icon: CompassIcon },
  { id: "unsure", label: "不确定", desc: "说实话我也不确定", icon: QuestionIcon },
];

const INTERACTION_STYLES: { id: string; label: string; desc: string; icon: PhosphorIcon }[] = [
  { id: "auto", label: "自动适应", desc: "根据场景自动切换就好", icon: ShuffleIcon },
  { id: "formal", label: "正经严肃", desc: "专业一点，像在写论文", icon: UserIcon },
  { id: "casual", label: "轻松随意", desc: "像朋友聊天一样就行", icon: SmileyIcon },
  { id: "encouraging", label: "多多鼓励", desc: "请温柔一点对我", icon: HeartIcon },
];

const SEND_SHORTCUT_OPTIONS: {
  id: SendShortcutPreference;
  label: string;
  desc: string;
}[] = [
  {
    id: "enter",
    label: "Enter 发送",
    desc: "直接按 Enter 发送，Shift + Enter 换行",
  },
  {
    id: "meta_enter",
    label: "Cmd/Ctrl + Enter 发送",
    desc: "Enter 保留换行，Cmd/Ctrl + Enter 发送",
  },
];

const TOTAL_STEPS = 6;
const ONBOARDING_SECONDARY_BUTTON_CLASS =
  "min-h-[40px] rounded-2xl bg-panel/72 px-4 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-[background-color,border-color,color,box-shadow] [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] hover:bg-surface-sub focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 motion-reduce:transition-none";

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [animating, setAnimating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [customSubjects, setCustomSubjects] = useState<string>("");
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [learningStyle, setLearningStyle] = useState<string>("");
  const [interactionStyle, setInteractionStyle] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [sendShortcut, setSendShortcut] =
    useState<SendShortcutPreference>(DEFAULT_SEND_SHORTCUT);
  const [hydratingPreferences, setHydratingPreferences] = useState(true);
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);
  const onboardingEntry = searchParams.get("entry");
  const shouldArmTourOnExit = useMemo(
    () => onboardingEntry !== "settings" && !hasExistingPreferences,
    [hasExistingPreferences, onboardingEntry],
  );

  const goNext = useCallback(() => {
    if (step >= TOTAL_STEPS - 1 || animating) return;
    setDirection("forward");
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setAnimating(false);
    }, 350);
  }, [step, animating]);

  const goBack = useCallback(() => {
    if (step <= 0 || animating) return;
    setDirection("backward");
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setAnimating(false);
    }, 350);
  }, [step, animating]);

  const handleSingleSelect = useCallback(
    (setter: (v: string) => void, value: string) => {
      setter(value);
      setTimeout(() => goNext(), 300);
    },
    [goNext],
  );

  const handleSendShortcutSelect = useCallback(
    (value: SendShortcutPreference) => {
      setSendShortcut(value);
      setTimeout(() => goNext(), 300);
    },
    [goNext],
  );

  const toggleSubject = useCallback((id: string) => {
    setSubjects((prev) => {
      if (id === "none") {
        return prev.includes("none") ? [] : ["none"];
      }
      const without = prev.filter((s) => s !== id && s !== "none");
      return prev.includes(id) ? without : [...without, id];
    });
  }, []);

  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      try {
        const preferences = await fetchPreferences();
        if (!preferences || cancelled) {
          return;
        }

        setHasExistingPreferences(true);
        setSubjects(preferences.subjects ?? []);
        setCustomSubjects(preferences.custom_subjects ?? "");
        setEducationLevel(preferences.education_level ?? "");
        setLearningStyle(preferences.learning_style ?? "");
        setInteractionStyle(preferences.interaction_style ?? "");
        setNickname(preferences.nickname ?? "");
        setSendShortcut(normalizeSendShortcutPreference(preferences.send_shortcut));
      } catch (error) {
        console.error("Failed to load preferences for onboarding", error);
      } finally {
        if (!cancelled) {
          setHydratingPreferences(false);
        }
      }
    }

    void loadPreferences();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleComplete = useCallback(async () => {
    setSaving(true);
    setSaveError(false);
    try {
      const prefs: UserPreferences = {
        subjects,
        custom_subjects: subjects.includes("other") ? customSubjects.trim() : undefined,
        education_level: educationLevel || "undergraduate",
        learning_style: learningStyle || "thorough",
        interaction_style: interactionStyle || "auto",
        nickname,
        send_shortcut: sendShortcut,
      };
      await updatePreferences(prefs);
      if (shouldArmTourOnExit) {
        armWorkspaceTour();
      }
      const wsId = getWorkspaceId();
      router.push(wsId ? `/workspaces/${wsId}` : "/workspaces");
    } catch (e) {
      console.error("Failed to save preferences", e);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }, [
    subjects,
    customSubjects,
    educationLevel,
    learningStyle,
    interactionStyle,
    nickname,
    router,
    sendShortcut,
    shouldArmTourOnExit,
  ]);

  const handleSkip = useCallback(async () => {
    setSaving(true);
    setSaveError(false);
    try {
      const prefs: UserPreferences = {
        subjects: [],
        education_level: "undergraduate",
        learning_style: "thorough",
        interaction_style: "auto",
        nickname: "",
        send_shortcut: DEFAULT_SEND_SHORTCUT,
      };
      await updatePreferences(prefs);
      if (shouldArmTourOnExit) {
        armWorkspaceTour();
      }
      const wsId = getWorkspaceId();
      router.push(wsId ? `/workspaces/${wsId}` : "/workspaces");
    } catch (error) {
      console.error("Failed to save default preferences", error);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }, [router, shouldArmTourOnExit]);

  const getTransformStyle = useCallback(
    (cardStep: number) => {
      if (cardStep === step && !animating) {
        return { opacity: 1, transform: "translateX(0) scale(1)" };
      }
      if (cardStep === step && animating) {
        const out = direction === "forward" ? "-100%" : "100%";
        return { opacity: 0, transform: `translateX(${out}) scale(0.95)` };
      }
      if (cardStep < step) {
        return { opacity: 0, transform: "translateX(-100%) scale(0.95)" };
      }
      return { opacity: 0, transform: "translateX(100%) scale(0.95)" };
    },
    [step, animating, direction],
  );

  return (
    <div className="min-h-screen bg-bg flex flex-col bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-accent-muted)_92%,transparent),transparent_42%)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <BrandLogo className="h-6 w-auto" />
          <span className="font-semibold text-text text-sm tracking-tight">
            Singularity Note
          </span>
        </div>
        <ControlButton
          type="button"
          variant="menuGhost"
          size="sm"
          onClick={handleSkip}
          disabled={saving}
          className={cn(
            ONBOARDING_SECONDARY_BUTTON_CLASS,
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          跳过设置
        </ControlButton>
      </header>

      {/* Progress bar */}
      <div className="px-6">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all [transition-duration:var(--motion-duration-slow)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
                  i <= step ? "bg-accent" : "bg-border",
                )}
              />
            ))}
          </div>
          <p className="text-xs text-text-muted mt-2 text-center">
            {step + 1} / {TOTAL_STEPS}
          </p>
        </div>
      </div>

      {/* Card area */}
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:pt-8">
        <div className="relative w-full max-w-lg" style={{ minHeight: "420px" }}>
          {hydratingPreferences ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="frosted-surface-subtle flex items-center gap-3 rounded-[var(--radius-surface-1)] px-5 py-4 text-sm text-text-muted">
                <span className="h-4 w-4 rounded-full border-2 border-text-muted/25 border-t-text-muted animate-spin" />
                正在载入你的学习偏好...
              </div>
            </div>
          ) : null}
          {/* Step 0: Subjects (multi-select) */}
          <div
            className="absolute inset-0 flex flex-col transition-all [transition-duration:var(--motion-duration-slow)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none"
            style={{
              ...getTransformStyle(0),
              pointerEvents: step === 0 && !animating && !hydratingPreferences ? "auto" : "none",
              opacity: hydratingPreferences ? 0 : getTransformStyle(0).opacity,
            }}
          >
            <StepCard
              title="你主要学习哪些领域？"
              subtitle="可以多选"
            >
              <div className="grid grid-cols-2 gap-2.5">
                {SUBJECTS.map((s) => (
                  <OnboardingChoiceCard
                    key={s.id}
                    label={s.label}
                    desc={s.desc}
                    icon={s.icon}
                    selected={subjects.includes(s.id)}
                    onClick={() => toggleSubject(s.id)}
                  />
                ))}
              </div>
              {subjects.includes("other") && (
                <div className="mt-3">
                  <Input
                    type="text"
                    value={customSubjects}
                    onChange={(e) => setCustomSubjects(e.target.value)}
                    placeholder="请输入你的学习领域，如：教育学、心理学……"
                    maxLength={100}
                    className="border-accent/35"
                  />
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <ControlButton
                  type="button"
                  variant="unstyled"
                  onClick={goNext}
                  className="rounded-xl bg-accent text-text-inverse px-6 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                  disabled={animating || subjects.length === 0 || (subjects.includes("other") && !customSubjects.trim())}
                >
                  下一步
                </ControlButton>
              </div>
            </StepCard>
          </div>

          {/* Step 1: Education level (single-select) */}
          <div
            className="absolute inset-0 flex flex-col transition-all [transition-duration:var(--motion-duration-slow)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none"
            style={{
              ...getTransformStyle(1),
              pointerEvents: step === 1 && !animating && !hydratingPreferences ? "auto" : "none",
              opacity: hydratingPreferences ? 0 : getTransformStyle(1).opacity,
            }}
          >
            <StepCard title="你目前处于哪个学习阶段？" subtitle="选择一个最符合的">
              <div className="grid grid-cols-2 gap-2.5">
                {EDUCATION_LEVELS.map((l) => (
                  <OnboardingChoiceCard
                    key={l.id}
                    label={l.label}
                    icon={l.icon}
                    selected={educationLevel === l.id}
                    onClick={() => handleSingleSelect(setEducationLevel, l.id)}
                  />
                ))}
              </div>
            </StepCard>
          </div>

          {/* Step 2: Learning style (single-select) */}
          <div
            className="absolute inset-0 flex flex-col transition-all [transition-duration:var(--motion-duration-slow)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none"
            style={{
              ...getTransformStyle(2),
              pointerEvents: step === 2 && !animating && !hydratingPreferences ? "auto" : "none",
              opacity: hydratingPreferences ? 0 : getTransformStyle(2).opacity,
            }}
          >
            <StepCard title="你希望 AI 怎么帮你学？" subtitle="选择一个最适合你的风格">
              <div className="flex flex-col gap-2.5">
                {LEARNING_STYLES.map((s) => (
                  <OnboardingChoiceCard
                    key={s.id}
                    label={s.label}
                    desc={`“${s.desc}”`}
                    icon={s.icon}
                    selected={learningStyle === s.id}
                    onClick={() => handleSingleSelect(setLearningStyle, s.id)}
                  />
                ))}
              </div>
            </StepCard>
          </div>

          {/* Step 3: Interaction style (single-select) */}
          <div
            className="absolute inset-0 flex flex-col transition-all [transition-duration:var(--motion-duration-slow)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none"
            style={{
              ...getTransformStyle(3),
              pointerEvents: step === 3 && !animating && !hydratingPreferences ? "auto" : "none",
              opacity: hydratingPreferences ? 0 : getTransformStyle(3).opacity,
            }}
          >
            <StepCard title="你喜欢什么交互风格？" subtitle="AI 会根据你的选择调整语气">
              <div className="flex flex-col gap-2.5">
                {INTERACTION_STYLES.map((s) => (
                  <OnboardingChoiceCard
                    key={s.id}
                    label={s.label}
                    desc={`“${s.desc}”`}
                    icon={s.icon}
                    selected={interactionStyle === s.id}
                    onClick={() => handleSingleSelect(setInteractionStyle, s.id)}
                  />
                ))}
              </div>
            </StepCard>
          </div>

          {/* Step 4: Send shortcut */}
          <div
            className="absolute inset-0 flex flex-col transition-all [transition-duration:var(--motion-duration-slow)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none"
            style={{
              ...getTransformStyle(4),
              pointerEvents: step === 4 && !animating && !hydratingPreferences ? "auto" : "none",
              opacity: hydratingPreferences ? 0 : getTransformStyle(4).opacity,
            }}
          >
            <StepCard title="发送方式" subtitle="先确定聊天输入框里的发送快捷键">
              <div className="space-y-4">
                <div className="rounded-xl bg-panel/45 px-4 py-3 text-sm text-text-muted">
                  这个设置会直接影响工作区聊天框里的发送快捷键，先选好再进入最后确认会更清晰。
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {SEND_SHORTCUT_OPTIONS.map((option) => (
                    <SendShortcutChoiceCard
                      key={option.id}
                      label={option.label}
                      desc={option.desc}
                      selected={sendShortcut === option.id}
                      onClick={() => handleSendShortcutSelect(option.id)}
                    />
                  ))}
                </div>
              </div>
            </StepCard>
          </div>

          {/* Step 5: Nickname + Summary */}
          <div
            className="absolute inset-0 flex flex-col transition-all [transition-duration:var(--motion-duration-slow)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none"
            style={{
              ...getTransformStyle(5),
              pointerEvents: step === 5 && !animating && !hydratingPreferences ? "auto" : "none",
              opacity: hydratingPreferences ? 0 : getTransformStyle(5).opacity,
            }}
          >
            <StepCard title="最后一步" subtitle="给自己取个称呼吧（选填），然后确认你的偏好摘要">
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="希望 AI 怎么叫你（留空也没问题）"
                  maxLength={20}
                />

                {/* Summary */}
                <div className="rounded-xl border border-border bg-panel/50 p-4 space-y-2">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">你的偏好摘要</p>
                  <div className="space-y-1.5 text-sm text-text">
                    {subjects.length > 0 && (
                      <SummaryRow label="学科" value={subjects.map((id) => SUBJECTS.find((s) => s.id === id)?.label ?? id).join("、")} />
                    )}
                    {educationLevel && (
                      <SummaryRow label="阶段" value={EDUCATION_LEVELS.find((l) => l.id === educationLevel)?.label ?? educationLevel} />
                    )}
                    {learningStyle && (
                      <SummaryRow label="学习风格" value={LEARNING_STYLES.find((s) => s.id === learningStyle)?.label ?? learningStyle} />
                    )}
                    {interactionStyle && (
                      <SummaryRow label="交互风格" value={INTERACTION_STYLES.find((s) => s.id === interactionStyle)?.label ?? interactionStyle} />
                    )}
                    <SummaryRow label="发送方式" value={SEND_SHORTCUT_LABELS[sendShortcut]} />
                    {nickname && <SummaryRow label="称呼" value={nickname} />}
                  </div>
                </div>

                <ControlButton
                  type="button"
                  variant="unstyled"
                  onClick={handleComplete}
                  disabled={saving}
                  className="w-full rounded-xl bg-accent text-text-inverse py-3 text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-text-inverse/20 border-t-text-inverse rounded-full animate-spin" />
                      保存中...
                    </span>
                  ) : (
                    "开始使用"
                  )}
                </ControlButton>
                {saveError && (
                  <p className="status-banner status-banner-error text-center type-caption">保存失败，请重试后继续</p>
                )}
              </div>
            </StepCard>
          </div>
        </div>
      </main>

      {/* Navigation */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <ControlButton
            type="button"
            variant="menuGhost"
            size="sm"
            onClick={goBack}
            disabled={animating}
            className={cn(
              ONBOARDING_SECONDARY_BUTTON_CLASS,
              "gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            leading={<ArrowLeftIcon size={14} weight="bold" />}
          >
            上一步
          </ControlButton>
        </div>
      )}
      {step === TOTAL_STEPS - 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <ControlButton
            type="button"
            variant="menuGhost"
            size="sm"
            onClick={goBack}
            disabled={animating || saving}
            className={cn(
              ONBOARDING_SECONDARY_BUTTON_CLASS,
              "gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            leading={<ArrowLeftIcon size={14} weight="bold" />}
          >
            返回修改
          </ControlButton>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingPageContent />
    </Suspense>
  );
}

function StepCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="frosted-surface-prominent flex flex-col gap-4 rounded-[28px] px-6 py-6">
      <div>
        <h2 className="text-xl font-bold text-text">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function OnboardingChoiceCard({
  label,
  icon: Icon,
  selected,
  onClick,
  desc,
}: {
  label: string;
  icon: PhosphorIcon;
  selected: boolean;
  onClick: () => void;
  desc?: string;
}) {
  return (
    <ControlButton
      type="button"
      variant="unstyled"
      onClick={onClick}
      className={cn(
        "grid w-full min-h-[84px] grid-cols-[24px_minmax(0,1fr)] items-center gap-4 rounded-xl border border-transparent p-5 text-left transition-all [transition-duration:var(--motion-duration-fast)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
        selected
          ? "border-accent bg-accent/8 ring-2 ring-accent/20"
          : "bg-surface hover:bg-surface-hover",
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center">
        <Icon
          size={20}
          weight={selected ? "fill" : "regular"}
          className={cn(
            "shrink-0",
            selected ? "text-accent" : "text-text-muted",
          )}
        />
      </span>
      <span className="flex min-w-0 flex-col items-start justify-center text-left">
        <span
          className={cn(
            "text-sm font-medium leading-tight",
            selected ? "text-accent" : "text-text",
          )}
        >
          {label}
        </span>
        {desc ? (
          <span className="mt-1 text-xs leading-relaxed text-text-muted">
            {desc}
          </span>
        ) : null}
      </span>
    </ControlButton>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-text-muted text-xs shrink-0 w-16">{label}</span>
      <span className="text-text text-sm">{value}</span>
    </div>
  );
}

function SendShortcutChoiceCard({
  label,
  desc,
  selected,
  onClick,
}: {
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <ControlButton
      type="button"
      variant="unstyled"
      onClick={onClick}
      className={cn(
        "flex min-h-[120px] w-full flex-col items-start justify-start rounded-xl border border-transparent p-5 text-left transition-all [transition-duration:var(--motion-duration-fast)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
        selected
          ? "border-accent bg-accent/8 ring-2 ring-accent/20"
          : "bg-surface hover:bg-surface-hover",
      )}
    >
      <span className="flex w-full flex-col items-start text-left">
        <span
          className={cn(
            "block w-full text-sm font-medium leading-tight break-words",
            selected ? "text-accent" : "text-text",
          )}
        >
          {label}
        </span>
        <span className="mt-3 block w-full whitespace-normal break-words text-xs leading-relaxed text-text-muted">
          {desc}
        </span>
      </span>
    </ControlButton>
  );
}
