/* ========== 1. EDIT YOUR DATA HERE ========== */

const BRANCHES = [
  { id: "main",   label: "career",      lane: 0, color: "#2dd4bf" },
  { id: "intern", label: "internships", lane: 1, color: "#f59e0b", from: "main", mergeInto: "main" },
  { id: "work",   label: "experience",  lane: 2, color: "#a78bfa", from: "main" }
];

const COMMITS = [
  /* ---- career: education ---- */
  { date: "2020-09", branch: "main", msg: "Start BSc Molecular Biology &amp; Genetics, Istanbul Technical University", tag: "BSc",
    detail: "Core courses: human and molecular genetics, probability and statistics, biochemistry, R programming, MATLAB and Python." },
  { date: "2024-09", branch: "main", msg: "Start MSc Computational Biology &amp; Bioinformatics, University of Göttingen", tag: "MSc",
    detail: "Core courses: bioinformatics algorithms, statistics in R, deep learning (computer vision), ML in R, Python and data science." },

  /* ---- internships (fork from career, merge back) ---- */
  { date: "2022-07", branch: "intern", msg: "Research intern, Lund University (Sweden)",
    detail: "• Designed and performed an evolutionary experiment on reproductive success between Balancer X-chromosome and wild-type D. melanogaster lines.<br>• Completed a population genetics summer course at the GENECO research school.<br>• Helped maintain D. melanogaster and M. lignano cultures." },
  { date: "2023-03", branch: "intern", msg: "Lab assistant, MOBGAM Research Center (Istanbul)",
    detail: "• Coordinated and secured TÜBİTAK 2209-A funding to sustain and finalize a pandemic-impacted VWA1 research project in Prof. Aslıhan Tolun's human genetics lab.<br>• Isolated and prepared 200 DNA samples, followed by pre-sequencing analysis and quality control.<br>• Conducted whole exome sequencing (WES) analysis and fine mapping through linkage analysis.<br>• Reviewed Sanger, WGS and WES results and human genetic variation databases (ClinVar, dbSNP, gnomAD) prior to publishing.<br>• Established the lab's pipeline for variant calling and R-based linkage analysis.<br>• Co-authored a paper and presented a poster at ESHG 2026 (Gothenburg, Sweden)." },
  { date: "2023-07", branch: "intern", msg: "Project intern, EPFL Brain Mind Institute (Lausanne)",
    detail: "• Investigated the impact of genetic variation on brain structure and morphology in Dmel-DGRP lines using GWAS and GSEA.<br>• Built a Docker-based pipeline for gene set enrichment analysis (GSEA) and presented results in R Shiny.<br>• Prepared micro-CT scanned brains, followed by image analysis and segmentation with DragonFly.<br>• Presented a poster at the Swiss Drosophila Meeting 2023 in Fribourg." },
  { date: "2024-07", branch: "intern", msg: "Project intern, University of Fribourg / SIB (Switzerland)",
    detail: "• Performed primary-to-tertiary analysis of low-depth NGS data using ATLAS, a Snakemake tool from Wegmann's group.<br>• Built an R pipeline to test and optimize the in-lab tool BeXY, which identifies sex-linked scaffolds through Bayesian inference." },
  { date: "2025-08", branch: "intern", msg: "Project intern, Auditory Neuroscience Institute (DPZ, Göttingen)",
    detail: "• Gene mapping in Middle Eastern and European families for genetic hearing loss by linkage and NGS analysis.<br>• Established a pipeline to streamline analysis of sample data." },

  /* ---- experience (fork from career, still running) ---- */
  { date: "2025-10", branch: "work", msg: "Working student, GWDG AG Computing (Göttingen)",
    detail: "• Assisting in testing and monitoring bioinformatics tools and datasets on the GWDG HPC cluster.<br>• Developing tutorials and materials for bioinformatics tools and datasets as part of the GWDG HPC Life Science services." },
  { date: "2026-04", branch: "work", msg: "Project intern, Max Planck Institute for Multidisciplinary Sciences", tag: "now",
    detail: "• Developing a phylogenetic tree-reconstruction benchmark workflow in Snakemake, based on the OMA database (XML, JSON, Newick) from the Swiss Institute of Bioinformatics, to test the Söding Lab's in-house tool prior to publication." }
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
