import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: false, linkify: false, breaks: false }).disable("image");

// Open links in a new tab
const defaultLinkOpen
  = md.renderer.rules.link_open
    ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx]!.attrSet("target", "_blank");
  tokens[idx]!.attrSet("rel", "noopener noreferrer");
  return defaultLinkOpen(tokens, idx, options, env, self);
};

export function renderMarkdown(source: string) {
  return md.render(source);
}
