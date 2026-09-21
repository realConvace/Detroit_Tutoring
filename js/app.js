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
  let pendingCelebration = null;

  const celebrationFireworkAudio = new Audio("assets/audio/Firework_twinkle.ogg");
  celebrationFireworkAudio.preload = "auto";
  celebrationFireworkAudio.volume = 0.7;

  const playCelebrationSound = () => {
    try {
      celebrationFireworkAudio.pause();
      celebrationFireworkAudio.currentTime = 0;
      celebrationFireworkAudio.play().catch(() => {});
    } catch {
      // Keep the visual celebration working even if the browser blocks audio.
    }
  };

  const launchCompletionCelebration = () => {
    document.querySelector(".completion-confetti-canvas")?.remove();

    const canvas = document.createElement("canvas");
    canvas.className = "completion-confetti-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    const context = canvas.getContext("2d");
    if (!context) {
      canvas.remove();
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    resizeCanvas();

    const colors = ["#1f7a84", "#6f5db1", "#f1a65a", "#e78273", "#78aeb6", "#f2cf66"];
    const particles = [];
    const fallingCount = reducedMotion ? 70 : Math.min(240, Math.max(170, Math.round(width / 6)));

    for (let i = 0; i < fallingCount; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: -Math.random() * height * 0.65 - 18,
        vx: (Math.random() - 0.5) * 1.7,
        vy: 2.2 + Math.random() * 3.2,
        gravity: 0.018 + Math.random() * 0.025,
        size: 6 + Math.random() * 8,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.16,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        fade: 0.0028 + Math.random() * 0.0018,
        shape: "confetti"
      });
    }

    const burstPoints = reducedMotion
      ? [[width * 0.5, height * 0.38]]
      : [
          [width * 0.18, height * 0.28],
          [width * 0.5, height * 0.2],
          [width * 0.82, height * 0.32],
          [width * 0.36, height * 0.48],
          [width * 0.68, height * 0.5]
        ];

    burstPoints.forEach(([originX, originY], burstIndex) => {
      const burstCount = reducedMotion ? 18 : 34;
      for (let i = 0; i < burstCount; i += 1) {
        const angle = (Math.PI * 2 * i) / burstCount + Math.random() * 0.08;
        const speed = (reducedMotion ? 1.6 : 2.6) + Math.random() * (reducedMotion ? 1.2 : 2.6);
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.02,
          size: 3.5 + Math.random() * 4.5,
          rotation: Math.random() * Math.PI,
          rotationSpeed: 0,
          color: colors[(i + burstIndex) % colors.length],
          life: 1,
          fade: reducedMotion ? 0.016 : 0.009,
          shape: "spark"
        });
      }
    });

    const startedAt = performance.now();
    const duration = reducedMotion ? 1100 : 3400;
    let previousTime = startedAt;

    const drawFrame = (now) => {
      const delta = Math.min(32, now - previousTime) / 16.67;
      previousTime = now;
      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.vy += particle.gravity * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.rotation += particle.rotationSpeed * delta;
        particle.life = Math.max(0, particle.life - particle.fade * delta);

        if (particle.shape === "confetti" && particle.y > height + 30) {
          particle.y = -20;
          particle.x = Math.random() * width;
        }

        context.save();
        context.globalAlpha = particle.life;
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;

        if (particle.shape === "spark") {
          context.beginPath();
          context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillRect(-particle.size / 2, -particle.size * 0.34, particle.size, particle.size * 0.68);
        }

        context.restore();
      });

      if (now - startedAt < duration) {
        requestAnimationFrame(drawFrame);
      } else {
        canvas.classList.add("completion-confetti-canvas--fade");
        window.setTimeout(() => canvas.remove(), 420);
      }
    };

    window.addEventListener("resize", resizeCanvas, { once: true });
    requestAnimationFrame(drawFrame);
  };

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

  const assessmentOriginalDecks = {
    letters: [...(content.assessment?.letters || [])],
    sounds: [...(content.assessment?.letters || [])],
    words: [...(content.assessment?.words || [])]
  };

  const assessmentDecks = {
    letters: [...assessmentOriginalDecks.letters],
    sounds: [...assessmentOriginalDecks.sounds],
    words: [...assessmentOriginalDecks.words]
  };

  const assessmentPositions = {
    letters: 0,
    sounds: 0,
    words: 0
  };

  const assessmentDeckMeta = {
    letters: {
      part: "Part 1",
      title: "Reading Letters",
      prompt: "Ask the student to say the letter.",
      nextHref: "#assessment/sounds",
      nextLabel: "Next Part: Letter Sounds →"
    },
    sounds: {
      part: "Part 2",
      title: "Letter Sounds",
      prompt: "Ask the student to say the sound this letter makes.",
      nextHref: "#assessment/words",
      nextLabel: "Next Part: Reading Words →"
    },
    words: {
      part: "Part 3",
      title: "Reading Words",
      prompt: "Ask the student to say the word.",
      nextHref: "#assessment/poem-1",
      nextLabel: "Next Part: Read Poem 1 →"
    }
  };

  const assessmentHome = () => `
    <section class="assessment-home card">
      <div class="assessment-home-copy">
        <h1>Reading Assessment</h1>
        <a class="btn assessment-start-button" href="#assessment/letters">Start test</a>
      </div>
    </section>
  `;

  const assessmentDeckPage = (deckKey) => {
    const deck = assessmentDecks[deckKey] || [];
    const meta = assessmentDeckMeta[deckKey];
    if (!meta || !deck.length) return assessmentHome();

    const currentIndex = Math.min(
      Math.max(assessmentPositions[deckKey] || 0, 0),
      Math.max(deck.length - 1, 0)
    );
    assessmentPositions[deckKey] = currentIndex;

    const value = deck[currentIndex] || "";
    const isWord = deckKey === "words";

    return `
      <section class="assessment-page">
        <header class="assessment-stage-header">
          <div>
            <p class="assessment-kicker">${meta.part}</p>
            <h1>${escapeHtml(meta.title)}</h1>
          </div>
          <a class="btn btn-muted" href="#assessment">Assessment Home</a>
        </header>

        <div class="assessment-toolbar" aria-label="${escapeHtml(meta.title)} deck controls">
          <div class="assessment-order-controls">
            <button class="btn btn-secondary" data-action="assessment-shuffle" data-deck="${deckKey}">Shuffle</button>
            <button class="btn btn-muted" data-action="assessment-reset-order" data-deck="${deckKey}">Reset Order</button>
          </div>
          <div class="assessment-card-count">Card ${currentIndex + 1} of ${deck.length}</div>
        </div>

        <div class="assessment-deck-layout">
          <button
            class="assessment-arrow"
            type="button"
            aria-label="Previous card"
            data-action="assessment-prev"
            data-deck="${deckKey}"
            ${currentIndex === 0 ? "disabled" : ""}
          >←</button>

          <div class="assessment-pdf-card ${isWord ? "assessment-pdf-card--word" : "assessment-pdf-card--letter"}">
            <div class="assessment-sky-ribbons" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>

            <div class="assessment-flashcard-value ${isWord ? "assessment-flashcard-word" : "assessment-flashcard-letter"}">
              ${escapeHtml(value)}
            </div>

            <div class="assessment-hills" aria-hidden="true">
              <span class="assessment-hill assessment-hill--back"></span>
              <span class="assessment-hill assessment-hill--middle"></span>
              <span class="assessment-hill assessment-hill--front"></span>
            </div>
          </div>

          <button
            class="assessment-arrow"
            type="button"
            aria-label="Next card"
            data-action="assessment-next"
            data-deck="${deckKey}"
            ${currentIndex === deck.length - 1 ? "disabled" : ""}
          >→</button>
        </div>

        <div class="assessment-deck-mobile-nav" aria-hidden="true">
          <span>Use the left and right arrows to move through the deck.</span>
        </div>

        <div class="button-row assessment-part-navigation">
          <a class="btn btn-muted" href="#assessment">← Assessment Home</a>
          <a class="btn btn-primary" href="${meta.nextHref}">${meta.nextLabel}</a>
        </div>
      </section>
    `;
  };

  const assessmentPoemPage = (poemNumber) => {
    const number = Number(poemNumber);
    const detail = content.fastStartDetails?.[String(number)];
    const title = detail?.displayTitle || content.fastStart?.[number - 1] || `Poem ${number}`;
    const isSecond = number === 2;

    if (!detail?.poemHtml || ![1, 2].includes(number)) return assessmentHome();

    return `
      <section class="assessment-page assessment-poem-page">
        <header class="assessment-stage-header">
          <div>
            <p class="assessment-kicker">${isSecond ? "Part 4.5" : "Part 4"}</p>
            <h1>${isSecond ? "Read the Second Poem" : "Read Poem 1"}</h1>
          </div>
          <a class="btn btn-muted" href="#assessment">Assessment Home</a>
        </header>

        <div class="assessment-poem-card">
          <div class="assessment-poem-title">${escapeHtml(title)}</div>
          <div class="assessment-poem-content">${detail.poemHtml}</div>
        </div>

        <div class="button-row assessment-part-navigation">
          <a class="btn btn-muted" href="${isSecond ? "#assessment/poem-1" : "#assessment/words"}">← Previous Part</a>
          ${isSecond
            ? `<a class="btn btn-success assessment-complete-button" href="#assessment">Finish Assessment</a>`
            : `<a class="btn btn-primary" href="#assessment/poem-2">Next Part: Read Poem 2 →</a>`
          }
        </div>
      </section>
    `;
  };

  const assessmentPage = (part) => {
    if (!part) return assessmentHome();
    if (["letters", "sounds", "words"].includes(part)) return assessmentDeckPage(part);
    if (part === "poem-1") return assessmentPoemPage(1);
    if (part === "poem-2") return assessmentPoemPage(2);
    return assessmentHome();
  };

  let assessmentAnimationBusy = false;

  const animateAssessmentCardChange = (direction, update) => {
    const card = app.querySelector(".assessment-pdf-card");
    if (!card || assessmentAnimationBusy || typeof card.animate !== "function") {
      update();
      render();
      return;
    }

    assessmentAnimationBusy = true;
    const distance = direction === "next" ? -110 : 110;

    const outgoing = card.animate(
      [
        { transform: "translateX(0) rotate(0deg) scale(1)", opacity: 1 },
        { transform: `translateX(${distance}px) rotate(${direction === "next" ? -2.5 : 2.5}deg) scale(.97)`, opacity: 0 }
      ],
      {
        duration: 190,
        easing: "cubic-bezier(.4,0,.7,.2)",
        fill: "forwards"
      }
    );

    outgoing.finished
      .catch(() => {})
      .then(() => {
        update();
        render();

        requestAnimationFrame(() => {
          const nextCard = app.querySelector(".assessment-pdf-card");
          if (!nextCard || typeof nextCard.animate !== "function") {
            assessmentAnimationBusy = false;
            return;
          }

          const incomingDistance = direction === "next" ? 110 : -110;
          const incoming = nextCard.animate(
            [
              {
                transform: `translateX(${incomingDistance}px) rotate(${direction === "next" ? 2.5 : -2.5}deg) scale(.97)`,
                opacity: 0
              },
              { transform: "translateX(0) rotate(0deg) scale(1)", opacity: 1 }
            ],
            {
              duration: 240,
              easing: "cubic-bezier(.2,.82,.24,1)",
              fill: "both"
            }
          );

          incoming.finished
            .catch(() => {})
            .then(() => {
              assessmentAnimationBusy = false;
            });
        });
      });
  };

  const animateAssessmentShuffle = (update) => {
    const card = app.querySelector(".assessment-pdf-card");
    if (!card || assessmentAnimationBusy || typeof card.animate !== "function") {
      update();
      render();
      return;
    }

    assessmentAnimationBusy = true;

    const shuffle = card.animate(
      [
        { transform: "translateX(0) rotate(0deg) scale(1)" },
        { transform: "translateX(-26px) rotate(-3deg) scale(.985)" },
        { transform: "translateX(30px) rotate(3deg) scale(.98)" },
        { transform: "translateX(-18px) rotate(-2deg) scale(.985)" },
        { transform: "translateX(22px) rotate(2deg) scale(.98)" },
        { transform: "translateX(0) rotate(0deg) scale(.96)", opacity: .72 }
      ],
      {
        duration: 430,
        easing: "cubic-bezier(.36,.07,.19,.97)",
        fill: "forwards"
      }
    );

    shuffle.finished
      .catch(() => {})
      .then(() => {
        update();
        render();

        requestAnimationFrame(() => {
          const nextCard = app.querySelector(".assessment-pdf-card");
          if (!nextCard || typeof nextCard.animate !== "function") {
            assessmentAnimationBusy = false;
            return;
          }

          const deal = nextCard.animate(
            [
              { transform: "translateY(-18px) rotate(-1.5deg) scale(.965)", opacity: 0 },
              { transform: "translateY(0) rotate(0deg) scale(1)", opacity: 1 }
            ],
            {
              duration: 260,
              easing: "cubic-bezier(.2,.82,.24,1)",
              fill: "both"
            }
          );

          deal.finished
            .catch(() => {})
            .then(() => {
              assessmentAnimationBusy = false;
            });
        });
      });
  };

  const shuffleAssessmentDeck = (deckKey) => {
    const deck = assessmentDecks[deckKey];
    if (!deck || deck.length < 2) return;

    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const original = assessmentOriginalDecks[deckKey];
    if (deck.every((value, index) => value === original[index])) {
      [deck[0], deck[1]] = [deck[1], deck[0]];
    }

    assessmentPositions[deckKey] = 0;
  };

  const resetAssessmentDeck = (deckKey) => {
    if (!assessmentOriginalDecks[deckKey]) return;
    assessmentDecks[deckKey] = [...assessmentOriginalDecks[deckKey]];
    assessmentPositions[deckKey] = 0;
  };

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
                ${detail.skillSubtextHtml ? `<div class="project-read-skill-subtext">${detail.skillSubtextHtml}</div>` : ""}
                ${detail.skillSubtext ? `<div class="project-read-skill-subtext">${escapeHtml(detail.skillSubtext)}</div>` : ""}
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

  const FAST_START_STANZA_BREAKS = Object.freeze({
    3: [4],
    6: [4, 8],
    10: [4],
    15: [4],
    16: [4],
    19: [3, 6],
    23: [4],
    25: [4],
    26: [4, 8],
    27: [2, 4],
    30: [4, 8, 12],
    32: [4, 8],
    35: [2, 4, 8, 10],
    36: [4, 8],
    37: [4],
    38: [4],
    40: [4],
    41: [4],
    42: [4],
    43: [4, 8, 12],
    44: [2, 4, 6, 8, 10],
    47: [4],
    48: [4, 8],
    49: [4],
    50: [4, 8, 12],
    51: [1, 3, 5, 7, 9],
    57: [2, 4, 6, 8, 10, 12],
    58: [2, 8],
    60: [5]
  });

  const formatFastStartPoem = (number) => {
    const poemLines = app.querySelector(".poem-lines");
    if (!poemLines) return;

    [...poemLines.children]
      .filter((child) => child.classList.contains("poem-stanza-gap"))
      .forEach((gap) => gap.remove());

    const lines = [...poemLines.children];
    const stanzaBreaks = FAST_START_STANZA_BREAKS[Number(number)] || [];

    [...stanzaBreaks]
      .sort((a, b) => b - a)
      .forEach((lineNumber) => {
        const line = lines[lineNumber - 1];
        if (!line) return;

        const gap = document.createElement("div");
        gap.className = "poem-stanza-gap";
        gap.setAttribute("aria-hidden", "true");
        line.after(gap);
      });

    poemLines.style.fontSize = "";

    const poemWidth = poemLines.clientWidth;
    if (!poemWidth) return;

    const textLines = [...poemLines.children].filter(
      (child) => !child.classList.contains("poem-stanza-gap")
    );

    let fontSize = parseFloat(getComputedStyle(poemLines).fontSize) || 32;
    const minimumFontSize = window.matchMedia("(max-width: 560px)").matches ? 15 : 18;

    for (let pass = 0; pass < 4; pass += 1) {
      const widest = Math.max(
        poemWidth,
        ...textLines.map((line) => line.scrollWidth)
      );

      if (widest <= poemWidth + 1) break;

      const nextSize = Math.max(
        minimumFontSize,
        fontSize * (poemWidth / widest) * 0.985
      );

      if (Math.abs(nextSize - fontSize) < 0.2) break;

      fontSize = nextSize;
      poemLines.style.fontSize = `${fontSize}px`;
    }
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
  const projectReadPlainLatticeLessons = new Set(["22A", "22B"]);

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
      case "assessment":
        app.innerHTML = assessmentPage(param);
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

    if (route === "session" && pendingCelebration) {
      pendingCelebration = null;
      requestAnimationFrame(launchCompletionCelebration);
    }

    app.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });

    requestAnimationFrame(() => {
      if (route === "fast-start" && param) {
        formatFastStartPoem(Number(param));
      }
      syncFastStartActivityHeight();
    });
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

    if (action === "assessment-prev" || action === "assessment-next") {
      const deckKey = button.dataset.deck;
      const deck = assessmentDecks[deckKey];
      if (!deck?.length || assessmentAnimationBusy) return;

      const change = action === "assessment-next" ? 1 : -1;
      const current = assessmentPositions[deckKey] || 0;
      const next = Math.min(deck.length - 1, Math.max(0, current + change));
      if (next === current) return;

      animateAssessmentCardChange(
        action === "assessment-next" ? "next" : "prev",
        () => {
          assessmentPositions[deckKey] = next;
        }
      );
      return;
    }

    if (action === "assessment-shuffle") {
      if (assessmentAnimationBusy) return;
      const deckKey = button.dataset.deck;
      animateAssessmentShuffle(() => shuffleAssessmentDeck(deckKey));
      return;
    }

    if (action === "assessment-reset-order") {
      if (assessmentAnimationBusy) return;
      const deckKey = button.dataset.deck;
      animateAssessmentShuffle(() => resetAssessmentDeck(deckKey));
      return;
    }

    if (action === "toggle-step") {
      const step = button.dataset.step;
      const wasComplete = Boolean(state.completed[step]);
      state.completed[step] = !wasComplete;

      if (!wasComplete && state.completed[step]) {
        playCelebrationSound();
        pendingCelebration = step;
      }

      saveState();
      render();
    }

    if (action === "finish-fast-start") {
      const wasComplete = Boolean(state.completed.fastStart);
      state.completed.fastStart = true;

      if (!wasComplete) {
        playCelebrationSound();
        pendingCelebration = "fastStart";
      }

      saveState();
      location.hash = "session";
    }

    if (action === "finish-project-read") {
      const wasComplete = Boolean(state.completed.projectRead);
      state.completed.projectRead = true;

      if (!wasComplete) {
        playCelebrationSound();
        pendingCelebration = "projectRead";
      }

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

  window.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const raw = location.hash.replace(/^#/, "");
    const [route, part] = raw.split("/");
    if (route !== "assessment" || !["letters", "sounds", "words"].includes(part)) return;

    const deck = assessmentDecks[part];
    if (!deck?.length) return;

    if (assessmentAnimationBusy) return;

    const change = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = Math.min(
      deck.length - 1,
      Math.max(0, (assessmentPositions[part] || 0) + change)
    );

    if (nextIndex === assessmentPositions[part]) return;

    event.preventDefault();
    animateAssessmentCardChange(
      event.key === "ArrowRight" ? "next" : "prev",
      () => {
        assessmentPositions[part] = nextIndex;
      }
    );
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("resize", syncFastStartActivityHeight);
  render();
})();
