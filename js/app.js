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
    <section class="hero">
      <p class="eyebrow">Reading tutoring</p>
      <h1>One simple flow for each tutoring session.</h1>
      <p>
        Start with an in-person book, continue with one Fast Start for Early Readers section,
        then move into the selected Project Read lesson.
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#session">Start today's session</a>
        <a class="btn btn-ghost" href="#fast-start">Browse Fast Start</a>
      </div>
    </section>

    <section class="home-grid" aria-label="Tutoring routine">
      <article class="card">
        <div class="icon-chip">1</div>
        <h2>IRL Book</h2>
        <p>Read a physical book together for about 5 minutes. There is no website timer.</p>
      </article>

      <article class="card">
        <div class="icon-chip orange">2</div>
        <h2>Fast Start</h2>
        <p>Complete one numbered Fast Start lesson: the poem followed by its three activity sections.</p>
      </article>

      <article class="card">
        <div class="icon-chip purple">3</div>
        <h2>Project Read</h2>
        <p>Finish the session with the Project Read lesson selected for the student.</p>
      </article>
    </section>
  `;

  const session = () => {
    const done = completedCount();
    const percentage = Math.round((done / 3) * 100);

    return `
      <div class="page-heading">
        <div>
          <p class="eyebrow" style="color:var(--primary)">Session mode</p>
          <h1>Today's tutoring session</h1>
          <p>Use the steps in order. Your selections and checkmarks stay saved on this device.</p>
        </div>
        <button class="btn btn-muted" data-action="reset-session">Reset session</button>
      </div>

      <div class="dashboard-grid">
        <section>
          <div class="session-stack">
            <article class="session-step ${state.completed.book ? "is-complete" : ""}">
              <div class="step-number">${state.completed.book ? "✓" : "1"}</div>
              <div>
                <h3>Read an IRL Book</h3>
                <p>Read a physical book together for about 5 minutes. No timer is used on the website.</p>
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
                <h3>Fast Start #${state.fastStartNumber}: ${escapeHtml(fastStartTitle())}</h3>
                <p>Read the poem, then complete Looking at Words and Letters, Playing With Sounds, and Beginning to Read.</p>
              </div>
              <div class="step-action">
                <a class="btn btn-secondary" href="#fast-start/${state.fastStartNumber}">Open Fast Start</a>
              </div>
            </article>

            <article class="session-step ${state.completed.projectRead ? "is-complete" : ""}">
              <div class="step-number">${state.completed.projectRead ? "✓" : "3"}</div>
              <div>
                <h3>Project Read: ${escapeHtml(projectReadLesson().label)}</h3>
                <p>Continue with the Project Read lesson selected for today's session.</p>
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
          <p>Choose the Fast Start number and Project Read lesson before beginning.</p>

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

          <div class="notice" style="margin-top:18px">
            <strong>Content fidelity:</strong> curriculum text will be stored separately from the interface
            so the wording can be imported exactly from the provided source materials.
          </div>
        </aside>
      </div>
    `;
  };

  const fastStartLibrary = () => `
    <div class="page-heading">
      <div>
        <p class="eyebrow" style="color:var(--accent)">Fast Start for Early Readers</p>
        <h1>Choose a Fast Start</h1>
        <p>The provided PDF contains 60 numbered poem-and-activity lessons.</p>
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

    return `
      <div class="lesson-hero fast-start">
        <span class="lesson-number">Fast Start #${n}</span>
        <h1>${escapeHtml(title)}</h1>
        <p>Read the poem, then complete the three activity sections beside it.</p>
      </div>

      <div class="fast-start-workspace">
        <section class="curriculum-section fast-start-poem">
          <header>
            <span class="section-index">1</span>
            <h2>${escapeHtml(poemSection)}</h2>
          </header>
          ${detail?.poemHtml
            ? `<div class="source-content poem-content">${detail.poemHtml}</div>`
            : `<div class="curriculum-placeholder poem-placeholder">
                Exact source wording for Fast Start #${n}, ${escapeHtml(poemSection)}, will be inserted here from the provided PDF.
                The interface will not paraphrase or rewrite it.
              </div>`
          }
        </section>

        <div class="fast-start-activities">
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

        <button class="btn btn-success" data-action="finish-fast-start">✓ Finish Fast Start</button>

        ${nextFastStart
          ? `<a class="btn btn-primary" href="#fast-start/${nextFastStart}">Next Fast Start →</a>`
          : ""
        }
      </div>
    `;
  };

  const projectReadLibrary = () => `
    <div class="page-heading">
      <div>
        <p class="eyebrow" style="color:var(--secondary)">Project Read</p>
        <h1>Choose a Project Read lesson</h1>
        <p>Lessons 1–14 are available in the source set, with Lesson 13 divided into A, B, and C.</p>
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

    if (state.projectReadId !== lesson.id) {
      state.completed.projectRead = false;
    }

    state.projectReadId = lesson.id;
    saveState();

    return `
      <div class="lesson-hero">
        <span class="lesson-number">Project Read</span>
        <h1>${escapeHtml(lesson.label)}</h1>
        <p>${detail ? `${escapeHtml(detail.unit)} · SKILL: ${escapeHtml(detail.skill)}` : "Exact instructional content from the provided Project Read source document."}</p>
      </div>

      <div class="section-list">
        <section class="curriculum-section">
          <header>
            <span class="section-index">PR</span>
            <h2>${escapeHtml(lesson.label)} curriculum</h2>
          </header>
          ${detail
            ? `<div class="source-content project-read-content">
                <div class="project-read-meta">
                  <div class="project-read-unit">${escapeHtml(detail.unit)}</div>
                  <div><strong>SKILL:</strong>&nbsp;&nbsp;${escapeHtml(detail.skill)}</div>
                </div>
                ${detail.bodyHtml}
              </div>`
            : `<div class="curriculum-placeholder">
                The exact lesson content will be imported from the original Project Read file. Short-vowel symbols
                such as ă, ĭ, ŏ, ĕ, and ŭ will be preserved exactly.
              </div>`
          }
        </section>
      </div>

      <div class="button-row">
        ${previousLesson
          ? `<a class="btn btn-muted" href="#project-read/${encodeURIComponent(previousLesson.id)}">← Previous Project Read</a>`
          : `<a class="btn btn-muted" href="#session">Back to session</a>`
        }

        <button class="btn btn-success" data-action="finish-project-read">✓ Finish Project Read</button>

        ${nextLesson
          ? `<a class="btn btn-primary" href="#project-read/${encodeURIComponent(nextLesson.id)}">Next Project Read →</a>`
          : ""
        }
      </div>
    `;
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

    app.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
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

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;

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
  render();
})();
