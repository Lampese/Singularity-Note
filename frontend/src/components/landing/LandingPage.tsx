"use client";

import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { LegalFooterLinks } from "@/components/legal/LegalFooterLinks";
import { HOMEPAGE_VARS } from "@/lib/theme/homepageConfig";
import { ComparisonMatrix } from "@/components/landing/ComparisonMatrix";
import { FeatureStoryCarousel } from "@/components/landing/FeatureStoryCarousel";
import { WorkspaceHeroPreview } from "@/components/landing/WorkspaceHeroPreview";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useLandingAuth } from "@/hooks/useLandingAuth";
import {
	heroMockScenarios,
	landingFeatureStories,
} from "@/components/landing/landingDemoData";
import styles from "./LandingPage.module.css";

type Panel = "landing" | "login" | "register";

function panelFromMode(mode: string | null): Panel {
	if (mode === "login" || mode === "register") return mode;
	return "landing";
}

function getPanelFromUrl(): Panel {
	const params = new URLSearchParams(window.location.search);
	return panelFromMode(params.get("mode"));
}

export function LandingPage({ initialPanel }: { initialPanel?: Panel }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		registrationInviteRequired,
		loginError,
		registerError,
		registerNotice,
		isLoggingIn,
		isRegistering,
		clearAuthFeedback,
		submitLogin,
		submitRegister,
	} = useLandingAuth();

	const [panel, setPanel] = useState<Panel>(() => {
		if (initialPanel) return initialPanel;
		return panelFromMode(searchParams.get("mode"));
	});

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [inviteCode, setInviteCode] = useState("");
	const [acceptedLegalDocuments, setAcceptedLegalDocuments] = useState(false);
	const isAuth = panel === "login" || panel === "register";
	const isRegister = panel === "register";
	const authTitle = isRegister
		? "创建你的 Singularity Note 账号"
		: "登录你的 Singularity Note 账号";
	const authSubtitle = isRegister
		? registrationInviteRequired
			? "使用邮箱、密码和邀请码完成注册。"
			: "使用邮箱和密码完成注册。"
		: "使用邮箱和密码继续。";
	const sideTitle = isRegister ? "开始体验奇点笔记" : "欢迎回到奇点笔记";
	const sideSubtitle = isRegister
		? "创建账号后，你就可以把课程资料、问题和复习线索放进同一个学习工作区。"
		: "登录后继续你的学习工作台：资料、证据、解释和复习线索都会留在同一个工作区。";

	const canSubmitLogin = !!email && !!password && !isLoggingIn;
	const canSubmitRegister =
		!!email &&
		!!password &&
		(!registrationInviteRequired || !!inviteCode) &&
		acceptedLegalDocuments &&
		!isRegistering;
	useBodyScrollLock(isAuth);

	const navigate = useCallback((target: Panel) => {
		clearAuthFeedback();
		setPanel(target);
		const url = target === "landing" ? "/" : `/?mode=${target}`;
		window.history.replaceState({ mode: target }, "", url);
	}, [clearAuthFeedback]);

	useEffect(() => {
		const onPopState = () => {
			setPanel(getPanelFromUrl());
		};

		window.addEventListener("popstate", onPopState);
		return () => {
			window.removeEventListener("popstate", onPopState);
		};
	}, []);

	useEffect(() => {
		document.body.classList.add("landing-page");
		const prevScrollBehavior = document.documentElement.style.scrollBehavior;
		document.documentElement.style.scrollBehavior = "smooth";
		return () => {
			document.body.classList.remove("landing-page");
			document.documentElement.style.scrollBehavior = prevScrollBehavior;
		};
	}, []);

	useEffect(() => {
		if (!isAuth) {
			return;
		}

		document.body.classList.add("auth-open");
		return () => {
			document.body.classList.remove("auth-open");
		};
	}, [isAuth]);

	useLayoutEffect(() => {
		if (!isAuth) {
			return;
		}

		if ("scrollRestoration" in history) {
			history.scrollRestoration = "manual";
		}

		window.scrollTo(0, 0);
	}, [isAuth, panel]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isAuth) {
				navigate("landing");
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isAuth, navigate]);

	const handleLogin = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			const next = searchParams.get("next");
			await submitLogin({ email, password, redirectTo: next });
		},
		[email, password, submitLogin, searchParams],
	);

	const handleRegister = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			const success = await submitRegister({
				email,
				password,
				inviteCode,
				acceptedLegalDocuments,
			});
			if (success) {
				setPassword("");
			}
		},
		[acceptedLegalDocuments, email, inviteCode, password, submitRegister],
	);

	return (
		<div className={styles.page} style={HOMEPAGE_VARS as React.CSSProperties}>
			<div className={styles.shell} data-mode={panel}>
				<header className={styles.siteHeader}>
					<div
						className={styles.siteHeaderInner}
						style={{
							backdropFilter: "blur(22px)",
							WebkitBackdropFilter: "blur(22px)",
						}}
					>
						<a
							className={styles.brand}
							href="#top"
							aria-label="返回 Singularity Note 首页"
							onClick={(event) => {
								event.preventDefault();
								navigate("landing");
							}}
						>
							<BrandLogo className={styles.brandMark} />
							<span className={styles.brandText}>
								<strong>Singularity Note</strong>
								<span>知识的奇点</span>
							</span>
						</a>

						<nav className={styles.nav} aria-label="首页导航">
							<a href="#experience">产品展示</a>
							<a href="#system">体验亮点</a>
							<a href="#start">开始使用</a>
						</nav>

						<div className={styles.headerActions}>
							<a
								className={`${styles.buttonGhost} ${styles.buttonGhostDesktop} ${styles.headerActionsPrimary}`}
								href="#system"
							>
								查看亮点
							</a>
							<button
								className={`${styles.buttonPrimary} ${styles.headerActionsPrimary}`}
								type="button"
								onClick={() => navigate("login")}
							>
								立即开始
							</button>
							<button
								className={`${styles.buttonGhost} ${styles.headerActionsClose}`}
								type="button"
								onClick={() => navigate("landing")}
								aria-label="关闭登录层并返回主页"
							>
								返回主页
							</button>
						</div>
					</div>
				</header>

				<main id="top">
					<section className={styles.hero}>
						<div className={styles.heroEntry}>
							<div className={styles.heroEntryContent}>
								<div className={styles.heroBrandRow}>
									<BrandLogo className={styles.heroBrandMark} />
									<span className={styles.heroBrandName}>Singularity Note</span>
								</div>

								<div className={styles.heroEntryHeading}>
									<h1 className={`type-hero-title ${styles.heroBrandTitle}`}>
										知识的<span className={styles.heroBrandAccent}>奇点</span>
										从这里开始
									</h1>
									<p
										className={`type-hero-subtitle ${styles.heroBrandSubtitle}`}
									>
										<span>
											<span className={styles.heroBrandSubtitleAccent}>
												「Singularity Note / 奇点笔记」
											</span>
											是一套围绕学习工作流设计的 AI 学习工作台
										</span>
										<span>它可以读懂你的课程资料</span>
										<span>把解释、证据和复习线索放回同一个上下文</span>
										<span>帮助你更稳定地理解、整理和回看重点</span>
									</p>
								</div>

								<div className={styles.heroActions}>
									<button
										className={styles.buttonPrimary}
										type="button"
										onClick={() => navigate("login")}
									>
										立即开始
									</button>
									<a className={styles.buttonGhost} href="#experience">
										看看产品长什么样
									</a>
								</div>
							</div>
						</div>

						<div className={styles.deviceStage} id="product">
							<div className={styles.device}>
								<div className={styles.deviceScreen}>
									<WorkspaceHeroPreview
										scenarios={heroMockScenarios}
										defaultScenarioId="survey-timeline"
									/>
								</div>
							</div>
						</div>
					</section>

					<section
						className={`${styles.section} ${styles.sectionLight}`}
						id="experience"
					>
						<div className={styles.sectionInner}>
							<div className={styles.sectionHeading}>
								<h2>
									一个工作区
									<br />
									贯穿学习全流程
								</h2>
								<p>
									从搜集和上传资料开始，到复习、整理和归纳，一个工作区贯穿学习全流程
								</p>
							</div>

							<FeatureStoryCarousel stories={landingFeatureStories} />
						</div>
					</section>

					<section
						className={`${styles.section} ${styles.sectionDark}`}
						id="system"
					>
						<div className={styles.sectionInner}>
							<div className={styles.sectionHeading}>
								<h2>功能对比</h2>
							</div>

							<ComparisonMatrix />
						</div>
					</section>

					<section
						className={`${styles.section} ${styles.sectionLight}`}
						id="start"
					>
						<div className={styles.sectionInner}>
							<div
								className={`${styles.sectionHeading} ${styles.sectionHeadingWide}`}
							>
								<h2>
									从第一份资料开始
									<br />
									建立你的学习工作区
								</h2>
								<p>
									创建工作区，导入课程材料，开始对话，把重点内容沉淀成一套可以反复回看的学习路径。
								</p>
								<div className={styles.ctaActions}>
									<button
										className={styles.buttonPrimary}
										type="button"
										onClick={() => navigate("login")}
									>
										创建工作区
									</button>
									<a className={styles.buttonGhostLight} href="#top">
										回到顶部
									</a>
								</div>
							</div>
						</div>
					</section>
				</main>

				<footer className={styles.footer}>
					<div className={styles.footerInner}>
						<span>Singularity Note</span>
						<span>面向学生的 AI 学习工作台</span>
						<LegalFooterLinks className={styles.footerLegal} />
						<span className={styles.footerIcp}>琼ICP备2026005639号-2</span>
					</div>
				</footer>

				<div
					className={styles.authShell}
					data-mode={panel}
					aria-hidden={!isAuth}
					style={{
						backdropFilter: "blur(22px) saturate(120%)",
						WebkitBackdropFilter: "blur(22px) saturate(120%)",
					}}
					onWheelCapture={(event) => event.stopPropagation()}
					onTouchMoveCapture={(event) => event.stopPropagation()}
				>
					<div className={styles.authShellInner}>
						<div className={styles.authStage}>
							<section className={styles.authBrand} aria-label="登录前导语">
								<div className={styles.authBrandContent}>
									<p className={styles.authBrandKicker}>Singularity Note</p>
									<h2 className={styles.authBrandTitle}>{sideTitle}</h2>
									<p className={styles.authBrandDescription}>{sideSubtitle}</p>
								</div>
							</section>

							<section className={styles.authPanel} aria-label="账号验证">
								<div
									className={styles.authCard}
									style={{
										backdropFilter: "blur(34px) saturate(150%)",
										WebkitBackdropFilter: "blur(34px) saturate(150%)",
									}}
								>
									<div className={styles.authCardHead}>
										<h2>{authTitle}</h2>
										<p>{authSubtitle}</p>
									</div>

									<div className={styles.authFormShell}>
										<div className={styles.authFormTrack}>
											<div className={styles.authFormPanel}>
												<form
													className={styles.authForm}
													onSubmit={handleLogin}
												>
													<div className={styles.authField}>
														<label htmlFor="landing-login-email">邮箱</label>
														<input
															id="landing-login-email"
															name="email"
															type="email"
															placeholder="you@example.com"
															autoComplete="email"
															value={email}
															onChange={(event) => setEmail(event.target.value)}
															required
														/>
													</div>
													<div className={styles.authField}>
														<label htmlFor="landing-login-password">密码</label>
														<input
															id="landing-login-password"
															name="password"
															type="password"
															placeholder="••••••••"
															autoComplete="current-password"
															value={password}
															onChange={(event) =>
																setPassword(event.target.value)
															}
															required
														/>
													</div>

													<div
														className={styles.authFeedback}
														data-state={loginError ? "error" : undefined}
													>
														{loginError || ""}
													</div>

													<div className={styles.authMeta}>
														<a
															className={styles.authMetaLink}
															href="/forgot-password"
															onClick={(event) => {
																event.preventDefault();
																router.push("/forgot-password");
															}}
														>
															忘记密码？
														</a>
													</div>

													<button
														className={styles.authSubmit}
														type="submit"
														disabled={!canSubmitLogin}
													>
														{isLoggingIn ? "正在验证..." : "立即登录"}
													</button>

													<div className={styles.authSwitch}>
														<span>没有账号？</span>
														<button
															className={styles.inlineAction}
															type="button"
															onClick={() => navigate("register")}
														>
															立即注册
														</button>
													</div>
												</form>
											</div>

											<div className={styles.authFormPanel}>
												<form
													className={styles.authForm}
													onSubmit={handleRegister}
												>
													<div className={styles.authField}>
														<label htmlFor="landing-register-email">邮箱</label>
														<input
															id="landing-register-email"
															name="email"
															type="email"
															placeholder="you@example.com"
															autoComplete="email"
															value={email}
															onChange={(event) => setEmail(event.target.value)}
															required
														/>
													</div>
													<div className={styles.authField}>
														<label htmlFor="landing-register-password">
															密码
														</label>
														<input
															id="landing-register-password"
															name="password"
															type="password"
															placeholder="••••••••"
															autoComplete="new-password"
															value={password}
															onChange={(event) =>
																setPassword(event.target.value)
															}
															required
														/>
													</div>
													{registrationInviteRequired ? (
														<div className={styles.authField}>
															<label htmlFor="landing-register-invite">
																邀请码
															</label>
															<input
																id="landing-register-invite"
																name="invite_code"
																type="text"
																placeholder="SINGNOTE-INVITE-CODE"
																value={inviteCode}
																onChange={(event) =>
																	setInviteCode(event.target.value)
																}
																required
															/>
														</div>
													) : null}
													<label className={styles.authAgreement}>
														<input
															type="checkbox"
															checked={acceptedLegalDocuments}
															onChange={(event) =>
																setAcceptedLegalDocuments(event.target.checked)
															}
															required
														/>
														<span>
															我已阅读并同意
															{" "}
															<a href="/terms" target="_blank" rel="noreferrer">
																《用户协议》
															</a>
															{" "}
															和
															{" "}
															<a href="/privacy" target="_blank" rel="noreferrer">
																《隐私政策》
															</a>
														</span>
													</label>

													<div
														className={styles.authFeedback}
														data-state={
															registerError
																? "error"
																: registerNotice
																	? "success"
																	: undefined
														}
													>
														{registerError || registerNotice || ""}
													</div>

													<button
														className={styles.authSubmit}
														type="submit"
														disabled={!canSubmitRegister}
													>
														{isRegistering ? "正在注册..." : "创建账号"}
													</button>

													<div className={styles.authSwitch}>
														<span>已有账号？</span>
														<button
															className={styles.inlineAction}
															type="button"
															onClick={() => navigate("login")}
														>
															立即登录
														</button>
													</div>
												</form>
											</div>
										</div>
									</div>
								</div>
							</section>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
