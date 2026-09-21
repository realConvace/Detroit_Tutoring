(() => {
  const content = window.TUTORING_CONTENT;
  const app = document.getElementById("app");

  const defaultState = {
    fastStartNumber: 1,
    fastStartSection: 0,
    projectReadId: "1",
    completed: {
      book: false,
      fastStart: false,
      projectRead: false
    }
  };

  const loadState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("detroitTutoringState"));
      return {
        ...defaultState,
        ...saved,
        completed: { ...defaultState.completed, ...(saved?.completed || {}) }
      };
    } catch {
      return structuredClone(defaultState);
    }
  };

  let state = loadState();

  const saveState = () => {
    localStorage.setItem("detroitTutoringState", JSON.stringify(state));
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const fastStartTitle = () => content.fastStart[state.fastStartNumber - 1];
  const projectReadLesson = () =>
    content.projectRead.find((lesson) => lesson.id === state.projectReadId) || content.projectRead[0];

  const completedCount = () => Object.values(state.completed).filter(Boolean).length;

  const formatProjectReadUnit = (id) => {
    const match = String(id).match(/^(\d+)([A-Za-z]*)$/);
    if (!match) return String(id);

    const [, number, suffix] = match;
    const paddedNumber = number.length === 1 ? number.padStart(2, "0") : number;
    return `${paddedNumber}${suffix.toUpperCase()}`;
  };

  const setCurrentNav = (route) => {
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const active = link.dataset.nav === route;
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  const fastStartOptions = () =>
    content.fastStart
      .map(
        (title, index) =>
          `<option value="${index + 1}" ${state.fastStartNumber === index + 1 ? "selected" : ""}>
            ${index + 1}. ${escapeHtml(title)}
          </option>`
      )
      .join("");

  const projectReadOptions = () =>
    content.projectRead
      .map(
        (lesson) =>
          `<option value="${escapeHtml(lesson.id)}" ${state.projectReadId === lesson.id ? "selected" : ""}>
            ${escapeHtml(lesson.label)}
          </option>`
      )
      .join("");

  const home = () => `
    <section class="hero home-hero">
      <h1>Detroit Fellows Tutoring Project</h1>
      <p class="home-hero-subheader">
        Serving first to third grade students with reading literacy.
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#session">START TODAY'S SESSION</a>
      </div>
    </section>

    <div class="agenda-heading">
      <h2>Agenda</h2>
      <div class="agenda-line" aria-hidden="true"></div>
    </div>

    <section class="home-grid" aria-label="Tutoring routine">
      <article class="card">
        <div class="icon-chip">1</div>
        <h2>Book Reading</h2>
        <p>Spend the first five minutes reading a children's book to students.</p>
      </article>

      <article class="card">
        <div class="icon-chip orange">2</div>
        <h2>Fast Start for Early Readers</h2>
        <p>Let students read a poem and complete the subsequent three activities.</p>
      </article>

      <article class="card">
        <div class="icon-chip purple">3</div>
        <h2>Project Read</h2>
        <p>Engage students with a unit lesson to develop new skills.</p>
      </article>
    </section>
  `;

  const session = () => {
    const done = completedCount();
    const percentage = Math.round((done / 3) * 100);

    return `
      <div class="page-heading session-page-heading">
        <div>
          <h1>Today's Tutoring Session</h1>
          <div class="session-heading-line" aria-hidden="true"></div>
        </div>
        <button class="btn reset-session-button" data-action="reset-session">Reset session</button>
      </div>

      <div class="dashboard-grid">
        <section>
          <div class="session-stack">
            <article class="session-step ${state.completed.book ? "is-complete" : ""}">
              <div class="step-number">${state.completed.book ? "✓" : "1"}</div>
              <div>
                <h3>Book Reading</h3>
                <p>Spend the first five minutes reading a children's book to students.</p>
              </div>
              <div class="step-action">
                <button class="btn ${state.completed.book ? "btn-success" : "btn-primary"}" data-action="toggle-step" data-step="book">
                  ${state.completed.book ? "Completed" : "Mark Complete"}
                </button>
              </div>
            </article>

            <article class="session-step ${state.completed.fastStart ? "is-complete" : ""}">
              <div class="step-number">${state.completed.fastStart ? "✓" : "2"}</div>
              <div>
                <h3>Fast Start for Early Readers</h3>
                <p>Let students read a poem and complete the subsequent three activities.</p>
              </div>
              <div class="step-action">
                <a class="btn btn-secondary" href="#fast-start/${state.fastStartNumber}">Open Fast Start</a>
              </div>
            </article>

            <article class="session-step ${state.completed.projectRead ? "is-complete" : ""}">
              <div class="step-number">${state.completed.projectRead ? "✓" : "3"}</div>
              <div>
                <h3>Project Read</h3>
                <p>Engage students with a unit lesson to develop new skills.</p>
              </div>
              <div class="step-action">
                <a class="btn btn-secondary" href="#project-read/${encodeURIComponent(state.projectReadId)}">Open Project Read</a>
              </div>
            </article>
          </div>

          <div class="progress-wrap card">
            <div class="progress-label">
              <span>Session progress</span>
              <span>${done} of 3 completed</span>
            </div>
            <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${done}">
              <div class="progress-bar" style="width:${percentage}%"></div>
            </div>
          </div>
        </section>

        <aside class="card setup-panel">
          <h2>Today's setup</h2>
          <p>Choose the Fast Start for Early Readers chapter and Project Reason lesson before beginning.</p>

          <div class="field">
            <label for="session-fast-start">Fast Start for Early Readers</label>
            <select id="session-fast-start" data-setting="fastStartNumber">
              ${fastStartOptions()}
            </select>
          </div>

          <div class="field">
            <label for="session-project-read">Project Read</label>
            <select id="session-project-read" data-setting="projectReadId">
              ${projectReadOptions()}
            </select>
          </div>

        </aside>
      </div>
    `;
  };

  const fastStartLibrary = () => `
    <div class="page-heading fast-start-library-heading">
      <div>
        <h1>Choose a Fast Start for Early Readers</h1>
        <div class="fast-start-library-line" aria-hidden="true"></div>
      </div>
    </div>

    <div class="library-grid">
      ${content.fastStart
        .map(
          (title, index) => `
            <a class="lesson-card" href="#fast-start/${index + 1}">
              <small>Fast Start #${index + 1}</small>
              <h3>${escapeHtml(title)}</h3>
            </a>
          `
        )
        .join("")}
    </div>
  `;

  const fastStartDetail = (number) => {
    const n = Number(number);

    if (!Number.isInteger(n) || n < 1 || n > content.fastStart.length) {
      return fastStartLibrary();
    }

    if (state.fastStartNumber !== n) {
      state.completed.fastStart = false;
    }

    state.fastStartNumber = n;
    state.fastStartSection = 0;
    saveState();

    const title = content.fastStart[n - 1];
    const previousFastStart = n > 1 ? n - 1 : null;
    const nextFastStart = n < content.fastStart.length ? n + 1 : null;
    const poemSection = content.fastStartSections[0];
    const activitySections = content.fastStartSections.slice(1);
    const detail = content.fastStartDetails?.[String(n)] || null;
    const poemTitle = detail?.displayTitle || title;
    const clipartPath = detail?.clipartPath || null;
    const clipartAlt = detail?.clipartAlt || "";

    return `
      <div class="lesson-hero fast-start">
        <div class="fast-start-hero-copy">
          <h1>Fast Start for Early Readers</h1>
          <p class="fast-start-hero-subheader">#${n} ${escapeHtml(title)}</p>
        </div>
        <button class="btn fast-start-finish-button" data-action="finish-fast-start">✓ Finish Poem</button>
      </div>

      <div class="fast-start-workspace">
        <section class="curriculum-section fast-start-poem">
          <div class="poem-section-label">
            <span class="section-index">1</span>
            <span>${escapeHtml(poemSection)}</span>
          </div>

          <div class="poem-book-frame">
            <div class="poem-title-bubble">${escapeHtml(poemTitle)}</div>

            ${detail?.poemHtml
              ? `<div class="source-content poem-content">${detail.poemHtml}</div>`
              : `<div class="curriculum-placeholder poem-placeholder">
                  Exact source wording for Fast Start #${n}, ${escapeHtml(poemSection)}, will be inserted here from the provided PDF.
                  The interface will not paraphrase or rewrite it.
                </div>`
            }

            ${clipartPath
              ? `<div class="poem-clipart-wrap">
                  <img class="poem-clipart" src="${escapeHtml(clipartPath)}" alt="${escapeHtml(clipartAlt)}">
                </div>`
              : ""
            }
          </div>
        </section>

        <div class="fast-start-activities" tabindex="0" role="region" aria-label="Fast Start activity sections. Scroll this panel to view all three sections.">
          ${activitySections
            .map(
              (section, index) => `
                <section class="curriculum-section">
                  <header>
                    <span class="section-index">${index + 2}</span>
                    <h2>${escapeHtml(section)}</h2>
                  </header>
                  ${detail?.sections?.[section]
                    ? `<div class="source-content">${detail.sections[section]}</div>`
                    : `<div class="curriculum-placeholder">
                        Exact source wording for Fast Start #${n}, ${escapeHtml(section)}, will be inserted here from the provided PDF.
                        The interface will not paraphrase or rewrite it.
                      </div>`
                  }
                </section>
              `
            )
            .join("")}
        </div>
      </div>

      <div class="button-row fast-start-navigation">
        ${previousFastStart
          ? `<a class="btn btn-muted" href="#fast-start/${previousFastStart}">← Previous Fast Start</a>`
          : `<a class="btn btn-muted" href="#session">Back to session</a>`
        }

        ${nextFastStart
          ? `<a class="btn btn-primary" href="#fast-start/${nextFastStart}">Next Poem →</a>`
          : ""
        }
      </div>
    `;
  };

  const projectReadLibrary = () => `
    <div class="page-heading project-read-library-heading">
      <div>
        <h1>Choose a Project Read Lesson</h1>
        <div class="project-read-library-line" aria-hidden="true"></div>
      </div>
    </div>

    <div class="library-grid">
      ${content.projectRead
        .map(
          (lesson) => `
            <a class="lesson-card" href="#project-read/${encodeURIComponent(lesson.id)}">
              <small>Project Read</small>
              <h3>${escapeHtml(lesson.label)}</h3>
            </a>
          `
        )
        .join("")}
    </div>
  `;

  const projectReadDetail = (id) => {
    const lessonIndex = content.projectRead.findIndex(
      (item) => item.id.toLowerCase() === String(id).toLowerCase()
    );

    if (lessonIndex === -1) return projectReadLibrary();

    const lesson = content.projectRead[lessonIndex];
    const previousLesson = lessonIndex > 0 ? content.projectRead[lessonIndex - 1] : null;
    const nextLesson =
      lessonIndex < content.projectRead.length - 1 ? content.projectRead[lessonIndex + 1] : null;
    const detail = content.projectReadDetails?.[lesson.id] || null;
    const detailConcept = detail?.concept || (detail?.metaLabel === "Concept:" ? detail?.skill : "");
    const showSkillBox = Boolean(detail?.skill) && detail?.metaLabel !== "Concept:";

    if (state.projectReadId !== lesson.id) {
      state.completed.projectRead = false;
    }

    state.projectReadId = lesson.id;
    saveState();

    return `
      <div class="lesson-hero project-read-hero">
        <div class="project-read-hero-copy">
          <h1>Project Read</h1>
          <p class="project-read-hero-subheader">Unit ${escapeHtml(detail?.unitDisplay || formatProjectReadUnit(lesson.id))}</p>
        </div>
        <button class="btn project-read-finish-button" data-action="finish-project-read">✓ Finish Unit</button>
      </div>

      <div class="section-list project-read-section-list">
        ${detail
          ? `
            ${showSkillBox ? `
              <div class="project-read-skill-box">
                <div class="project-read-skill-label">${escapeHtml(detail.metaLabel || "Skill:")}</div>
                <div class="project-read-skill-value">${escapeHtml(detail.skill)}</div>
              </div>
            ` : ""}

            <section class="curriculum-section project-read-main-content">
              <div class="source-content project-read-content">
                ${detailConcept ? `
                  <section class="project-read-source-block project-read-teaching project-read-concept-block">
                    <div class="project-read-teaching-subsection project-read-concept-subsection">
                      <div class="project-read-subsection-heading">Concept:</div>
                      <div class="project-read-teaching-value">${escapeHtml(detailConcept)}</div>
                    </div>
                  </section>
                ` : ""}
                ${detail.bodyHtml}
              </div>
            </section>
          `
          : `
            <section class="curriculum-section project-read-main-content">
              <div class="curriculum-placeholder">
                The exact lesson content will be imported from the original Project Read file. Short-vowel symbols
                such as ă, ĭ, ŏ, ĕ, and ŭ will be preserved exactly.
              </div>
            </section>
          `
        }
      </div>

      <div class="button-row project-read-navigation">
        <div class="project-read-nav-left">
          ${previousLesson
            ? `<a class="btn btn-muted" href="#project-read/${encodeURIComponent(previousLesson.id)}">← Previous Unit</a>`
            : `<a class="btn btn-muted" href="#session">Back to session</a>`
          }
        </div>

        <div class="project-read-nav-right">
          ${nextLesson
            ? `<a class="btn btn-primary" href="#project-read/${encodeURIComponent(nextLesson.id)}">Next Unit →</a>`
            : ""
          }
        </div>
      </div>
    `;
  };

  let fastStartResizeObserver = null;

  const syncFastStartActivityHeight = () => {
    if (fastStartResizeObserver) {
      fastStartResizeObserver.disconnect();
      fastStartResizeObserver = null;
    }

    const poemPanel = app.querySelector(".fast-start-poem");
    const activityPanel = app.querySelector(".fast-start-activities");

    if (!poemPanel || !activityPanel) return;

    const applyHeight = () => {
      const stackedLayout = window.matchMedia("(max-width: 900px)").matches;

      if (stackedLayout) {
        activityPanel.style.height = "";
        activityPanel.style.maxHeight = "";
        return;
      }

      const poemHeight = Math.ceil(poemPanel.getBoundingClientRect().height);

      // Keep the tutor activity panel from shrinking below the established
      // Pat-a-Cake desktop size, even when a later rhyme is shorter.
      const patACakeMinimumHeight = 805;
      const activityHeight = Math.max(poemHeight, patACakeMinimumHeight);

      if (activityHeight > 0) {
        activityPanel.style.height = `${activityHeight}px`;
        activityPanel.style.maxHeight = `${activityHeight}px`;
      }
    };

    applyHeight();

    if ("ResizeObserver" in window) {
      fastStartResizeObserver = new ResizeObserver(applyHeight);
      fastStartResizeObserver.observe(poemPanel);
    }
  };

  const projectReadEndingKey = (word) => {
    const normalized = String(word).toLowerCase().replace(/[^a-z]/g, "");
    if (!normalized) return String(word).toLowerCase();

    const vowels = "aeiou";

    if (normalized.endsWith("y")) {
      for (let i = normalized.length - 2; i >= 0; i--) {
        if (vowels.includes(normalized[i])) return normalized.slice(i);
      }
      return "y";
    }

    if (normalized.endsWith("e") && normalized.length > 2) {
      for (let i = normalized.length - 2; i >= 0; i--) {
        if (vowels.includes(normalized[i])) return normalized.slice(i);
      }
    }

    let lastVowel = -1;
    for (let i = normalized.length - 1; i >= 0; i--) {
      if (vowels.includes(normalized[i])) {
        lastVowel = i;
        break;
      }
    }

    if (lastVowel < 0) return normalized.slice(-2);

    while (lastVowel > 0 && vowels.includes(normalized[lastVowel - 1])) {
      lastVowel -= 1;
    }

    return normalized.slice(lastVowel);
  };

  const normalizeProjectReadWord = (word) =>
    String(word).toLowerCase().replace(/[^a-z]/g, "");

  // VCV word lists are practice sets, not word-family sorts.
  const projectReadPlainLatticeLessons = new Set(["22B"]);

  const projectReadSemanticRules = {
    "7": [
      { key: "qu", test: (word) => /^qu/.test(word) },
      { key: "x", test: (word) => word.includes("x") },
      { key: "y", test: (word) => /^y/.test(word) },
      { key: "z", test: (word) => /^z/.test(word) || word.includes("zigzag") }
    ],
    "9": [
      { key: "ss", test: (word) => word.endsWith("ss") },
      { key: "ll", test: (word) => word.endsWith("ll") },
      { key: "ff", test: (word) => word.endsWith("ff") },
      { key: "zz", test: (word) => word.endsWith("zz") }
    ],
    "10": [
      { key: "ng", test: (word) => word.endsWith("ng") },
      { key: "nk", test: (word) => word.endsWith("nk") }
    ],
    "11": [
      { key: "wh", test: (word) => word.includes("wh") },
      { key: "ch", test: (word) => word.includes("ch") },
      { key: "th", test: (word) => word.includes("th") },
      { key: "sh", test: (word) => word.includes("sh") }
    ],
    "13A": [
      { key: "bl", test: (word) => word.startsWith("bl") },
      { key: "gl", test: (word) => word.startsWith("gl") },
      { key: "cl", test: (word) => word.startsWith("cl") },
      { key: "pl", test: (word) => word.startsWith("pl") },
      { key: "fl", test: (word) => word.startsWith("fl") },
      { key: "sl", test: (word) => word.startsWith("sl") }
    ],
    "13B": [
      { key: "br", test: (word) => word.startsWith("br") },
      { key: "pr", test: (word) => word.startsWith("pr") },
      { key: "fr", test: (word) => word.startsWith("fr") },
      { key: "shr", test: (word) => word.startsWith("shr") },
      { key: "tr", test: (word) => word.startsWith("tr") },
      { key: "thr", test: (word) => word.startsWith("thr") },
      { key: "cr", test: (word) => word.startsWith("cr") },
      { key: "dr", test: (word) => word.startsWith("dr") },
      { key: "gr", test: (word) => word.startsWith("gr") }
    ],
    "13C": [
      { key: "sc", test: (word) => word.startsWith("sc") },
      { key: "sp", test: (word) => word.startsWith("sp") },
      { key: "squ", test: (word) => word.startsWith("squ") },
      { key: "dw", test: (word) => word.startsWith("dw") },
      { key: "sm", test: (word) => word.startsWith("sm") },
      { key: "sw", test: (word) => word.startsWith("sw") },
      { key: "sk", test: (word) => word.startsWith("sk") },
      { key: "sn", test: (word) => word.startsWith("sn") },
      { key: "st", test: (word) => word.startsWith("st") },
      { key: "tw", test: (word) => word.startsWith("tw") }
    ],
    "16": [
      { key: "str", test: (word) => word.startsWith("str") },
      { key: "spl", test: (word) => word.startsWith("spl") },
      { key: "scr", test: (word) => word.startsWith("scr") },
      { key: "spr", test: (word) => word.startsWith("spr") }
    ],
    "17A": [
      { key: "st", test: (word) => word.endsWith("st") },
      { key: "sp", test: (word) => word.endsWith("sp") },
      { key: "mp", test: (word) => word.endsWith("mp") },
      { key: "sk", test: (word) => word.endsWith("sk") },
      { key: "nt", test: (word) => word.endsWith("nt") },
      { key: "nd", test: (word) => word.endsWith("nd") }
    ],
    "17B": [
      { key: "ld", test: (word) => word.endsWith("ld") },
      { key: "lp", test: (word) => word.endsWith("lp") },
      { key: "ct", test: (word) => word.endsWith("ct") },
      { key: "lk", test: (word) => word.endsWith("lk") },
      { key: "lt", test: (word) => word.endsWith("lt") },
      { key: "ft", test: (word) => word.endsWith("ft") },
      { key: "pt", test: (word) => word.endsWith("pt") }
    ],
    "19B": [
      { key: "er", test: (word) => word.includes("er") },
      { key: "ir", test: (word) => word.includes("ir") },
      { key: "ur", test: (word) => word.includes("ur") }
    ],
    "20": [
      { key: "long-e-open", test: (word) => ["me","he","we","she","be"].includes(word) },
      { key: "long-o-open", test: (word) => ["no","go","so"].includes(word) },
      { key: "long-i-open", test: (word) => ["hi","i"].includes(word) }
    ],
    "21": [
      { key: "a-e", test: (word) => word.length >= 4 && word.endsWith("e") && word[word.length - 3] === "a" },
      { key: "i-e", test: (word) => word.length >= 4 && word.endsWith("e") && word[word.length - 3] === "i" },
      { key: "o-e", test: (word) => word.length >= 4 && word.endsWith("e") && word[word.length - 3] === "o" },
      { key: "u-e", test: (word) => word.length >= 4 && word.endsWith("e") && word[word.length - 3] === "u" }
    ],
    "23": [
      { key: "y-i", test: (word) => ["my","sky","fry","try","fly","by","shy","why","cry"].includes(word) },
      { key: "y-e", test: (word) => word.endsWith("y") }
    ],
    "24A": [
      { key: "ai", test: (word) => word.includes("ai") },
      { key: "ay", test: (word) => word.includes("ay") }
    ],
    "24B": [
      { key: "ee", test: (word) => word.includes("ee") },
      { key: "ea", test: (word) => word.includes("ea") },
      { key: "ie", test: (word) => word.includes("ie") },
      { key: "ey", test: (word) => word.includes("ey") }
    ],
    "24D": [
      { key: "oa", test: (word) => word.includes("oa") },
      { key: "ow", test: (word) => word.includes("ow") },
      { key: "oe", test: (word) => word.includes("oe") }
    ]
  };

  const splitProjectReadWordsEvenly = (words, parts) => {
    const chunks = [];
    let cursor = 0;

    for (let part = 0; part < parts; part++) {
      const remaining = words.length - cursor;
      const remainingParts = parts - part;
      const size = Math.ceil(remaining / remainingParts);
      chunks.push(words.slice(cursor, cursor + size));
      cursor += size;
    }

    return chunks.filter((chunk) => chunk.length);
  };

  const allocateProjectReadSemanticColumns = (groups, columnCount) => {
    if (!groups.length) return [];
    if (groups.length > columnCount) return null;

    const allocations = groups.map(() => 1);
    let remaining = columnCount - groups.length;

    while (remaining > 0) {
      let target = 0;
      let bestNeed = -Infinity;

      groups.forEach((group, index) => {
        const need = group.words.length / allocations[index];
        if (need > bestNeed) {
          bestNeed = need;
          target = index;
        }
      });

      allocations[target] += 1;
      remaining -= 1;
    }

    const columns = [];
    groups.forEach((group, index) => {
      splitProjectReadWordsEvenly(group.words, allocations[index]).forEach((words) => {
        columns.push([{ ...group, words, continuation: true }]);
      });
    });

    return columns;
  };

  const packProjectReadGroups = (groups, columnCount) => {
    const columns = Array.from({ length: Math.max(1, columnCount) }, () => []);

    groups
      .slice()
      .sort((a, b) => b.words.length - a.words.length || a.order - b.order)
      .forEach((group) => {
        const target = columns
          .map((column, index) => ({
            index,
            load: column.reduce((sum, item) => sum + item.words.length + 0.85, 0)
          }))
          .sort((a, b) => a.load - b.load || a.index - b.index)[0].index;

        columns[target].push(group);
      });

    return columns.filter((column) => column.length);
  };

  const buildProjectReadDefaultColumns = (items, desiredColumns, lessonId) => {
    const rules = projectReadSemanticRules[String(lessonId).toUpperCase()] || null;
    const itemRecords = items.map((item, order) => ({
      item,
      word: item.textContent.trim(),
      normalized: normalizeProjectReadWord(item.textContent),
      order
    }));

    let mainGroups = [];
    let miscItems = [];

    if (rules) {
      const grouped = new Map(rules.map((rule, index) => [
        rule.key,
        { key: rule.key, order: index, words: [] }
      ]));

      itemRecords.forEach((record) => {
        const rule = rules.find((candidate) => candidate.test(record.normalized));
        if (rule) grouped.get(rule.key).words.push(record);
        else miscItems.push(record);
      });

      mainGroups = [...grouped.values()].filter((group) => group.words.length);
    } else {
      const grouped = new Map();

      itemRecords.forEach((record) => {
        const key = projectReadEndingKey(record.word);
        if (!grouped.has(key)) {
          grouped.set(key, { key, order: record.order, words: [] });
        }
        grouped.get(key).words.push(record);
      });

      const allGroups = [...grouped.values()];
      mainGroups = allGroups.filter((group) => group.words.length > 1);
      miscItems = allGroups
        .filter((group) => group.words.length === 1)
        .sort((a, b) => a.order - b.order)
        .flatMap((group) => group.words);
    }

    const miscNeeded = miscItems.length > 0 && mainGroups.length > 0;
    const availableMainColumns = Math.max(1, desiredColumns - (miscNeeded ? 1 : 0));

    let mainColumns;

    if (rules && mainGroups.length <= availableMainColumns) {
      mainColumns = allocateProjectReadSemanticColumns(mainGroups, availableMainColumns);
    }

    if (!mainColumns) {
      mainColumns = packProjectReadGroups(mainGroups, availableMainColumns);
    }

    if (!mainGroups.length) {
      const chunks = splitProjectReadWordsEvenly(
        miscItems,
        Math.min(desiredColumns, Math.max(1, Math.ceil(Math.sqrt(miscItems.length))))
      );
      return chunks.map((words, index) => ({
        misc: index === chunks.length - 1 && chunks.length > 1,
        groups: [{ key: `misc-${index}`, order: index, words }]
      }));
    }

    const columns = mainColumns.map((groups) => ({ misc: false, groups }));

    if (miscNeeded) {
      columns.push({
        misc: true,
        groups: [{ key: "misc", order: Number.MAX_SAFE_INTEGER, words: miscItems }]
      });
    }

    return columns;
  };

  const enhanceProjectReadWordLists = () => {
    const tables = [...app.querySelectorAll(".project-read-word-table")];

    tables.forEach((table) => {
      const items = [...table.querySelectorAll(".project-read-word-item")];
      if (!items.length) return;

      if (projectReadPlainLatticeLessons.has(String(state.projectReadId).toUpperCase())) {
        const latticeColumns = Math.max(2, Math.ceil(Math.sqrt(items.length)));

        table.innerHTML = "";
        table.classList.remove("project-read-word-table--family-layout", "project-read-word-table--shuffled");
        table.classList.add("project-read-word-table--plain-lattice");
        table.style.setProperty("--pr-plain-cols", String(latticeColumns));

        items.forEach((item, index) => {
          const slot = document.createElement("div");
          slot.className = "project-read-word-slot";
          slot.dataset.wordSlot = String(index);
          item.dataset.defaultSlot = String(index);
          slot.appendChild(item);
          table.appendChild(slot);
        });

        table._projectReadDefaultHtml = table.innerHTML;
        table._projectReadDefaultClassName = table.className;
        table._projectReadDefaultStyle = table.getAttribute("style") || "";
        return;
      }

      const rawColumns = Number(
        String(table.style.getPropertyValue("--pr-word-cols")).trim()
      );
      const desiredColumns = Number.isFinite(rawColumns) && rawColumns > 0
        ? rawColumns
        : Math.min(5, Math.max(2, Math.ceil(Math.sqrt(items.length))));

      const columns = buildProjectReadDefaultColumns(
        items,
        desiredColumns,
        state.projectReadId
      );

      table.innerHTML = "";
      table.classList.add("project-read-word-table--family-layout");
      table.classList.remove("project-read-word-table--shuffled");
      table.style.setProperty("--pr-word-cols", String(Math.max(1, columns.length)));

      let slotIndex = 0;

      columns.forEach((column, columnIndex) => {
        const columnEl = document.createElement("div");
        columnEl.className = `project-read-word-column${column.misc ? " project-read-word-column--misc" : ""}`;
        columnEl.dataset.wordColumn = String(columnIndex);

        column.groups.forEach((group) => {
          const familyEl = document.createElement("div");
          familyEl.className = `project-read-word-family${column.misc ? " project-read-word-family--misc" : ""}`;
          familyEl.dataset.wordFamily = group.key;

          group.words.forEach((record) => {
            const slot = document.createElement("div");
            slot.className = "project-read-word-slot";
            slot.dataset.wordSlot = String(slotIndex);

            record.item.dataset.defaultSlot = String(slotIndex);
            record.item.dataset.ending = projectReadEndingKey(record.word);
            slot.appendChild(record.item);
            familyEl.appendChild(slot);
            slotIndex += 1;
          });

          columnEl.appendChild(familyEl);
        });

        table.appendChild(columnEl);
      });

      table._projectReadDefaultHtml = table.innerHTML;
      table._projectReadDefaultClassName = table.className;
      table._projectReadDefaultStyle = table.getAttribute("style") || "";
    });
  };

  const render = () => {
    const raw = location.hash.replace(/^#/, "") || "home";
    const [route, param, subparam] = raw.split("/");

    setCurrentNav(route);

    switch (route) {
      case "session":
        app.innerHTML = session();
        break;
      case "fast-start":
        app.innerHTML = param ? fastStartDetail(param) : fastStartLibrary();
        break;
      case "project-read":
        app.innerHTML = param ? projectReadDetail(decodeURIComponent(param)) : projectReadLibrary();
        break;
      case "home":
      default:
        setCurrentNav("home");
        app.innerHTML = home();
        break;
    }

    if (route === "project-read" && param) {
      enhanceProjectReadWordLists();
    }

    app.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(syncFastStartActivityHeight);
  };

  document.addEventListener("change", (event) => {
    const setting = event.target.dataset.setting;
    if (!setting) return;

    if (setting === "fastStartNumber") {
      state.fastStartNumber = Number(event.target.value);
      state.fastStartSection = 0;
      state.completed.fastStart = false;
    }

    if (setting === "projectReadId") {
      state.projectReadId = event.target.value;
      state.completed.projectRead = false;
    }

    saveState();
    render();
  });


  const projectReadWordContext = (button) => {
    const section = button.closest(".project-read-word-list");
    const table = section?.querySelector(".project-read-word-table");
    if (!section || !table) return null;

    const items = [...table.querySelectorAll(".project-read-word-item")];
    const slots = [...table.querySelectorAll(".project-read-word-slot")];

    return { section, table, slots, items };
  };

  const animateProjectReadWordMove = (table, items, moveItems) => {
    const firstRects = new Map(
      items.map(item => [item, item.getBoundingClientRect()])
    );

    moveItems();

    table.classList.remove("project-read-word-table--moving");
    void table.offsetWidth;
    table.classList.add("project-read-word-table--moving");

    items.forEach((item) => {
      const first = firstRects.get(item);
      const last = item.getBoundingClientRect();
      if (!first || !last) return;

      const dx = first.left - last.left;
      const dy = first.top - last.top;

      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

      if (typeof item.animate === "function") {
        item.animate(
          [
            {
              transform: `translate(${dx}px, ${dy}px) scale(.96)`,
              boxShadow: "0 10px 24px rgba(68, 78, 112, .20)",
              zIndex: 3
            },
            {
              transform: "translate(0, 0) scale(1)",
              boxShadow: "0 3px 8px rgba(69, 96, 133, .08)",
              zIndex: 1
            }
          ],
          {
            duration: 390,
            easing: "cubic-bezier(.2,.82,.24,1)"
          }
        );
      }
    });

    window.setTimeout(() => {
      table.classList.remove("project-read-word-table--moving");
    }, 420);
  };

  const shuffleProjectReadWords = (button) => {
    const context = projectReadWordContext(button);
    if (!context || context.items.length < 2) return;

    const { table, items } = context;
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const unchanged = shuffled.every((item, index) => item === items[index]);
    if (unchanged && shuffled.length > 1) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    if (!table.classList.contains("project-read-word-table--shuffled")) {
      if (!table._projectReadDefaultHtml) {
        table._projectReadDefaultHtml = table.innerHTML;
        table._projectReadDefaultClassName = table.className;
        table._projectReadDefaultStyle = table.getAttribute("style") || "";
      }

      animateProjectReadWordMove(table, items, () => {
        table.innerHTML = "";
        table.classList.remove("project-read-word-table--family-layout");
        table.classList.add("project-read-word-table--shuffled");

        const shuffleColumns = Math.min(
          7,
          Math.max(2, Math.ceil(Math.sqrt(shuffled.length)))
        );
        table.style.setProperty("--pr-shuffle-cols", String(shuffleColumns));

        shuffled.forEach((item, index) => {
          const slot = document.createElement("div");
          slot.className = "project-read-word-slot";
          slot.dataset.wordSlot = String(index);
          slot.appendChild(item);
          table.appendChild(slot);
        });
      });

      return;
    }

    const slots = [...table.querySelectorAll(".project-read-word-slot")];

    animateProjectReadWordMove(table, items, () => {
      shuffled.forEach((item, index) => {
        slots[index]?.appendChild(item);
      });
    });
  };

  const resetProjectReadWords = (button) => {
    const context = projectReadWordContext(button);
    if (!context) return;

    const { table } = context;

    if (table._projectReadDefaultHtml) {
      table.innerHTML = table._projectReadDefaultHtml;
      table.className = table._projectReadDefaultClassName;
      table.setAttribute("style", table._projectReadDefaultStyle);
      return;
    }

    const items = [...table.querySelectorAll(".project-read-word-item")];
    const allSlots = [...table.querySelectorAll(".project-read-word-slot")];
    const slotByIndex = new Map(
      allSlots.map(slot => [Number(slot.dataset.wordSlot), slot])
    );

    animateProjectReadWordMove(table, items, () => {
      items.forEach((item) => {
        const defaultSlot = Number(item.dataset.defaultSlot);
        const target = slotByIndex.get(defaultSlot);
        if (target) target.appendChild(item);
      });
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;

    if (action === "shuffle-word-list") {
      shuffleProjectReadWords(button);
      return;
    }

    if (action === "reset-word-list") {
      resetProjectReadWords(button);
      return;
    }

    if (action === "toggle-step") {
      const step = button.dataset.step;
      state.completed[step] = !state.completed[step];
      saveState();
      render();
    }

    if (action === "finish-fast-start") {
      state.completed.fastStart = true;
      saveState();
      location.hash = "session";
    }

    if (action === "finish-project-read") {
      state.completed.projectRead = true;
      saveState();
      location.hash = "session";
    }

    if (action === "reset-session") {
      state.completed = { book: false, fastStart: false, projectRead: false };
      state.fastStartSection = 0;
      saveState();
      render();
    }
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("resize", syncFastStartActivityHeight);
  render();
})();
