function normalizeFenceMarker(line: string): "```" | "~~~" | null {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("```")) return "```";
  if (trimmed.startsWith("~~~")) return "~~~";
  return null;
}

function normalizeFenceLanguage(line: string, marker: "```" | "~~~"): string {
  return line
    .trimStart()
    .slice(marker.length)
    .trim()
    .toLowerCase();
}

export function closeOpenMermaidFenceForStreaming(content: string): string {
  const lines = content.split("\n");
  let openFence: { marker: "```" | "~~~"; language: string } | null = null;

  for (const line of lines) {
    const marker = normalizeFenceMarker(line);
    if (!marker) {
      continue;
    }

    if (!openFence) {
      openFence = {
        marker,
        language: normalizeFenceLanguage(line, marker),
      };
      continue;
    }

    if (line.trimStart().startsWith(openFence.marker)) {
      openFence = null;
    }
  }

  if (!openFence || openFence.language !== "mermaid") {
    return content;
  }

  return `${content}\n${openFence.marker}`;
}
