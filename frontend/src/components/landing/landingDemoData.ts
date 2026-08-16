export type HeroMockResource = {
  id: string;
  title: string;
  kind: string;
  meta: string;
  status: "ready" | "indexing";
};

export type HeroMockToolStep = {
  id: string;
  kind:
    | "reasoning"
    | "material_search"
    | "paper_search"
    | "material_open"
    | "clarify"
    | "save_result"
    | "web_lookup";
  label: string;
  detail: string;
  /** 该步骤完成后额外停顿的毫秒数，默认 0 */
  pauseAfterMs?: number;
};

export type HeroMockEvidence = {
  id: string;
  label: string;
  locator: string;
  snippet: string;
};

export type HeroMockArtifact = {
  title: string;
  bullets: string[];
};

export type HeroMockScenario = {
  id: string;
  tabLabel: string;
  workspaceLabel: string;
  selectedResourceId: string;
  resources: HeroMockResource[];
  draftPrompt: string;
  runTitle: string;
  runSummary: string;
  tools: HeroMockToolStep[];
  streamingStatus: string;
  answer: string;
  followUp?: string;
  evidence: HeroMockEvidence[];
  selectedEvidenceId: string;
  artifact?: HeroMockArtifact;
  pushedFiles?: {
    filename: string;
    sizeBytes?: number;
    path?: string;
  }[];
  inlineImages?: {
    image_handle: string;
    source_type: "artifact" | "resource";
    filename: string;
    mime_type: string;
    preview_url: string;
  }[];
  askUser?: {
    question: string;
    options: string[];
    selected: string;
  };
  composerHints: string[];
};

export type DemoStageSize = "medium" | "tall";

export type FeatureDemoId = "multimodal" | "flashcard" | "agent_code" | "web_lookup" | "long_file" | "tech_stack";

export type WebSearchScenario = {
  id: string;
  label: string;
  query: string;
  statusSummary: string;
  results: {
    title: string;
    url: string;
    snippet: string;
  }[];
};

export type LandingFeatureStory = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  actionNote: string;
  alignment: "left" | "right";
  interactionLabel: string;
  footerNote: string;
  demoId: FeatureDemoId;
  stageSize: DemoStageSize;
};

const sharedResources: HeroMockResource[] = [
  {
    id: "notes",
    title: "Calculus-Week07.pdf",
    kind: "讲义",
    meta: "2.4 MB · 36 页",
    status: "ready",
  },
  {
    id: "slides",
    title: "Heat-Equation.pptx",
    kind: "课件",
    meta: "8.1 MB · 54 页",
    status: "ready",
  },
  {
    id: "board",
    title: "board-proof.png",
    kind: "白板图片",
    meta: "1.7 MB",
    status: "ready",
  },
  {
    id: "video",
    title: "week07-lecture.mp4",
    kind: "课堂录像",
    meta: "246 MB · 48 分钟",
    status: "ready",
  },
];

const FOURIER_ODD_EXTENSION_IMAGE = (() => {
  const W = 720;
  const H = 400;
  const ox = 360;
  const oy = 200;
  const scaleX = 80;
  const scaleY = 100;
  const L = Math.PI;

  const sampleSine = (count: number, xMin: number, xMax: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= count; i++) {
      const t = xMin + (xMax - xMin) * (i / count);
      const px = ox + t * scaleX;
      const py = oy - Math.sin(t) * scaleY;
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const originalPts = sampleSine(64, 0, L);
  const mirrorPts = sampleSine(64, -L, 0);

  const xLeft = ox - L * scaleX - 20;
  const xRight = ox + L * scaleX + 20;
  const yTop = oy - scaleY - 40;
  const yBottom = oy + scaleY + 40;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d1520"/>
      <stop offset="100%" stop-color="#141e2c"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" rx="24" fill="url(#bgGrad)"/>

  <!-- grid lines -->
  ${[0.25, 0.5, 0.75, 1].map((f) => {
    const yPos = oy - f * scaleY;
    const yNeg = oy + f * scaleY;
    return `<line x1="${xLeft}" y1="${yPos}" x2="${xRight}" y2="${yPos}" stroke="#7cc6ff" stroke-width="0.5" opacity="0.12"/>
    <line x1="${xLeft}" y1="${yNeg}" x2="${xRight}" y2="${yNeg}" stroke="#7cc6ff" stroke-width="0.5" opacity="0.12"/>`;
  }).join("\n  ")}

  <!-- axes -->
  <line x1="${xLeft}" y1="${oy}" x2="${xRight}" y2="${oy}" stroke="#7cc6ff" stroke-width="1.5" opacity="0.5"/>
  <line x1="${ox}" y1="${yTop}" x2="${ox}" y2="${yBottom}" stroke="#7cc6ff" stroke-width="1.5" opacity="0.5"/>
  <!-- axis arrows -->
  <polygon points="${xRight},${oy} ${xRight - 8},${oy - 4} ${xRight - 8},${oy + 4}" fill="#7cc6ff" opacity="0.5"/>
  <polygon points="${ox},${yTop} ${ox - 4},${yTop + 8} ${ox + 4},${yTop + 8}" fill="#7cc6ff" opacity="0.5"/>

  <!-- tick marks -->
  <line x1="${ox + L * scaleX}" y1="${oy - 5}" x2="${ox + L * scaleX}" y2="${oy + 5}" stroke="#7cc6ff" stroke-width="1" opacity="0.4"/>
  <line x1="${ox - L * scaleX}" y1="${oy - 5}" x2="${ox - L * scaleX}" y2="${oy + 5}" stroke="#7cc6ff" stroke-width="1" opacity="0.4"/>

  <!-- original f(x) on [0, L] -->
  <polyline points="${originalPts}" fill="none" stroke="#ffd166" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>

  <!-- odd extension on [-L, 0] -->
  <polyline points="${mirrorPts}" fill="none" stroke="#67e8a5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8 4" filter="url(#glow)"/>

  <!-- origin dot -->
  <circle cx="${ox}" cy="${oy}" r="4" fill="#e5eef5" opacity="0.9"/>

  <!-- labels -->
  <text x="${ox + L * scaleX}" y="${oy + 24}" fill="#ffd166" font-size="14" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">L</text>
  <text x="${ox - L * scaleX}" y="${oy + 24}" fill="#67e8a5" font-size="14" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">−L</text>
  <text x="${ox + 14}" y="${yTop + 16}" fill="#e5eef5" font-size="13" font-family="system-ui, sans-serif" opacity="0.7">y</text>
  <text x="${xRight - 4}" y="${oy - 10}" fill="#e5eef5" font-size="13" font-family="system-ui, sans-serif" text-anchor="end" opacity="0.7">x</text>

  <!-- curve labels -->
  <text x="${ox + L * scaleX * 0.55}" y="${oy - scaleY - 12}" fill="#ffd166" font-size="15" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">f(x) = sin(x)</text>
  <text x="${ox - L * scaleX * 0.55}" y="${oy + scaleY + 28}" fill="#67e8a5" font-size="15" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">odd extension: −f(−x)</text>

  <!-- symmetry annotation -->
  <text x="${ox}" y="${H - 24}" fill="#9fb0c3" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" opacity="0.75">关于原点对称 · 边界条件与 sine basis 自然对齐</text>

  <!-- symmetry hint arrows -->
  <line x1="${ox + 18}" y1="${oy - 14}" x2="${ox + 50}" y2="${oy - 50}" stroke="#e5eef5" stroke-width="0.8" opacity="0.3" stroke-dasharray="3 3"/>
  <line x1="${ox - 18}" y1="${oy + 14}" x2="${ox - 50}" y2="${oy + 50}" stroke="#e5eef5" stroke-width="0.8" opacity="0.3" stroke-dasharray="3 3"/>
  <text x="${ox + 54}" y="${oy - 54}" fill="#e5eef5" font-size="11" font-family="system-ui, sans-serif" opacity="0.5">f(0⁺)</text>
  <text x="${ox - 54}" y="${oy + 64}" fill="#e5eef5" font-size="11" font-family="system-ui, sans-serif" text-anchor="end" opacity="0.5">−f(0⁻)</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
})();

const PDE_TIMELINE_IMAGE = (() => {
  const W = 780;
  const H = 380;
  const axisY = 190;

  type Milestone = {
    year: string;
    label: string;
    sub: string;
    color: string;
    x: number;
    side: "above" | "below";
  };

  const milestones: Milestone[] = [
    { year: "1822", label: "Fourier", sub: "热传导解析解", color: "#ffd166", x: 90, side: "above" },
    { year: "1969", label: "Spectral", sub: "全局基底数值逼近", color: "#7cc6ff", x: 240, side: "below" },
    { year: "2019", label: "PINN", sub: "物理约束神经网络", color: "#67e8a5", x: 410, side: "above" },
    { year: "2021", label: "FNO", sub: "频域算子学习", color: "#cda6ff", x: 560, side: "below" },
    { year: "2024", label: "Foundation", sub: "多任务预训练求解", color: "#ff8a7a", x: 700, side: "above" },
  ];

  const renderMilestone = (m: Milestone) => {
    const above = m.side === "above";
    const yearY = above ? axisY - 72 : axisY + 58;
    const labelY = above ? axisY - 52 : axisY + 78;
    const subY = above ? axisY - 36 : axisY + 94;
    const stemTop = above ? axisY - 28 : axisY + 10;
    const stemBot = above ? axisY - 10 : axisY + 44;

    return `
    <circle cx="${m.x}" cy="${axisY}" r="5.5" fill="${m.color}" filter="url(#dotGlow)" opacity="0.9"/>
    <circle cx="${m.x}" cy="${axisY}" r="2.5" fill="#fff" opacity="0.85"/>
    <line x1="${m.x}" y1="${stemTop}" x2="${m.x}" y2="${stemBot}" stroke="${m.color}" stroke-width="1" opacity="0.35"/>
    <text x="${m.x}" y="${yearY}" fill="${m.color}" font-size="12" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="700">${m.year}</text>
    <text x="${m.x}" y="${labelY}" fill="#e5eef5" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">${m.label}</text>
    <text x="${m.x}" y="${subY}" fill="#9fb0c3" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">${m.sub}</text>`;
  };

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="tlBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d1520"/>
      <stop offset="100%" stop-color="#141e2c"/>
    </linearGradient>
    <filter id="dotGlow">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" rx="24" fill="url(#tlBg)"/>

  <!-- title -->
  <text x="${W / 2}" y="36" fill="#e5eef5" font-size="15" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600" letter-spacing="0.04em">Fourier → 神经算子：PDE 求解方法演进</text>

  <!-- axis -->
  <line x1="50" y1="${axisY}" x2="${W - 24}" y2="${axisY}" stroke="#7cc6ff" stroke-width="1.2" opacity="0.25"/>
  <polygon points="${W - 24},${axisY} ${W - 32},${axisY - 3.5} ${W - 32},${axisY + 3.5}" fill="#7cc6ff" opacity="0.25"/>

  <!-- milestones -->
  ${milestones.map(renderMilestone).join("\n")}

  <!-- connecting arcs -->
  ${milestones
    .slice(0, -1)
    .map((m, i) => {
      const next = milestones[i + 1];
      const midX = (m.x + next.x) / 2;
      return `<path d="M${m.x + 7} ${axisY} Q${midX} ${axisY - 14} ${next.x - 7} ${axisY}" fill="none" stroke="#7cc6ff" stroke-width="0.7" opacity="0.12"/>`;
    })
    .join("\n  ")}

  <!-- bottom note -->
  <text x="${W / 2}" y="${H - 20}" fill="#9fb0c3" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" opacity="0.6">从解析方法到数据驱动 · 基于学术搜索与网络搜索整理</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
})();

export const heroMockScenarios: HeroMockScenario[] = [
  {
    id: "survey-timeline",
    tabLabel: "论文调研",
    workspaceLabel: "Calculus / Fourier",
    selectedResourceId: "notes",
    resources: sharedResources,
    draftPrompt:
      "用 Fourier 方法解 PDE 最近几年有什么新进展？帮我画个时间线，课程论文要用",
    runTitle: "论文调研 + 脉络可视化",
    runSummary: "先搜学术论文，再补最新网络动态，把脉络整理成时间线图回写到工作区。",
    tools: [
      {
        id: "survey-think",
        kind: "reasoning",
        label: "分析问题",
        detail: "需要覆盖经典方法 + 近年深度学习进展，计划分两轮搜索。",
        pauseAfterMs: 400,
      },
      {
        id: "survey-academic-1",
        kind: "paper_search",
        label: "论文检索",
        detail: "第一轮：检索 Fourier PDE solver 相关论文，命中 14 篇。",
        pauseAfterMs: 200,
      },
      {
        id: "survey-academic-2",
        kind: "paper_search",
        label: "论文检索",
        detail: "第二轮：围绕 FNO 和 neural operator 补充检索，新增 9 篇。",
        pauseAfterMs: 300,
      },
      {
        id: "survey-web",
        kind: "web_lookup",
        label: "网络检索",
        detail: "搜索 2024–2025 最新预印本和开源 benchmark。",
      },
      {
        id: "survey-retrieval",
        kind: "material_search",
        label: "资料检索",
        detail: "回到讲义定位 Fourier 方法基础章节，匹配 3 处证据。",
      },
      {
        id: "survey-push-timeline",
        kind: "save_result",
        label: "保存结果",
        detail: "生成研究脉络时间线图并保存到工作区。",
      },
      {
        id: "survey-push-bib",
        kind: "save_result",
        label: "保存结果",
        detail: "导出参考文献列表 (BibTeX) 到工作区。",
      },
    ],
    streamingStatus: "思考中...",
    answer: [
      "经过两轮学术搜索和网络搜索，整理出从 Fourier 原始工作到现在的脉络：",
      "",
      "**经典阶段**：Fourier 1822 年提出用三角级数求解热方程 [6]，核心形式就是你熟悉的：",
      "",
      "$$u(x,t) = \\sum_{n=1}^{\\infty} b_n \\sin\\!\\left(\\frac{n\\pi x}{L}\\right) e^{-\\alpha (n\\pi/L)^2 t}$$",
      "",
      "这个方法很优雅，但只能处理线性、规则几何的问题。",
      "",
      "**数值阶段**：1960–70 年代 spectral methods 出现 [3]，用全局 Fourier/Chebyshev 基底做数值逼近，精度高但对复杂区域不灵活。",
      "",
      "**深度学习阶段**：2019 年 Raissi 等人提出 PINN [1]，核心思路是把 PDE 残差写进 loss：",
      "",
      "$$\\mathcal{L}_{\\text{PINN}} = \\|u_{\\theta} - u_{\\text{data}}\\|^2 + \\lambda\\|\\mathcal{N}[u_{\\theta}]\\|^2$$",
      "",
      "2021 年 Li 等人的 FNO [2] 更进一步，直接在频域学算子映射：",
      "",
      "$$v_{l+1}(x) = \\sigma\\!\\left(W_l\\, v_l(x) + \\mathcal{F}^{-1}\\!\\left(R_l \\cdot \\mathcal{F}(v_l)\\right)\\!(x)\\right)$$",
      "",
      "在 PDEBench [5] 上的评测显示，FNO 速度比传统数值方法快几个量级。",
      "",
      "**最新方向**：2024 年 Herde 等人发布 Poseidon [4]，在 15 种 PDE 上预训练，zero-shot 就能超过针对单任务训练的 FNO。",
      "",
      "[[image:1]]",
      "",
      "你课程论文如果要写 related work，建议按这条时间线组织，从经典方法讲到神经算子，重点放在 FNO 和后续工作上，因为这是目前最活跃的方向。",
    ].join("\n"),
    followUp: "可以继续问：FNO 和 PINN 的核心区别是什么？各自适合什么场景？",
    evidence: [
      {
        id: "survey-pinn",
        label: "PINN 奠基论文",
        locator: "Raissi, Perdikaris & Karniadakis, 2019 · J. Comput. Phys. 378:686–707",
        snippet: "Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations.",
      },
      {
        id: "survey-fno",
        label: "FNO",
        locator: "Li, Kovachki, Azizzadenesheli et al., 2021 · ICLR 2021",
        snippet: "Fourier Neural Operator for Parametric Partial Differential Equations. 提出在频域做全局卷积的参数化算子学习框架。",
      },
      {
        id: "survey-spectral",
        label: "Spectral Methods 综述",
        locator: "Canuto, Hussaini, Quarteroni & Zang, 2006 · Springer",
        snippet: "Spectral Methods: Fundamentals in Single Domains. 谱方法数值逼近的经典参考书。",
      },
      {
        id: "survey-poseidon",
        label: "Poseidon (2024)",
        locator: "Herde, Raonić, Rohner et al., 2024 · arXiv:2405.19101",
        snippet: "Poseidon: Efficient Foundation Models for PDEs. 首个在 15 种 PDE 上预训练的 foundation model，下游 zero-shot 表现超过 FNO。",
      },
      {
        id: "survey-web-bench",
        label: "PDEBench 评测",
        locator: "网络搜索 · pdebench.github.io",
        snippet: "开源 PDE 求解器 benchmark，覆盖 Burgers/Darcy/shallow-water 等方程，FNO 和 U-Net 为当前主要 baseline。",
      },
      {
        id: "survey-lecture-ref",
        label: "讲义 Fourier 基础",
        locator: "PDF · 第 8–10 页",
        snippet: "课程讲义中 Fourier 级数展开与热方程求解的基础推导，与文献中的经典方法对应。",
      },
    ],
    selectedEvidenceId: "survey-fno",
    artifact: {
      title: "参考文献速查",
      bullets: [
        "Raissi et al. (2019) — PINN, J. Comput. Phys.",
        "Li et al. (2021) — FNO, ICLR",
        "Herde et al. (2024) — Poseidon, arXiv",
        "评测：pdebench.github.io",
      ],
    },
    pushedFiles: [
      {
        filename: "pde-solver-timeline.png",
        sizeBytes: 312480,
        path: "/workspace/generated/pde-solver-timeline.png",
      },
      {
        filename: "references.bib",
        sizeBytes: 4720,
        path: "/workspace/generated/references.bib",
      },
    ],
    inlineImages: [
      {
        image_handle: "survey-timeline-chart",
        source_type: "artifact",
        filename: "pde-solver-timeline.png",
        mime_type: "image/svg+xml",
        preview_url: PDE_TIMELINE_IMAGE,
      },
    ],
    composerHints: ["学术搜索", "网络搜索", "继续追问"],
  },
  {
    id: "video-followup",
    tabLabel: "课堂录像追问",
    workspaceLabel: "Calculus / Fourier",
    selectedResourceId: "video",
    resources: sharedResources,
    draftPrompt:
      "这节课录像 12 分钟左右老师在黑板上画了个图，没看清，帮我找到那段讲了什么",
    runTitle: "视频驱动回答",
    runSummary: "先从视频时间轴定位关键帧，识别板书内容，再交叉比对讲义。",
    tools: [
      {
        id: "video-think",
        kind: "reasoning",
        label: "分析问题",
        detail: "需要先从视频时间轴定位 12 分钟附近的关键帧，再识别板书。",
        pauseAfterMs: 350,
      },
      {
        id: "video-retrieval",
        kind: "material_search",
        label: "资料检索",
        detail: "在视频转写文本中搜索 12:00–13:30 附近的语音内容。",
        pauseAfterMs: 200,
      },
      {
        id: "video-pull-frame",
        kind: "material_open",
        label: "打开资料",
        detail: "提取 12:14、12:38、13:01 三个关键帧，识别板书内容。",
        pauseAfterMs: 250,
      },
      {
        id: "video-pull-notes",
        kind: "material_open",
        label: "打开资料",
        detail: "读取讲义第 15–16 页，交叉比对板书和讲义内容。",
      },
      {
        id: "video-push",
        kind: "save_result",
        label: "保存结果",
        detail: "把关键帧截图和时间轴笔记保存到工作区。",
      },
    ],
    streamingStatus: "思考中...",
    answer: [
      "12:14 左右老师在黑板上画的是 odd extension 的镜像示意图 [1]。这段一共出现了三个关键画面：",
      "",
      "**12:14** — 先画了原函数 $f(x)$ 在 $[0, L]$ 上的波形，标注了边界条件 $f(0) = 0$。",
      "",
      "**12:38** — 沿原点做镜像，画出 $[-L, 0]$ 上的奇延拓 $f_{\\text{odd}}(-x) = -f(x)$，用虚线表示。这一步就是在说：先把函数的对称性定好，后面的 sine 基底才有意义。",
      "",
      "**13:01** — 在镜像图旁边写了展开式，强调只剩 sine 项 [2]：",
      "",
      "$$b_n = \\frac{2}{L}\\int_0^L f(x)\\sin\\!\\left(\\frac{n\\pi x}{L}\\right)dx$$",
      "",
      "这跟讲义第 15 页 [3] 的内容完全对得上。老师板书里多了一步：他特意画了「如果不做 odd extension、直接展开会混入 cosine 项」的对比，讲义里没有这个对比，但它恰好是最容易帮你建立直觉的部分。",
      "",
      "所以这段视频最值得回看的不是公式本身，而是 12:38 那张镜像对比图——它把「为什么只留 sine」这件事一张图就讲清楚了。",
    ].join("\n"),
    followUp: "可以继续问：13:01 之后老师讲的 even extension 对比是怎么回事？",
    evidence: [
      {
        id: "video-frame-12m14",
        label: "关键帧 · 原函数",
        locator: "视频 · 12:14",
        snippet: "老师画出 f(x) 在 [0, L] 上的波形，标注边界条件 f(0)=0，准备做奇延拓。",
      },
      {
        id: "video-frame-12m38",
        label: "关键帧 · 镜像对比",
        locator: "视频 · 12:38",
        snippet: "沿原点镜像画出虚线部分，强调 odd extension 后只保留 sine 项。",
      },
      {
        id: "video-notes-15",
        label: "讲义对应位置",
        locator: "PDF · 第 15 页",
        snippet: "先引入 mirrored interval，再推导 sine coefficients，与视频 12:38 的板书内容一致。",
      },
      {
        id: "video-transcript",
        label: "语音转写",
        locator: "视频 · 12:14–13:02 转写文本",
        snippet: "「你们看，如果不先做这个 extension，后面展开出来会多一堆 cosine 项，跟边界条件根本对不上。」",
      },
    ],
    selectedEvidenceId: "video-frame-12m38",
    artifact: {
      title: "视频笔记 · 12:14–13:01",
      bullets: [
        "12:14 — 原函数波形 + 边界条件标注",
        "12:38 — odd extension 镜像对比（最值得回看）",
        "13:01 — sine 系数展开式推导",
        "讲义第 15 页有对应内容，但缺少对比图",
      ],
    },
    pushedFiles: [
      {
        filename: "keyframes-12m14-13m01.zip",
        sizeBytes: 1842600,
        path: "/workspace/generated/keyframes-12m14-13m01.zip",
      },
      {
        filename: "video-notes-12min.md",
        sizeBytes: 3200,
        path: "/workspace/generated/video-notes-12min.md",
      },
    ],
    composerHints: ["视频定位", "关键帧", "继续追问"],
  },
  {
    id: "notes-followup",
    tabLabel: "讲义追问",
    workspaceLabel: "Calculus / Fourier",
    selectedResourceId: "notes",
    resources: sharedResources,
    draftPrompt:
      "讲义上这个 odd extension 到底在干嘛？为什么不能跳过？帮我画个图讲讲，再整个能复习的版本",
    runTitle: "基于讲义生成讲解",
    runSummary: "先检索讲义证据，再读取对应页码，把核心解释压成一段能继续追问的话。",
    tools: [
      {
        id: "notes-retrieval",
        kind: "material_search",
        label: "资料检索",
        detail: "从讲义证据里先收窄到 odd extension 相关页。",
        pauseAfterMs: 280,
      },
      {
        id: "notes-pull",
        kind: "material_open",
        label: "打开资料",
        detail: "读取讲义第 15–16 页上下文，绑定 PDF locator。",
        pauseAfterMs: 200,
      },
      {
        id: "notes-push",
        kind: "save_result",
        label: "保存结果",
        detail: "把这次生成的复习结论回写到工作区，方便后续继续追问。",
      },
    ],
    streamingStatus: "思考中...",
    answer:
      [
        "Odd extension 不是额外技巧，而是先把边界条件和后面的 sine basis 对齐。这样后面的 Fourier 展开从一开始就走在正确轨道上，不会混入不该出现的 cosine 项。",
        "",
        "如果只记一句话，可以记成：先把函数延拓成和边界条件一致的奇函数，后面才会自然只留下你真正想要的那组正弦基底。",
        "",
        "$$f_{\\text{odd}}(-x) = -f_{\\text{odd}}(x), \\qquad b_n = \\frac{2}{L}\\int_0^L f(x)\\sin\\left(\\frac{n\\pi x}{L}\\right)\\,dx$$",
        "",
        "[[image:1]]",
        "",
        "这张图想表达的直觉是：你不是在硬做一个镜像，而是在先把「函数怎么过边界」这件事定清楚。边界一旦定清楚，后面为什么只留下 sine 项，也就顺理成章了。",
        "",
        "所以老师反复强调 odd extension，并不是因为它形式特殊，而是因为它决定了后面整条推导链是不是从一开始就站在正确的基底上。你把这一步想通，后面的系数公式、边界条件和物理意义就会一起顺下来。",
      ].join("\n"),
    followUp: "继续追问：为什么一旦改成 even extension，后面的物理意义也会一起变化？",
    evidence: [
      {
        id: "notes-page-15",
        label: "odd extension 铺垫",
        locator: "PDF · 第 15 页",
        snippet: "先引入 mirrored interval，再推导 sine coefficients，让 basis 从一开始就和边界行为一致。",
      },
      {
        id: "notes-page-16",
        label: "为什么不能混入 cosine",
        locator: "PDF · 第 16 页",
        snippet: "一旦 odd extension 被固定，后续展开就会自然排除不该出现的 cosine 项。",
      },
    ],
    selectedEvidenceId: "notes-page-15",
    artifact: {
      title: "一分钟复习图",
      bullets: [
        "Odd extension 是为了先让 basis 和边界条件对齐。",
        "如果最后还残留 cosine 项，通常说明前面的设定已经偏了。",
        "下一轮追问可以围绕 even extension 的对比来记忆。",
      ],
    },
    pushedFiles: [
      {
        filename: "odd-extension-one-minute.png",
        sizeBytes: 284321,
        path: "/workspace/generated/odd-extension-one-minute.png",
      },
    ],
    inlineImages: [
      {
        image_handle: "notes-odd-extension-demo",
        source_type: "artifact",
        filename: "odd-extension-sketch.png",
        mime_type: "image/svg+xml",
        preview_url: FOURIER_ODD_EXTENSION_IMAGE,
      },
    ],
    composerHints: ["@资料引用", "retrieval", "继续追问"],
  },
];

export const landingFeatureStories: LandingFeatureStory[] = [
  {
    id: "upload-flow",
    eyebrow: "",
    title: "上传资料，直接提问",
    body:
      "支持解析文档、课件、图片、录音与视频等多种资料形式，配合前沿的视频与音频识别技术，让课堂现场第一次被真正结构化、可检索、可追问地接入学习流程。",
    actionNote:
      "讲义、课件、图片、录音和视频不再彼此割裂，而是汇成一个持续进化的学习上下文。",
    alignment: "right",
    interactionLabel: "看看资料如何进入上下文",
    footerNote: "上传之后，它们不只是文件，而是后续提问、整理和复习都能继续调用的知识入口。",
    demoId: "multimodal",
    stageSize: "medium",
  },
  {
    id: "flashcard-review",
    eyebrow: "",
    title: "自动生成记忆卡",
    body:
      "学完之后，记忆卡直接从你的资料和对话里生成，不用自己整理。复习间隔用 FSRS 算法按每张卡片单独计算，什么时候该复习、间隔多久，都不需要你操心。",
    actionNote: "FSRS：目前最好的开源间隔重复算法，复习效率远超传统固定间隔。",
    alignment: "right",
    interactionLabel: "体验一次复习",
    footerNote: "卡片从学习过程中来，复习节奏由算法定。",
    demoId: "flashcard",
    stageSize: "medium",
  },
  {
    id: "agent-code",
    eyebrow: "",
    title: "算不明白？它直接跑给你看",
    body:
      "遇到需要计算或画图的问题，Agent 会自己写代码、执行、生成图表，再把结果文件保存到工作区。答案直接算出来、画出来，你只管看结果。",
    actionNote: "写代码、执行、出图、回写文件——一个问题触发一整条工作流。",
    alignment: "right",
    interactionLabel: "看看怎么算",
    footerNote: "隔离的 Python 执行环境，数值计算、画图、数据处理都能跑。",
    demoId: "agent_code",
    stageSize: "tall",
  },
  {
    id: "web-search",
    eyebrow: "",
    title: "想多了解？直接帮你搜",
    body:
      "资料里一笔带过的东西，想深入看看，直接问就行。它会去网上和学术数据库里找，把有用的结果拿回来，跟你手头的资料放到一起看。",
    actionNote: "搜到的结果直接进入当前工作区，和你已有的资料一起用。",
    alignment: "right",
    interactionLabel: "看看怎么搜",
    footerNote: "网络搜索 + 学术论文检索，结果直接进工作区。",
    demoId: "web_lookup",
    stageSize: "tall",
  },
  {
    id: "long-file",
    eyebrow: "",
    title: "再长的资料，也能精确定位",
    body:
      "几十页的讲义、上百页的课件、几十分钟的课堂录像，上传之后会被自动切成可检索的证据单元。后续提问时直接定位到具体页码和段落，不用自己翻。",
    actionNote: "回答里引用的每一处内容，都带着原文出处，点进去就能看到。",
    alignment: "right",
    interactionLabel: "看看怎么定位",
    footerNote: "讲义、课件、录像都能处理，资料再多也不怕。",
    demoId: "long_file",
    stageSize: "medium",
  },
  {
    id: "tech-stack",
    eyebrow: "",
    title: "快，是我们的底线",
    body:
      "用新一代编程语言 MoonBit 重写了核心模块。打开快、搜索快、渲染快，你能感受到的每一步操作都比同类产品更流畅。",
    actionNote: "MoonBit 由知名编程语言专家张宏波主导设计，专门为这类高性能场景而生。",
    alignment: "right",
    interactionLabel: "了解技术栈",
    footerNote: "用得到的快，才是真的快。",
    demoId: "tech_stack",
    stageSize: "medium",
  },
];

export const groundedQuestions = [
  {
    id: "odd-extension",
    label: "odd extension",
    question: "为什么 odd extension 这一步不能跳过？",
    answer:
      "因为这一步决定了你后面用的 basis 是否和边界条件一致。Singularity Note 在回答时会把这个理由直接绑回讲义里的原句，不会只给你一个像对但不知出处的总结。",
    citation: {
      locator: "PDF · 第 15 页",
      snippet: "先引入 mirrored interval，再开始推导 sine coefficients。",
    },
  },
  {
    id: "heat-equation",
    label: "heat equation",
    question: "heat equation 为什么会在这一节里出现？",
    answer:
      "因为老师是在用 PDE 例子证明前面的 basis 选择不是抽象技巧，而是后续解题会真实依赖的结构。首页卡片里应该让学生一眼看出这个回答背后有具体 slide 支撑。",
    citation: {
      locator: "PPTX · 第 18 页",
      snippet: "这一页把同一套 basis expansion 接到了 PDE 例子上。",
    },
  },
];

export const webSearchScenarios: WebSearchScenario[] = [
  {
    id: "latest-paper",
    label: "最新论文",
    query: "2025 多模态学习助手 最新研究",
    statusSummary: "搜索完成 · 3 条结果",
    results: [
      {
        title: "Multimodal Tutors for STEM Learning in 2025",
        url: "https://example.org/research/multimodal-tutors-2025",
        snippet: "综述多模态学习助手如何同时结合文档、图像与语音输入，形成统一的教学反馈。",
      },
      {
        title: "Grounded Agent Workflows for Long Study Sessions",
        url: "https://example.org/research/grounded-agent-workflows",
        snippet: "讨论长文件检索、工具调用与学习任务编排如何提升持续学习体验。",
      },
      {
        title: "Retrieval-Centric Study Systems with Evidence Tracing",
        url: "https://example.org/research/evidence-tracing",
        snippet: "重点关注证据定位、长文档切片与可追溯解释在教育产品中的应用。",
      },
    ],
  },
  {
    id: "course-update",
    label: "课程更新",
    query: "Fourier series syllabus update boundary conditions",
    statusSummary: "搜索完成 · 2 条结果",
    results: [
      {
        title: "Boundary Condition Notes for Updated PDE Syllabus",
        url: "https://example.edu/pde/syllabus-update",
        snippet: "课程说明新增了 boundary condition 对不同展开方式的比较章节。",
      },
      {
        title: "Fourier Series Revision Guide",
        url: "https://example.edu/pde/revision-guide",
        snippet: "整理了 odd / even extension 在复习中的高频误区和对照记忆方法。",
      },
    ],
  },
];
