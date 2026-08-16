"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/lib/api/auth";
import { AuthPageFrame } from "@/components/auth/AuthPageFrame";
import { Input } from "@/components/ui/Input";
import { ControlButton } from "@/components/ui/factory/groups/button/components";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = useMemo(() => !email || isSubmitting, [email, isSubmitting]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setNotice("如果该邮箱存在账户，重置链接已发送，请查收邮件。");
    } catch (err) {
      const message = err instanceof Error ? err.message : "发送重置邮件失败";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageFrame
      title="找回密码"
      description="输入注册邮箱，我们会发送密码重置链接，让你顺畅回到当前学习进度。"
      sideTitle="别让一次忘记密码中断学习"
      sideDescription="账号恢复也应该像产品本身一样清晰、克制、不中断。验证完成后，你可以继续回到原来的学习工作区。"
      backLabel="返回登录"
      onBack={() => router.push("/?mode=login")}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="type-meta text-text">邮箱</label>
          <Input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
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
          {isSubmitting ? "发送中..." : "发送重置邮件"}
        </ControlButton>
      </form>
    </AuthPageFrame>
  );
}
