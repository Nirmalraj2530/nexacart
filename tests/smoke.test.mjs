import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { formatCurrency, isDummyPlaceholder, truncateText } from "../src/utils/formatters.js";
import nextConfig from "../next.config.mjs";

describe("NexaCart Project Sanity & Smoke Suite", () => {
  describe("Package & Project Integrity", () => {
    it("package.json exists and defines required npm scripts", () => {
      const pkgPath = path.resolve(process.cwd(), "package.json");
      assert.ok(fs.existsSync(pkgPath), "package.json should exist");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      assert.equal(pkg.name, "nexacart");
      assert.ok(pkg.scripts.dev, "scripts.dev must be defined");
      assert.ok(pkg.scripts.build, "scripts.build must be defined");
      assert.ok(pkg.scripts.lint, "scripts.lint must be defined");
      assert.ok(pkg.scripts.test, "scripts.test must be defined");
    });

    it("verifies critical project directories exist", () => {
      const dirs = ["src/app", "src/components", "src/redux", "src/utils"];
      for (const dir of dirs) {
        const fullPath = path.resolve(process.cwd(), dir);
        assert.ok(fs.existsSync(fullPath), `Directory ${dir} must exist`);
      }
    });

    it("verifies Next.js config contains valid redirects array", async () => {
      assert.ok(nextConfig, "next.config.mjs must export a config object");
      assert.equal(typeof nextConfig.redirects, "function", "nextConfig.redirects should be a function");
      const redirects = await nextConfig.redirects();
      assert.ok(Array.isArray(redirects), "redirects must return an array");
      assert.ok(redirects.length > 0, "should have configured redirects");
      const hasProductRedirect = redirects.some((r) => r.source === "/product/:id");
      assert.ok(hasProductRedirect, "redirect for /product/:id must exist");
    });
  });

  describe("Utility & Formatter Tests", () => {
    it("formatCurrency formats positive numbers correctly in USD", () => {
      const result = formatCurrency(49.99);
      assert.match(result, /\$49\.99/);
    });

    it("formatCurrency handles zero and missing values safely", () => {
      const resultZero = formatCurrency(0);
      assert.match(resultZero, /\$0\.00/);
      const resultNull = formatCurrency(null);
      assert.match(resultNull, /\$0\.00/);
    });

    it("isDummyPlaceholder identifies mock or broken domains", () => {
      assert.equal(isDummyPlaceholder("https://placehold.co/600x400"), true);
      assert.equal(isDummyPlaceholder("https://via.placeholder.com/150"), true);
      assert.equal(isDummyPlaceholder("https://images.unsplash.com/photo-1542291026-7eec264c27ff"), false);
      assert.equal(isDummyPlaceholder(""), true);
      assert.equal(isDummyPlaceholder(null), true);
    });

    it("truncateText truncates text over limit and appends ellipsis", () => {
      const text = "A quick brown fox jumps over the lazy dog";
      const truncated = truncateText(text, 15);
      assert.ok(truncated.endsWith("..."));
      assert.ok(truncated.length <= 18);
      assert.equal(truncateText("Short", 20), "Short");
    });
  });
});
