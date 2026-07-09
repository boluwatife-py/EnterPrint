import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import {
  ContentSections,
  type ContentSection,
} from "@/components/marketing/content-sections";

export const metadata: Metadata = {
  title: "Design Guidelines — Preparing Artwork for Print | EnterPrint",
  description:
    "How to prepare print-ready artwork for EnterPrint: accepted file formats, resolution, colour mode, bleed, and safe margins for perfect results.",
};

const sections: ContentSection[] = [
  {
    heading: "Accepted file formats",
    paragraphs: [
      "For the best results, supply vector or high-resolution files. We accept the following formats for artwork upload:",
    ],
    bullets: [
      "PDF (print-ready, preferred)",
      "AI or EPS (vector artwork)",
      "PNG or JPG (high resolution only)",
      "SVG (logos and simple vector graphics)",
    ],
  },
  {
    heading: "Resolution",
    paragraphs: [
      "Raster images should be at least 300 DPI at final print size. Low-resolution files may look fine on screen but appear blurry or pixelated once printed. When in doubt, send us the largest file you have.",
    ],
  },
  {
    heading: "Colour mode",
    paragraphs: [
      "Set up artwork in CMYK for accurate print colour. Files supplied in RGB will be converted, which can cause slight colour shifts — especially in bright blues and greens. For exact brand colours, specify Pantone references.",
    ],
  },
  {
    heading: "Bleed & safe margins",
    paragraphs: [
      "Extend any background colour or imagery that reaches the edge by 3mm beyond the trim line (the bleed). Keep important text and logos at least 3mm inside the trim line (the safe area) so nothing critical gets cut off.",
    ],
  },
  {
    heading: "Fonts",
    paragraphs: [
      "Outline or embed all fonts before exporting, or supply the font files with your order. This ensures your text prints exactly as designed and avoids substitution.",
    ],
  },
  {
    heading: "Need a hand?",
    paragraphs: [
      "Not confident preparing print-ready files? Hire a vetted designer from our marketplace, or send us what you have and our team will advise before production begins.",
    ],
  },
];

export default function DesignGuidelinesPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Design guidelines"
        description="Follow these simple rules to make sure your artwork prints exactly the way you imagined it."
      />
      <ContentSections sections={sections} />
    </>
  );
}
