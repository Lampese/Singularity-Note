import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  title?: string;
};

export function BrandLogo({ className, title }: BrandLogoProps) {
  const isDecorative = !title;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="8 4 184 152"
      fill="none"
      stroke="currentColor"
      strokeMiterlimit="8"
      strokeWidth="2.5"
      shapeRendering="geometricPrecision"
      className={cn("text-text", className)}
      role={isDecorative ? "presentation" : "img"}
      aria-hidden={isDecorative}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <g>
        <line x1="10" y1="80" x2="190" y2="80" />
        <path d="M40,66 L100,6 L160,66" />
        <line x1="27" y1="66" x2="53" y2="66" />
        <line x1="147" y1="66" x2="173" y2="66" />
        <path d="M40,94 L100,154 L160,94" />
        <line x1="70" y1="123" x2="130" y2="123" />
      </g>
    </svg>
  );
}

