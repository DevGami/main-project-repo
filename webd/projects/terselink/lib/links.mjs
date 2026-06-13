import { randomBytes } from "node:crypto";

export const RESERVED_ALIASES = new Set([
  "_next",
  "about",
  "api",
  "contact",
  "favicon.ico",
  "github",
  "robots.txt",
  "shorten",
  "sitemap.xml",
]);

const MAX_URL_LENGTH = 2048;
const MIN_ALIAS_LENGTH = 3;
const MAX_ALIAS_LENGTH = 48;
const ALIAS_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export function generateAlias() {
  return randomBytes(5).toString("hex").slice(0, 8);
}

export function normalizeAlias(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validateAlias(value, { optional = false } = {}) {
  const alias = normalizeAlias(value);

  if (!alias && optional) {
    return { value: "" };
  }

  if (!alias) {
    return { error: "Enter a custom alias or leave it blank for an automatic one." };
  }

  if (alias.length < MIN_ALIAS_LENGTH || alias.length > MAX_ALIAS_LENGTH) {
    return {
      error: `Aliases must be between ${MIN_ALIAS_LENGTH} and ${MAX_ALIAS_LENGTH} characters.`,
    };
  }

  if (!ALIAS_PATTERN.test(alias)) {
    return {
      error: "Aliases may contain lowercase letters, numbers, and hyphens.",
    };
  }

  if (RESERVED_ALIASES.has(alias)) {
    return { error: "That alias is reserved by TerseLink." };
  }

  return { value: alias };
}

export function validateDestination(value) {
  if (typeof value !== "string" || !value.trim()) {
    return { error: "Enter a destination URL." };
  }

  const destination = value.trim();

  if (destination.length > MAX_URL_LENGTH) {
    return { error: `URLs must be ${MAX_URL_LENGTH} characters or fewer.` };
  }

  let parsed;
  try {
    parsed = new URL(destination);
  } catch {
    return { error: "Enter a complete URL beginning with http:// or https://." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { error: "Only http:// and https:// URLs are supported." };
  }

  if (parsed.username || parsed.password) {
    return { error: "URLs containing embedded credentials are not supported." };
  }

  return { value: parsed.toString() };
}

export function validateCreateLinkInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object." };
  }

  const destination = validateDestination(body.url);
  if (destination.error) {
    return destination;
  }

  const alias = validateAlias(body.shorturl, { optional: true });
  if (alias.error) {
    return alias;
  }

  return {
    value: {
      url: destination.value,
      shorturl: alias.value,
    },
  };
}
