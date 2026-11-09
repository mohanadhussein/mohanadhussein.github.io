/* ========== 1. EDIT YOUR DATA HERE ========== */

// forkAt  = id of the commit on the parent branch where this branch starts
// mergeAt = id of the commit on the target branch where it flows back in
// "end" is shown as "start → end"; use "present" for things still running
const BRANCHES = [
  { id: "main",   label: "career",          lane: 0, color: "#2dd4bf" },
  { id: "bscint", label: "bsc-internships", lane: 1, color: "#f59e0b",
    from: "main", forkAt: "bsc", mergeInto: "main", mergeAt: "msc" },
  { id: "mscint", label: "msc-internships", lane: 1, color: "#fb7185",
    from: "main", forkAt: "msc" },
  { id: "work",   label: "experience",      lane: 2, color: "#a78bfa",
    from: "main", forkAt: "msc" }
];

const COMMITS = [
  /* ---- career: education ---- */
  { id: "bsc", date: "2020-09", branch: "main", tag: "BSc",
    msg: "BSc Molecular Biology & Genetics @Istanbul Technical University, Türkiye",
    detail: "Core courses: human and molecular genetics, probability and statistics, biochemistry, R programming, MATLAB and Python." },
  { id: "msc", date: "2024-09", branch: "main", tag: "MSc",
    msg: "MSc Computational Biology & Bioinformatics @University of Göttingen, Germany",
    detail: "Core courses: bioinformatics algorithms, statistics in R, deep learning (computer vision), ML in R, Python and data science." },

  /* ---- internships during the BSc (fork at BSc, merge back at MSc) ---- */
  { id: "lund", date: "2022-07", end: "2022-08", branch: "bscint",
    msg: "Research intern, Lund University (Lund, Sweden)",
    detail: "• Designed and performed an evolutionary experiment on reproductive success between Balancer X-chromosome and wild-type D. melanogaster lines.<br>• Completed a population genetics summer course at the GENECO research school.<br>• Helped maintain D. melanogaster and M. lignano cultures." },
  { id: "mobgam", date: "2023-03", end: "2024-06", branch: "bscint",
    msg: "Lab assistant, MOBGAM Research Center (Istanbul, Türkiye )",
    detail: "• Coordinated and secured TÜBİTAK 2209-A funding to sustain and finalize a pandemic-impacted VWA1 research project in Prof. Aslıhan Tolun's human genetics lab.<br>• Isolated and prepared 200 DNA samples, followed by pre-sequencing analysis and quality control.<br>• Conducted whole exome sequencing (WES) analysis and fine mapping through linkage analysis.<br>• Reviewed Sanger, WGS and WES results and human genetic variation databases (ClinVar, dbSNP, gnomAD) prior to publishing.<br>• Established the lab's pipeline for variant calling and R-based linkage analysis.<br>• Co-authored a paper and presented a poster at ESHG 2026 (Gothenburg, Sweden)." },
  { id: "epfl", date: "2023-07", end: "2023-09", branch: "bscint",
    msg: "Project intern, EPFL Brain Mind Institute (Lausanne, Switzerland)",
    detail: "• Investigated the impact of genetic variation on brain structure and morphology in Dmel-DGRP lines using GWAS and GSEA.<br>• Built a Docker-based pipeline for gene set enrichment analysis (GSEA) and presented results in R Shiny.<br>• Prepared micro-CT scanned brains, followed by image analysis and segmentation with DragonFly.<br>• Presented a poster at the Swiss Drosophila Meeting 2023 in Fribourg." },
  { id: "fribourg", date: "2024-07", end: "2024-09", branch: "bscint",
    msg: "Project intern, University of Fribourg / SIB (Fribourg, Switzerland)",
    detail: "• Performed primary-to-tertiary analysis of low-depth NGS data using ATLAS, a Snakemake tool from Wegmann's group.<br>• Built an R pipeline to test and optimize the in-lab tool BeXY, which identifies sex-linked scaffolds through Bayesian inference." },

  /* ---- internships during the MSc (fork at MSc) ---- */
  { id: "dpz", date: "2025-08", end: "2025-12", branch: "mscint",
    msg: "Project intern, Auditory Neuroscience Institute @DPZ (Göttingen, Germany)",
    detail: "• Gene mapping in Middle Eastern and European families for genetic hearing loss by linkage and NGS analysis.<br>• Established a pipeline to streamline analysis of sample data." },
  { id: "mpi", date: "2026-04", end: "present", branch: "mscint", tag: "now",
    msg: "Project intern, Max Planck Institute for Multidisciplinary Sciences",
    detail: "• Developing a phylogenetic tree-reconstruction benchmark workflow in Snakemake, based on the OMA database (XML, JSON, Newick) from the Swiss Institute of Bioinformatics, to test the Söding Lab's in-house tool prior to publication." },

  /* ---- experience (fork at MSc, still running) ---- */
  { id: "gwdg", date: "2025-10", end: "present", branch: "work", tag: "now",
    msg: "Working student, GWDG AG Computing (Göttingen, Germany)",
    detail: "• Assisting in testing and monitoring bioinformatics tools and datasets on the GWDG HPC cluster.<br>• Developing tutorials and materials for bioinformatics tools and datasets as part of the GWDG HPC Life Science services." }
];

/* ========== 2. ENGINE (no need to edit) ========== */

const LANE = 22, PAD = 14, STEP = 28, DOT_Y = 20;
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
      <time>${c.date}${c.end ? " → " + c.end : ""}</time>
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
  const y = {};
  sorted.forEach((c, i) => { y[c.id] = rows[i].offsetTop + DOT_Y; });

  let s = "";
  BRANCHES.forEach(b => {
    const own = sorted.filter(c => c.branch === b.id).map(c => y[c.id]);
    if (!own.length) return;
    const x = laneX(b.lane);
    const st = `fill="none" stroke="${b.color}" stroke-width="3" stroke-linecap="round"`;
    let yBottom = Math.max(...own);  // oldest commit (lowest on the page)
    let yTop = Math.min(...own);     // newest commit (highest on the page)

    if (b.from) {                    // fork curve: parent commit -> up into this lane
      const px = laneX(branchOf(b.from).lane), yF = y[b.forkAt];
      const len = Math.min(STEP * Math.abs(b.lane - branchOf(b.from).lane), yF - yBottom);
      s += `<path d="M${px},${yF} C${px},${yF - len / 2} ${x},${yF - len / 2} ${x},${yF - len}" ${st}/>`;
      yBottom = yF - len;
    }
    if (b.mergeInto) {               // merge curve: this lane -> target commit
      const tx = laneX(branchOf(b.mergeInto).lane), yM = y[b.mergeAt];
      const len = Math.min(STEP * Math.abs(b.lane - branchOf(b.mergeInto).lane), yTop - yM);
      s += `<path d="M${x},${yM + len} C${x},${yM + len / 2} ${tx},${yM + len / 2} ${tx},${yM}" ${st}/>`;
      yTop = yM + len;
    }
    s += `<line x1="${x}" y1="${yTop}" x2="${x}" y2="${yBottom}" ${st}/>`;
  });

  sorted.forEach(c => {
    const b = branchOf(c.branch);
    const fill = c.tag ? `fill:${b.color}` : "fill:var(--bg)";
    s += `<circle cx="${laneX(b.lane)}" cy="${y[c.id]}" r="6" style="${fill};stroke:${b.color};stroke-width:3"/>`;
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
  `${hash(c.date + c.msg)} ${c.tag ? "(tag: " + c.tag + ") " : ""}${c.date}${c.end ? " → " + c.end : ""} [${c.branch}] ${c.msg}`
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
