#!/usr/bin/env node

const BASE_URL = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

let passed = 0;
let failed = 0;

function pass(msg) {
  passed += 1;
  console.log(`[PASS] ${msg}`);
}

function fail(msg) {
  failed += 1;
  console.error(`[FAIL] ${msg}`);
}

async function checkHtml(path) {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  if (res.status !== 200) {
    fail(`${path} returned HTTP ${res.status}`);
    return;
  }
  const text = await res.text();
  if (!text || !text.includes("<html")) {
    fail(`${path} did not return HTML`);
    return;
  }
  pass(`${path} page reachable`);
}

async function checkApi(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (res.status !== 200) {
    fail(`${path} returned HTTP ${res.status}`);
    return;
  }
  const data = await res.json().catch(() => null);
  if (!data || data.ok !== true || !Array.isArray(data.workers)) {
    fail(`${path} invalid payload`);
    return;
  }
  pass(`${path} API ok (${data.workers.length} workers)`);
}

async function run() {
  console.log(`[INFO] Base URL: ${BASE_URL}`);
  await checkHtml("/mens");
  await checkHtml("/womens");
  await checkApi("/api/workers/by-gender/male");
  await checkApi("/api/workers/by-gender/female");

  console.log(`\n[SUMMARY] Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((error) => {
  fail(error.message || "Smoke test crashed");
  console.log(`\n[SUMMARY] Passed: ${passed}, Failed: ${failed}`);
  process.exit(1);
});
