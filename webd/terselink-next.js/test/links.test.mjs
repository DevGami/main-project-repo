import test from "node:test"
import assert from "node:assert/strict"

import {
  generateAlias,
  normalizeAlias,
  validateAlias,
  validateCreateLinkInput,
  validateDestination,
} from "../lib/links.mjs"

test("normalizes aliases", () => {
  assert.equal(normalizeAlias("  My-Link  "), "my-link")
})

test("accepts valid aliases and rejects reserved or unsafe values", () => {
  assert.deepEqual(validateAlias("My-Link"), { value: "my-link" })
  assert.match(validateAlias("api").error, /reserved/)
  assert.match(validateAlias("bad/slug").error, /lowercase letters/)
  assert.match(validateAlias("ab").error, /between 3 and 48/)
})

test("allows an omitted custom alias", () => {
  assert.deepEqual(validateAlias("", { optional: true }), { value: "" })
})

test("validates and normalizes destination URLs", () => {
  assert.deepEqual(validateDestination("https://example.com/path"), {
    value: "https://example.com/path",
  })
  assert.match(validateDestination("javascript:alert(1)").error, /http/)
  assert.match(validateDestination("https://user:pass@example.com").error, /credentials/)
  assert.match(validateDestination("example.com").error, /complete URL/)
})

test("validates complete API input", () => {
  assert.deepEqual(
    validateCreateLinkInput({
      url: "https://example.com",
      shorturl: "Docs-Link",
    }),
    {
      value: {
        url: "https://example.com/",
        shorturl: "docs-link",
      },
    }
  )
  assert.match(validateCreateLinkInput({}).error, /destination URL/)
  assert.match(validateCreateLinkInput([]).error, /JSON object/)
})

test("generates URL-safe aliases with sufficient entropy", () => {
  const aliases = new Set(Array.from({ length: 100 }, generateAlias))
  assert.equal(aliases.size, 100)

  for (const alias of aliases) {
    assert.match(alias, /^[a-z0-9]+$/)
    assert.ok(alias.length >= 6)
  }
})
