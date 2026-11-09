/* ========== 1. EDIT YOUR DATA HERE ========== */

// lane = horizontal position (0 = leftmost). Keep to 3-4 lanes for phones.
// from      = branch it forked off
// mergeInto = branch it flowed back into (leave out if it is still running)
const BRANCHES = [
  { id: "main",   label: "career",        lane: 0, color: "#2dd4bf" },
  { id: "stay",   label: "research-stay", lane: 1, color: "#f59e0b", from: "main", mergeInto: "main" },
  { id: "side",   label: "side-project",  lane: 2, color: "#a78bfa", from: "main" }
];

// Every branch needs at least one commit. Its OLDEST commit is where it forks,
// its NEWEST commit is where it merges. Dates are "YYYY-MM".
const COMMITS = [
  { date: "2016-10", branch: "main", msg: "Start BSc Biotechnology, University X" },
  { date: "2019-10", branch: "main", msg: "Start MSc, University X" },
  { date: "2021-04", branch: "main", msg: "Start PhD, Institute Y", tag: "PhD",
    detail: "Project on ... supervised by ..." },
  { date: "2022-09", branch: "stay", msg: "Research stay at Lab Z",
    detail: "Learned method ..., 6 months abroad." },
  { date: "2023-03", branch: "stay", msg: "Return with new method, paper submitted" },
  { date: "2023-06", branch: "side", msg: "Start side project: ...",
    detail: "What it is and why it matters." },
  { date: "2025-02", branch: "main", msg: "PhD defended", tag: "v1.0" },
  { date: "2025-04", branch: "main", msg: "Postdoc / Role at Company W", tag: "now",
    detail: "What you do now." }
];

/* ========== 2. ENGINE (no need to edit) ========== */

const LANE = 22, PAD = 14, FORK = 32, DOT_Y = 20;
const log = document.getElementById("log");
const raw = document.getElementById("raw");
const toggle = document.getElementById("toggle");

const sorted = [...COMMITS].sort((a, b) => b.date.localeCompare(a.date)); // newest first
const branchOf = id => BRANCHES.find(b => b.id === id);
const laneX = l => PAD + l * LANE;
const gw = PAD * 2 + (Math.max(...BRANCHES.map(b => b.lane)) + 1) * LANE;

document.getElementById("legend").innerHTML = BRANCHES
  .map(b => `<span class="chip" style="--c:${b.color}">${b.label}</span>`).join("");

log.style.setProperty("--gw", gw + "px");
log.innerHTML = `<svg id="lines" width="${gw}" aria-hidden="true"></svg>`;
const svg = document.getElementById("lines");

sorted.forEach(c => {
  const el = document.createElement("article");
  el.className = "commit";
  el.style.setProperty("--c", branchOf(c.branch).color);
  el.innerHTML = `
    <div class="head">
      <time>${c.date}</time>
      <span class="msg">${c.msg}${c.tag ? `<span class="tag">${c.tag}</span>` : ""}</span>
    </div>
    <p class="detail">${c.detail || ""}</p>`;
  if (c.detail) {
    el.classList.add("has-detail");
    el.addEventListener("click", () => { el.classList.toggle("open"); draw(); });
  }
  log.appendChild(el);
});

function draw() {
  if (log.hidden) return;
  const rows = [...log.querySelectorAll(".commit")];
  const ys = rows.map(r => r.offsetTop + DOT_Y);

  const byBranch = {};
  sorted.forEach((c, i) => (byBranch[c.branch] = byBranch[c.branch] || []).push(ys[i]));

  const ext = {}, fork = {}, merge = {};
  BRANCHES.forEach(b => {
    const a = byBranch[b.id];
    if (a) ext[b.id] = [Math.min(...a), Math.max(...a)];
  });
  BRANCHES.forEach(b => {
    const a = byBranch[b.id];
    if (!a) return;
    if (b.from && ext[b.from]) {
      fork[b.id] = Math.max(...a) + FORK;
      ext[b.from][1] = Math.max(ext[b.from][1], fork[b.id]);
    }
    if (b.mergeInto && ext[b.mergeInto]) {
      merge[b.id] = Math.min(...a) - FORK;
      ext[b.mergeInto][0] = Math.min(ext[b.mergeInto][0], merge[b.id]);
    }
  });

  let s = "";
  BRANCHES.forEach(b => {
    if (!ext[b.id]) return;
    const x = laneX(b.lane);
    const style = `fill="none" stroke="${b.color}" stroke-width="3" stroke-linecap="round"`;
    s += `<line x1="${x}" y1="${ext[b.id][0]}" x2="${x}" y2="${ext[b.id][1]}" ${style}/>`;
    if (fork[b.id] !== undefined) {
      const px = laneX(branchOf(b.from).lane), y0 = Math.max(...byBranch[b.id]), f = fork[b.id];
      s += `<path d="M${px},${f} C${px},${y0} ${x},${f} ${x},${y0}" ${style}/>`;
    }
    if (merge[b.id] !== undefined) {
      const tx = laneX(branchOf(b.mergeInto).lane), y0 = Math.min(...byBranch[b.id]), m = merge[b.id];
      s += `<path d="M${x},${y0} C${x},${m} ${tx},${y0} ${tx},${m}" ${style}/>`;
    }
  });
  sorted.forEach((c, i) => {
    const b = branchOf(c.branch);
    const fill = c.tag ? `fill:${b.color}` : "fill:var(--bg)";
    s += `<circle cx="${laneX(b.lane)}" cy="${ys[i]}" r="6" style="${fill};stroke:${b.color};stroke-width:3"/>`;
  });

  svg.innerHTML = s;
  svg.setAttribute("height", log.scrollHeight);
}

/* easter egg: same history as a terminal-style git log */
const hash = str => {
  let h = 5381;
  for (const ch of str) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return h.toString(16).padStart(8, "0").slice(0, 7);
};
raw.textContent = sorted.map(c =>
  `${hash(c.date + c.msg)} ${c.tag ? "(tag: " + c.tag + ") " : ""}${c.date} [${c.branch}] ${c.msg}`
).join("\n");

toggle.addEventListener("click", () => {
  const showRaw = raw.hidden;
  raw.hidden = !showRaw;
  log.hidden = showRaw;
  toggle.textContent = showRaw ? "Show as graph" : "Show as git log";
  draw();
});

window.addEventListener("resize", draw);
window.addEventListener("load", draw);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
draw();
