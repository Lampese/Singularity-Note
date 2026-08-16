"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import { AuthPageFrame } from "@/components/auth/AuthPageFrame";
import { Input } from "@/components/ui/Input";
import { ControlButton } from "@/components/ui/factory/groups/button/components";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = useMemo(
    () => !token || !newPassword || !confirmPassword || isSubmitting,
    [token, newPassword, confirmPassword, isSubmitting],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, new_password: newPassword });
      setNotice("密码已重置，请使用新密码登录。");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "密码重置失败";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageFrame
      title="重置密码"
      description="输入邮件中的 token 并设置新密码，完成后即可回到你的学习流程。"
      sideTitle="恢复账号，也保持产品体验完整"
      sideDescription="重置链接会在短时间内失效，请从最新一封邮件进入。"
      backLabel="返回登录"
      onBack={() => router.push("/?mode=login")}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="type-meta text-text">重置 token</label>
          <Input
            required
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="pw_xxx_xxx"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="type-meta text-text">新密码</label>
          <Input
            required
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="type-meta text-text">确认新密码</label>
          <Input
            required
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <div className="status-banner status-banner-error type-body-secondary">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="status-banner status-banner-success type-body-secondary">
            {notice}
          </div>
        ) : null}

        <ControlButton
          type="submit"
          variant="menuProminent"
          className="min-h-[48px] w-full text-sm font-semibold"
          disabled={isDisabled}
        >
          {isSubmitting ? "提交中..." : "确认重置密码"}
        </ControlButton>
      </form>
    </AuthPageFrame>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
