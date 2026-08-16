import Link from "next/link";

export function LegalFooterLinks({
  className,
}: {
  className?: string;
}) {
  return (
    <nav
      aria-label="法律文档"
      className={className ?? "flex flex-wrap items-center gap-4 text-sm text-text-secondary"}
    >
      <Link
        href="/terms"
        target="_blank"
        rel="noreferrer"
        className="transition-colors hover:text-text"
      >
        用户协议
      </Link>
      <Link
        href="/privacy"
        target="_blank"
        rel="noreferrer"
        className="transition-colors hover:text-text"
      >
        隐私政策
      </Link>
    </nav>
  );
}
