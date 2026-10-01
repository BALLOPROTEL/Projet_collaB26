const target = process.env.PERF_URL ?? "http://localhost:3000/api/catalog";
const totalRequests = Number(process.env.PERF_REQUESTS ?? 300);
const concurrency = Number(process.env.PERF_CONCURRENCY ?? 20);
const warmupRequests = Number(process.env.PERF_WARMUP_REQUESTS ?? 30);
const p95ThresholdMs = Number(process.env.PERF_P95_MS ?? 1500);
const minimumRps = Number(process.env.PERF_MIN_RPS ?? 5);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTarget() {
  for (let attempt = 1; attempt <= 15; attempt += 1) {
    try {
      const response = await fetch(target, {
        headers: { "x-performance-test": "collector-shop-preflight" }
      });
      if (response.ok) {
        await response.arrayBuffer();
        return;
      }
    } catch {
      // La stack peut encore être en démarrage.
    }

    await sleep(1000);
  }

  console.error("");
  console.error("PERFORMANCE TEST: FAIL — cible indisponible.");
  console.error(`Vérifie d'abord que la stack tourne : ${target}`);
  console.error("Commande utile : docker compose up -d");
  process.exit(1);
}

async function runBatch(requests, workers, collectMetrics) {
  const latencies = [];
  let failures = 0;
  let nextRequest = 0;

  async function worker() {
    while (true) {
      const index = nextRequest;
      nextRequest += 1;

      if (index >= requests) return;

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
        if (collectMetrics) {
          console.error(`Request ${index + 1} failed:`, error.message);
        }
      } finally {
        if (collectMetrics) {
          latencies.push(performance.now() - started);
        }
      }
    }
  }

  const startedAt = performance.now();

  await Promise.all(
    Array.from(
      { length: Math.min(workers, requests) },
      () => worker()
    )
  );

  return {
    failures,
    latencies,
    elapsedMs: performance.now() - startedAt
  };
}

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const index = Math.min(
    values.length - 1,
    Math.ceil(values.length * ratio) - 1
  );
  return values[index];
}

await waitForTarget();

if (warmupRequests > 0) {
  console.log(`Warm-up      : ${warmupRequests} requêtes`);
  const warmup = await runBatch(
    warmupRequests,
    Math.min(concurrency, 10),
    false
  );

  if (warmup.failures > 0) {
    console.error("PERFORMANCE TEST: FAIL — le warm-up contient des erreurs.");
    process.exit(1);
  }
}

const result = await runBatch(totalRequests, concurrency, true);
result.latencies.sort((a, b) => a - b);

const p50 = percentile(result.latencies, 0.5);
const p95 = percentile(result.latencies, 0.95);
const p99 = percentile(result.latencies, 0.99);
const rps = totalRequests / (result.elapsedMs / 1000);

console.log("");
console.log("=== Collector.shop performance smoke ===");
console.log(`Target       : ${target}`);
console.log(`Warm-up      : ${warmupRequests}`);
console.log(`Requests     : ${totalRequests}`);
console.log(`Concurrency  : ${concurrency}`);
console.log(`Failures     : ${result.failures}`);
console.log(`Duration     : ${result.elapsedMs.toFixed(0)} ms`);
console.log(`Throughput   : ${rps.toFixed(2)} req/s`);
console.log(`p50 latency  : ${p50.toFixed(2)} ms`);
console.log(`p95 latency  : ${p95.toFixed(2)} ms`);
console.log(`p99 latency  : ${p99.toFixed(2)} ms`);
console.log(`Threshold p95: <= ${p95ThresholdMs} ms`);
console.log(`Minimum RPS  : >= ${minimumRps}`);
console.log("");

if (result.failures > 0) {
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
