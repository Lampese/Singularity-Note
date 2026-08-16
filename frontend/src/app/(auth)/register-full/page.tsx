import Link from "next/link";
import type { CSSProperties } from "react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { HOMEPAGE_VARS } from "@/lib/theme/homepageConfig";
import styles from "./page.module.css";

export default function RegisterFullPage() {
  return (
    <main className={styles.page} style={HOMEPAGE_VARS as CSSProperties}>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.orbPrimary} />
        <div className={styles.orbSecondary} />
      </div>

      <section className={styles.card}>
        <div className={styles.brandRow}>
          <BrandLogo className={styles.brandMark} />
          <div className={styles.brandText}>
            <strong>Singularity Note</strong>
            <span>知识的奇点</span>
          </div>
        </div>

        <h1 className={styles.title}>当前注册名额已满</h1>
        <p className={styles.description}>
          我们暂时关闭了新的账号注册入口。你可以稍后再试，或者联系团队获取最新开放信息。
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryAction}>
            返回首页
          </Link>
          <Link href="/?mode=login" className={styles.secondaryAction}>
            已有账号，去登录
          </Link>
        </div>
      </section>
    </main>
  );
}
