import { useEditableContent } from "@/context/EditableContentContext";
import { defaultTheme } from "@/lib/editable-content-defaults";
import type { EditableTheme } from "@/types/editable-content";

function buildCssVars(theme: EditableTheme): string {
  const t = theme ?? defaultTheme;
  return [
    `--background: ${t.colors.background};`,
    `--foreground: ${t.colors.foreground};`,
    `--primary: ${t.colors.primary};`,
    `--secondary: ${t.colors.secondary};`,
    `--muted: ${t.colors.muted};`,
    `--border: ${t.colors.border};`,
    `--accent: ${t.colors.accent};`,
    `--radius: ${t.radius};`,
    `--font-body: ${t.fonts.body};`,
    `--font-display: ${t.fonts.display};`,
    `--font-size-hero: ${t.fontSize.heroTitle};`,
    `--font-size-section: ${t.fontSize.sectionTitle};`,
    `--font-size-body: ${t.fontSize.body};`,
    `--section-padding: ${t.spacing.sectionPadding};`,
    `--content-max-width: ${t.spacing.contentMaxWidth};`,
  ].join("\n  ");
}

export function ThemeInjector() {
  const { current } = useEditableContent();
  const theme = current.theme ?? defaultTheme;
  const css = `:root {\n  ${buildCssVars(theme)}\n}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
