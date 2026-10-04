import test from "node:test";
import assert from "node:assert/strict";
import { sanitizePageview } from "../frontend/src/lib/analytics.ts";

test("page views strip all brief, player and fragment parameters without changing the source event", () => {
  const event = {
    type: "pageview",
    url: "https://scoutlens.blanchorizon.com/scout?team_id=arsenal&player=132098&compare=325443#profile",
  };
  assert.deepEqual(sanitizePageview(event), {
    type: "pageview",
    url: "https://scoutlens.blanchorizon.com/scout",
  });
  assert.ok(event.url.includes("player="));
});
test("only public page views are permitted", () => {
  for (const path of ["/", "/about", "/data"])
    assert.equal(
      sanitizePageview({
        type: "pageview",
        url: `https://scoutlens.blanchorizon.com${path}`,
      })?.type,
      "pageview",
    );
  for (const path of ["/api/docs", "/missing"])
    assert.equal(
      sanitizePageview({
        type: "pageview",
        url: `https://scoutlens.blanchorizon.com${path}`,
      }),
      null,
    );
  assert.equal(
    sanitizePageview({
      type: "event",
      url: "https://scoutlens.blanchorizon.com/scout",
    }),
    null,
  );
  assert.equal(sanitizePageview({ type: "pageview", url: "malformed" }), null);
});
