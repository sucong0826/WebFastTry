import { promises as fs } from "node:fs";
import path from "node:path";

const WORKSPACE_ROOT = process.cwd();
const LOGS_DIR = path.join(WORKSPACE_ROOT, "logs");
const REPORTS_DIR = path.join(WORKSPACE_ROOT, "reports");

function mean(arr) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function quantile(sortedArr, q) {
  if (!sortedArr.length) return null;
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedArr[base + 1] === undefined) return sortedArr[base];
  return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
}

function stats(arr) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const m = mean(sorted);
  const variance =
    sorted.reduce((acc, v) => acc + (v - m) * (v - m), 0) / sorted.length;
  return {
    n: sorted.length,
    mean: m,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p50: quantile(sorted, 0.5),
    p90: quantile(sorted, 0.9),
    p95: quantile(sorted, 0.95),
    p99: quantile(sorted, 0.99),
    stdev: Math.sqrt(variance),
  };
}

function parseFilename(file) {
  const base = path.basename(file, ".log");
  const parts = base.split("-");
  if (parts.length < 3) {
    return { platform: "unknown", runtime: "unknown", device: base };
  }
  const platform = parts[0];
  // Allow a few filename typos/aliases
  const runtimeRaw = parts[1];
  const runtime =
    runtimeRaw === "ttjs" ? "tfjs" : runtimeRaw;
  const device = parts.slice(2).join("-");
  return { platform, runtime, device };
}

function looksBinary(buf) {
  // Heuristic: treat as binary if it contains NUL bytes or very low printable ratio.
  let nul = 0;
  let printable = 0;
  const len = Math.min(buf.length, 64 * 1024);
  for (let i = 0; i < len; i++) {
    const c = buf[i];
    if (c === 0) nul++;
    // ASCII printable + common whitespace
    if ((c >= 0x20 && c <= 0x7e) || c === 0x0a || c === 0x0d || c === 0x09) printable++;
  }
  if (nul > 0) return true;
  const ratio = len ? printable / len : 1;
  return ratio < 0.6;
}

function parseTfjs(text) {
  const firstPredict = [];
  const avg = [];
  const fps = [];

  // Example:
  // tfjs-gpu:8 first predict_time = 277
  // tfjs-gpu:8 average execute time = 7.6, copy time = 5.53, pred time = 2.06
  // zlttf_test.js:87 Real fps: 14.85
  const reFirst = /first predict_time\s*=\s*([0-9]+(?:\.[0-9]+)?)/g;
  const reAvg =
    /average execute time\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*copy time\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*pred time\s*=\s*([0-9]+(?:\.[0-9]+)?)/g;
  const reFps = /Real fps:\s*([0-9]+(?:\.[0-9]+)?)/g;

  for (const m of text.matchAll(reFirst)) firstPredict.push(Number(m[1]));
  for (const m of text.matchAll(reAvg)) {
    avg.push({
      executeMs: Number(m[1]),
      copyMs: Number(m[2]),
      predMs: Number(m[3]),
    });
  }
  for (const m of text.matchAll(reFps)) fps.push(Number(m[1]));

  return { firstPredict, avg, fps };
}

function parseWebnn(text) {
  const execute = [];
  const avgExecute = [];
  const contextLogs = {
    createContextOptions: [],
    supportedContextOptions: [],
    devices: [],
    fallbacks: [],
    buildFailures: [],
  };

  // Parse line-by-line to avoid counting "average execute time" as "execute time".
  const lines = text.split(/\r?\n/);
  const reExecLine = /execute time\s*=\s*([0-9]+(?:\.[0-9]+)?)/;
  const reAvgLine = /average execute time\s*=\s*([0-9]+(?:\.[0-9]+)?)/;

  // Optional diagnostics we added in origin_nhwc.js
  const reCreateCtx = /WebNN createContext options:\s*(\{.*\})/g;
  const reSupported = /WebNN supported context options:\s*(\{.*\}|\[.*\])/g;
  const reDevices = /WebNN context devices:\s*(\[.*\])/g;
  const reFallback = /falling back to CPU:\s*(.*)$/gm;
  const reBuildFail = /WebNN build failed\. Operators used:\s*(\[.*\])$/gm;

  for (const line of lines) {
    if (line.includes("average execute time")) {
      const m = line.match(reAvgLine);
      if (m) avgExecute.push(Number(m[1]));
      continue;
    }
    if (line.includes("execute time")) {
      const m = line.match(reExecLine);
      if (m) execute.push(Number(m[1]));
    }
  }

  for (const m of text.matchAll(reCreateCtx)) contextLogs.createContextOptions.push(m[1]);
  for (const m of text.matchAll(reSupported)) contextLogs.supportedContextOptions.push(m[1]);
  for (const m of text.matchAll(reDevices)) contextLogs.devices.push(m[1]);
  for (const m of text.matchAll(reFallback)) contextLogs.fallbacks.push(m[1].trim());
  for (const m of text.matchAll(reBuildFail)) contextLogs.buildFailures.push(m[1]);

  return { execute, avgExecute, contextLogs };
}

function fmt(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toFixed(digits);
}

function htmlEscape(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildMarkdownReport(results) {
  const lines = [];
  lines.push("## TensorFlow.js vs WebNN 测试报告");
  lines.push("");
  lines.push(`- **生成时间**: ${new Date().toISOString()}`);
  lines.push(`- **日志目录**: \`logs/\``);
  lines.push(`- **可视化报告**: 打开 \`reports/benchmark-report.html\``);
  lines.push("");
  lines.push("### 结论摘要（按推理耗时）");
  lines.push("");
  lines.push(
    "- 以日志中打印的 `average execute time` / `execute time` 作为端到端推理耗时（包含一定的读回/同步开销）。"
  );
  lines.push("- TFJS 日志同时拆分了 **pred time** 与 **copy time**，WebNN 日志当前只有整体 execute time。");
  lines.push("- 当同一设备同时有 TFJS 与 WebNN 数据时，报告会给出 **speedup = TFJS_mean / WebNN_mean**（>1 表示 WebNN 更快）。");
  lines.push("");
  lines.push("#### 同设备对比（speedup）");
  lines.push("");
  lines.push("| 设备 | TFJS mean(ms) | WebNN mean(ms) | Speedup(TFJS/WebNN) |");
  lines.push("|---|---:|---:|---:|");
  for (const r of results) {
    const t = r.tfjs?.executeStats?.mean;
    const w = r.webnn?.executeStats?.mean;
    if (typeof t === "number" && typeof w === "number") {
      lines.push(`| ${r.platform}/${r.device} | ${fmt(t)} | ${fmt(w)} | ${fmt(t / w)} |`);
    }
  }
  lines.push("");
  lines.push("### 数据对比表（均值/分位数）");
  lines.push("");
  lines.push(
    "| 设备 | Runtime | 样本数 | 均值(ms) | P50 | P90 | P95 | P99 | 最小 | 最大 | 备注 |"
  );
  lines.push(
    "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|"
  );

  for (const r of results) {
    for (const runtime of ["tfjs", "webnn"]) {
      const d = r[runtime];
      const s = d?.executeStats;
      const note = d?.note ?? "";
      lines.push(
        `| ${r.platform}/${r.device} | ${runtime.toUpperCase()} | ${s?.n ?? 0} | ${fmt(
          s?.mean
        )} | ${fmt(s?.p50)} | ${fmt(s?.p90)} | ${fmt(s?.p95)} | ${fmt(s?.p99)} | ${fmt(
          s?.min
        )} | ${fmt(s?.max)} | ${note} |`
      );
    }
  }

  lines.push("");
  lines.push("### TFJS 细分（pred/copy）");
  lines.push("");
  lines.push(
    "| 设备 | first predict(ms) | execute mean(ms) | pred mean(ms) | copy mean(ms) | Real FPS mean |"
  );
  lines.push("|---|---:|---:|---:|---:|---:|");
  for (const r of results) {
    const tf = r.tfjs;
    if (!tf || tf.note) {
      lines.push(
        `| ${r.platform}/${r.device} | — | — | — | — | — |`
      );
      continue;
    }
    lines.push(
      `| ${r.platform}/${r.device} | ${fmt(tf.firstPredictStats?.mean, 0)} | ${fmt(
        tf.executeStats?.mean
      )} | ${fmt(tf.predStats?.mean)} | ${fmt(tf.copyStats?.mean)} | ${fmt(
        tf.fpsStats?.mean
      )} |`
    );
  }

  lines.push("");
  lines.push("### 说明与局限");
  lines.push("");
  lines.push("- **采样口径**：TFJS 的 `average execute time` 是按固定窗口（代码中通常每 30 帧）打印的平均值；WebNN 既有逐帧 `execute time` 也有窗口平均。");
  lines.push("- **ChromeOS TFJS 日志异常**：如果某个日志文件未包含可解析的指标，会在表格备注列标记，并在 HTML 报告中列出解析告警。");
  lines.push("- **二进制/不可解析日志**：如果日志不是纯文本（例如导出成 mhtml/二进制），需要从 DevTools Console 导出纯文本后再分析。");

  lines.push("");
  return lines.join("\n");
}

function buildHtmlReport(results, warnings) {
  const data = {
    generatedAt: new Date().toISOString(),
    results,
    warnings,
  };

  // Downsample helper: keep first N points or every k points to bound chart size
  const maxPoints = 400;
  const chartSeries = results.map((r) => {
    const series = [];
    if (r.tfjs?.executeSeries?.length) {
      const arr = r.tfjs.executeSeries;
      const step = Math.max(1, Math.ceil(arr.length / maxPoints));
      series.push({
        label: `${r.platform}/${r.device} TFJS`,
        runtime: "tfjs",
        points: arr.filter((_, i) => i % step === 0),
      });
    }
    if (r.webnn?.executeSeries?.length) {
      const arr = r.webnn.executeSeries;
      const step = Math.max(1, Math.ceil(arr.length / maxPoints));
      series.push({
        label: `${r.platform}/${r.device} WebNN`,
        runtime: "webnn",
        points: arr.filter((_, i) => i % step === 0),
      });
    }
    return { key: `${r.platform}/${r.device}`, series };
  });

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TFJS vs WebNN Benchmark Report</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 24px; color: #111; }
      h1, h2, h3 { margin: 0.4rem 0; }
      .muted { color: #555; }
      .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
      @media (min-width: 1000px) { .grid { grid-template-columns: 1fr 1fr; } }
      .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px; background: #fff; }
      table { border-collapse: collapse; width: 100%; font-size: 12.5px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: right; }
      th:first-child, td:first-child, th:nth-child(2), td:nth-child(2) { text-align: left; }
      code { background: #f3f4f6; padding: 0 4px; border-radius: 4px; }
      .warn { background: #fff7ed; border: 1px solid #fed7aa; padding: 8px 10px; border-radius: 8px; }
      canvas { max-height: 380px; }
      .small { font-size: 12px; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  </head>
  <body>
    <h1>TensorFlow.js vs WebNN 测试报告</h1>
    <div class="muted small">生成时间：${htmlEscape(data.generatedAt)}</div>
    <div class="muted small">数据来源：<code>logs/*.log</code>（自动解析）</div>
    <div style="height: 12px"></div>

    ${
      warnings.length
        ? `<div class="warn"><b>解析告警</b><ul>${warnings
            .map((w) => `<li>${htmlEscape(w)}</li>`)
            .join("")}</ul></div>`
        : ""
    }

    <div style="height: 12px"></div>
    <div class="grid">
      <div class="card">
        <h2>总体对比（execute mean）</h2>
        <canvas id="barMean"></canvas>
        <div class="muted small">单位：ms；越低越好。</div>
      </div>
      <div class="card">
        <h2>总体对比（TFJS pred/copy mean）</h2>
        <canvas id="barTfjsSplit"></canvas>
        <div class="muted small">TFJS 端到端 execute 被拆分为 pred 与 copy（同步读回）两部分。</div>
      </div>
    </div>

    <div style="height: 16px"></div>
    <div class="card">
      <h2>逐样本折线图（按设备）</h2>
      <div class="muted small">为控制体积已下采样（最多 ${maxPoints} 点/序列）。</div>
      <label class="small">选择设备：
        <select id="deviceSelect"></select>
      </label>
      <div style="height: 8px"></div>
      <canvas id="lineByDevice"></canvas>
    </div>

    <div style="height: 16px"></div>
    <div class="card">
      <h2>数据对比表</h2>
      <table>
        <thead>
          <tr>
            <th>设备</th>
            <th>Runtime</th>
            <th>样本数</th>
            <th>均值(ms)</th>
            <th>P50</th>
            <th>P90</th>
            <th>P95</th>
            <th>P99</th>
            <th>最小</th>
            <th>最大</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          ${results
            .flatMap((r) => {
              const rows = [];
              for (const runtime of ["tfjs", "webnn"]) {
                const d = r[runtime];
                const s = d?.executeStats;
                rows.push(`<tr>
                  <td>${htmlEscape(`${r.platform}/${r.device}`)}</td>
                  <td>${runtime.toUpperCase()}</td>
                  <td>${s?.n ?? 0}</td>
                  <td>${s ? fmt(s.mean) : "—"}</td>
                  <td>${s ? fmt(s.p50) : "—"}</td>
                  <td>${s ? fmt(s.p90) : "—"}</td>
                  <td>${s ? fmt(s.p95) : "—"}</td>
                  <td>${s ? fmt(s.p99) : "—"}</td>
                  <td>${s ? fmt(s.min) : "—"}</td>
                  <td>${s ? fmt(s.max) : "—"}</td>
                  <td style="text-align:left">${htmlEscape(d?.note ?? "")}</td>
                </tr>`);
              }
              return rows;
            })
            .join("")}
        </tbody>
      </table>
    </div>

    <script>
      const results = ${JSON.stringify(results)};
      const chartSeries = ${JSON.stringify(chartSeries)};

      // Bar: mean execute by device/runtime
      const labels = results.map(r => r.platform + "/" + r.device);
      const tfjsMeans = results.map(r => r.tfjs?.executeStats?.mean ?? null);
      const webnnMeans = results.map(r => r.webnn?.executeStats?.mean ?? null);

      new Chart(document.getElementById("barMean"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "TFJS execute mean (ms)", data: tfjsMeans, backgroundColor: "rgba(59,130,246,0.65)" },
            { label: "WebNN execute mean (ms)", data: webnnMeans, backgroundColor: "rgba(16,185,129,0.65)" },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "bottom" } },
          scales: { y: { beginAtZero: true, title: { display: true, text: "ms" } } }
        }
      });

      // Bar: TFJS pred/copy split
      const tfjsPred = results.map(r => r.tfjs?.predStats?.mean ?? null);
      const tfjsCopy = results.map(r => r.tfjs?.copyStats?.mean ?? null);
      new Chart(document.getElementById("barTfjsSplit"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "TFJS pred mean (ms)", data: tfjsPred, backgroundColor: "rgba(99,102,241,0.65)" },
            { label: "TFJS copy mean (ms)", data: tfjsCopy, backgroundColor: "rgba(244,114,182,0.65)" },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "bottom" } },
          scales: { y: { beginAtZero: true, title: { display: true, text: "ms" } } }
        }
      });

      // Line chart by device selection
      const select = document.getElementById("deviceSelect");
      chartSeries.forEach((d, idx) => {
        const opt = document.createElement("option");
        opt.value = String(idx);
        opt.textContent = d.key;
        select.appendChild(opt);
      });

      let lineChart = null;
      function renderDevice(idx) {
        const d = chartSeries[idx];
        const datasets = d.series.map((s) => ({
          label: s.label,
          data: s.points.map((y, i) => ({ x: i, y })),
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.15,
        }));
        const ctx = document.getElementById("lineByDevice");
        if (lineChart) lineChart.destroy();
        lineChart = new Chart(ctx, {
          type: "line",
          data: { datasets },
          options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } },
            scales: {
              x: { type: "linear", title: { display: true, text: "sample index (downsampled)" } },
              y: { beginAtZero: true, title: { display: true, text: "execute time (ms)" } }
            }
          }
        });
      }

      select.addEventListener("change", () => renderDevice(Number(select.value)));
      renderDevice(0);
    </script>
  </body>
</html>`;
}

async function main() {
  const warnings = [];
  const files = (await fs.readdir(LOGS_DIR))
    .filter((f) => f.endsWith(".log"))
    .map((f) => path.join(LOGS_DIR, f));

  const byDevice = new Map();

  for (const file of files) {
    const { platform, runtime, device } = parseFilename(file);
    const key = `${platform}/${device}`;
    const buf = await fs.readFile(file);
    const isBinary = looksBinary(buf);
    const text = buf.toString("utf8");
    const isMhtml = text.startsWith("From: <Saved by Blink>") || text.includes("multipart/related");

    if (!byDevice.has(key)) byDevice.set(key, { platform, device });
    const entry = byDevice.get(key);

    if (runtime === "tfjs") {
      const parsed = parseTfjs(text);
      const execSeries = parsed.avg.map((x) => x.executeMs);
      if (!execSeries.length) {
        entry.tfjs = {
          note: isBinary
            ? "日志为二进制/不可解析格式（请导出为纯文本 console log）"
            : isMhtml
              ? "日志看起来是 mhtml 网页快照，不是 DevTools Console 纯文本输出"
            : "未解析到 TFJS 指标（日志可能不是控制台输出）",
        };
        warnings.push(`${path.basename(file)}: no TFJS avg samples found${isBinary ? " (binary?)" : ""}`);
      } else {
        entry.tfjs = {
          firstPredictStats: stats(parsed.firstPredict),
          executeStats: stats(execSeries),
          predStats: stats(parsed.avg.map((x) => x.predMs)),
          copyStats: stats(parsed.avg.map((x) => x.copyMs)),
          fpsStats: stats(parsed.fps),
          executeSeries: execSeries,
        };
      }
    } else if (runtime === "webnn") {
      const parsed = parseWebnn(text);
      if (!parsed.execute.length && !parsed.avgExecute.length) {
        entry.webnn = {
          note: isBinary
            ? "日志为二进制/不可解析格式（请导出为纯文本 console log）"
            : "未解析到 WebNN 指标",
        };
        warnings.push(`${path.basename(file)}: no WebNN samples found${isBinary ? " (binary?)" : ""}`);
      } else {
        // Prefer per-frame execute times; fall back to avgExecute if needed
        const execSeries = parsed.execute.length ? parsed.execute : parsed.avgExecute;
        entry.webnn = {
          executeStats: stats(execSeries),
          executeSeries: execSeries,
          note:
            parsed.contextLogs.fallbacks.length
              ? `检测到 fallback: ${parsed.contextLogs.fallbacks[0]}`
              : "",
          contextLogs: parsed.contextLogs,
        };
      }
    } else {
      warnings.push(`${path.basename(file)}: unknown runtime in filename`);
    }
  }

  const results = [...byDevice.values()].sort((a, b) =>
    `${a.platform}/${a.device}`.localeCompare(`${b.platform}/${b.device}`)
  );

  await fs.mkdir(REPORTS_DIR, { recursive: true });
  const md = buildMarkdownReport(results);
  const html = buildHtmlReport(results, warnings);
  const json = JSON.stringify({ generatedAt: new Date().toISOString(), results, warnings }, null, 2);

  await Promise.all([
    fs.writeFile(path.join(REPORTS_DIR, "benchmark-report.md"), md, "utf8"),
    fs.writeFile(path.join(REPORTS_DIR, "benchmark-report.html"), html, "utf8"),
    fs.writeFile(path.join(REPORTS_DIR, "benchmark-data.json"), json, "utf8"),
  ]);

  console.log(`Wrote:
  - reports/benchmark-report.md
  - reports/benchmark-report.html
  - reports/benchmark-data.json`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

