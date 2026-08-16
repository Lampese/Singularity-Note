"use client";

import { useEffect } from "react";

const INLINE_DELIMITERS: readonly [string, string] = ["$", "$"];
const DISPLAY_DELIMITERS: readonly [string, string] = ["$$", "$$"];

function closestKatex(node: Node | null): Element | null {
  const element = node instanceof Element ? node : node?.parentElement ?? null;
  return element?.closest(".katex") ?? null;
}

function replaceKatexWithTex(fragment: DocumentFragment): DocumentFragment {
  const katexHtml = fragment.querySelectorAll(".katex-mathml + .katex-html");
  for (const element of katexHtml) {
    element.remove();
  }

  const katexMathml = fragment.querySelectorAll(".katex-mathml");
  for (const element of katexMathml) {
    const annotation = element.querySelector("annotation");
    if (!annotation) {
      continue;
    }

    const replacement = annotation.cloneNode(true) as Element;
    replacement.textContent = `${INLINE_DELIMITERS[0]}${annotation.textContent ?? ""}${INLINE_DELIMITERS[1]}`;
    element.replaceWith(replacement);
  }

  const displayAnnotations = fragment.querySelectorAll(".katex-display annotation");
  for (const annotation of displayAnnotations) {
    const content = annotation.textContent ?? "";
    const inlineWrapped =
      content.startsWith(INLINE_DELIMITERS[0]) && content.endsWith(INLINE_DELIMITERS[1]);
    if (!inlineWrapped) {
      continue;
    }
    annotation.textContent = `${DISPLAY_DELIMITERS[0]}${content.slice(
      INLINE_DELIMITERS[0].length,
      content.length - INLINE_DELIMITERS[1].length,
    )}${DISPLAY_DELIMITERS[1]}`;
  }

  return fragment;
}

export function KaTeXCopyTexBridge() {
  useEffect(() => {
    const onCopy = (event: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !event.clipboardData) {
        return;
      }

      const range = selection.getRangeAt(0).cloneRange();
      const startKatex = closestKatex(range.startContainer);
      if (startKatex) {
        range.setStartBefore(startKatex);
      }

      const endKatex = closestKatex(range.endContainer);
      if (endKatex) {
        range.setEndAfter(endKatex);
      }

      const fragment = range.cloneContents();
      if (!fragment.querySelector(".katex-mathml")) {
        return;
      }

      const htmlContents = Array.from(fragment.childNodes)
        .map((node) => (node instanceof Text ? node.textContent ?? "" : (node as Element).outerHTML ?? ""))
        .join("");

      event.clipboardData.setData("text/html", htmlContents);
      event.clipboardData.setData("text/plain", replaceKatexWithTex(fragment).textContent ?? "");
      event.preventDefault();
    };

    document.addEventListener("copy", onCopy);
    return () => {
      document.removeEventListener("copy", onCopy);
    };
  }, []);

  return null;
}
