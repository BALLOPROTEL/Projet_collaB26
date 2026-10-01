const target = process.env.PERF_URL ?? "http://localhost:3000/api/catalog";
const totalRequests = Number(process.env.PERF_REQUESTS ?? 300);
const concurrency = Number(process.env.PERF_CONCURRENCY ?? 20);
const p95ThresholdMs = Number(process.env.PERF_P95_MS ?? 1000);
const minimumRps = Number(process.env.PERF_MIN_RPS ?? 5);

const latencies = [];
let failures = 0;
let nextRequest = 0;

async function worker() {
  while (true) {
    const index = nextRequest;
    nextRequest += 1;

    if (index >= totalRequests) return;

    const started = performance.now();

    try {
      const response = await fetch(target, {
        headers: { "x-performance-test": "collector-shop" }
      });

      await response.arrayBuffer();

      if (!response.ok) {
        failures += 1;
      }
    } catch (error) {
      failures += 1;
      console.error(`Request ${index + 1} failed:`, error.message);
    } finally {
      latencies.push(performance.now() - started);
    }
  }
}

const startedAt = performance.now();

await Promise.all(
  Array.from(
    { length: Math.min(concurrency, totalRequests) },
    () => worker()
  )
);

const elapsedMs = performance.now() - startedAt;
latencies.sort((a, b) => a - b);

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const index = Math.min(
    values.length - 1,
    Math.ceil(values.length * ratio) - 1
  );
  return values[index];
}

const p50 = percentile(latencies, 0.5);
const p95 = percentile(latencies, 0.95);
const p99 = percentile(latencies, 0.99);
const rps = totalRequests / (elapsedMs / 1000);

console.log("");
console.log("=== Collector.shop performance smoke ===");
console.log(`Target       : ${target}`);
console.log(`Requests     : ${totalRequests}`);
console.log(`Concurrency  : ${concurrency}`);
console.log(`Failures     : ${failures}`);
console.log(`Duration     : ${elapsedMs.toFixed(0)} ms`);
console.log(`Throughput   : ${rps.toFixed(2)} req/s`);
console.log(`p50 latency  : ${p50.toFixed(2)} ms`);
console.log(`p95 latency  : ${p95.toFixed(2)} ms`);
console.log(`p99 latency  : ${p99.toFixed(2)} ms`);
console.log(`Threshold p95: <= ${p95ThresholdMs} ms`);
console.log(`Minimum RPS  : >= ${minimumRps}`);
console.log("");

if (failures > 0) {
  console.error("PERFORMANCE TEST: FAIL — des requêtes ont échoué.");
  process.exit(1);
}

if (p95 > p95ThresholdMs) {
  console.error("PERFORMANCE TEST: FAIL — p95 au-dessus du seuil.");
  process.exit(1);
}

if (rps < minimumRps) {
  console.error("PERFORMANCE TEST: FAIL — débit trop faible.");
  process.exit(1);
}

console.log("PERFORMANCE TEST: PASS");
