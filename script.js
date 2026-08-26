/* ══════════════════════════════════════════════════
   STS Initiative v2, Interactions + Diagnostic
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ──────────────── SCROLL REVEAL ──────────────── */
  const revealTargets = [
    '.problem__head', '.problem__text', '.problem__photo',
    '.tri-stat', '.framework__header-text',
    '.fw-step', '.approach__big-quote', '.approach__col',
    '.audience__head', '.aud-tile', '.evidence__head',
    '.evid-block', '.founder__portrait', '.founder__text',
    '.cta-block__inner', '.glossary__head', '.glossary-entry',
    '.roadmaps__head', '.roadmaps__tabs', '.comms__head', '.comms__panel'
  ];
  document.querySelectorAll(revealTargets.join(',')).forEach(el => {
    el.classList.add('will-reveal');
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        setTimeout(() => e.target.classList.add('revealed'), i * 60);
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
    document.querySelectorAll('.will-reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.will-reveal').forEach(el => el.classList.add('revealed'));
  }

  /* ──────────────── ACTIVE NAV ─────────────────── */
  const navAnchors = Array.from(document.querySelectorAll('.nav__links a'));
  const navSections = navAnchors
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navSections.length) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = '#' + e.target.id;
          navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-35% 0px -58% 0px' });
    navSections.forEach(s => navIO.observe(s));
  }

  /* ──────────────── MOBILE DRAWER ──────────────── */
  const drawer = document.getElementById('drawer');

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.querySelector('.nav__hamburger').setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.querySelector('.nav__hamburger').setAttribute('aria-expanded', 'false');
  }

  document.querySelector('.js-menu-open').addEventListener('click', openDrawer);
  document.querySelectorAll('.js-menu-close').forEach(el => el.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* ──────────────── DIAGNOSTIC ─────────────────── */
  const modal       = document.getElementById('diagModal');
  const progFill    = document.getElementById('diagProgress');
  const stepLabel   = document.getElementById('diagStepLabel');
  const diagBody    = document.getElementById('diagBody');
  const diagControls = document.getElementById('diagControls');
  const diagResults = document.getElementById('diagResults');
  const resultContent = document.getElementById('diagResultContent');
  const btnBack     = document.getElementById('diagBack');
  const btnNext     = document.getElementById('diagNext');
  const btnRetake   = document.getElementById('diagRetake');

  let step = 0;
  const answers = {};

  /* ── Questions ── */
  const questions = [
    {
      id: 'sector',
      text: 'What type of business do you run?',
      scored: false,
      options: [
        { label: 'Retail or Food Service',                                   value: 'retail'        },
        { label: 'Professional Services (accounting, consulting, legal…)',   value: 'professional'  },
        { label: 'Local Manufacturing or Trades',                            value: 'manufacturing' },
        { label: 'Health & Wellness',                                        value: 'health'        },
        { label: 'Construction or Skilled Trades',                           value: 'construction'  },
        { label: 'Other',                                                    value: 'other'         },
      ],
    },
    {
      id: 'size',
      text: 'How many people work in your business, including yourself?',
      scored: false,
      options: [
        { label: 'Just me',             value: 'solo'   },
        { label: '2 to 5 people',       value: 'tiny'   },
        { label: '6 to 20 people',      value: 'small'  },
        { label: '21 to 50 people',     value: 'medium' },
        { label: 'More than 50 people', value: 'large'  },
      ],
    },
    {
      id: 'tech',
      text: 'Which best describes the technology your business uses today?',
      scored: true,
      options: [
        { label: 'Mostly paper and manual processes',                            value: 0 },
        { label: 'Basic tools — spreadsheets, email, a simple POS',             value: 1 },
        { label: 'Some business software (QuickBooks, scheduling apps…)',        value: 2 },
        { label: 'Multiple connected software systems',                          value: 3 },
      ],
    },
    {
      id: 'challenge',
      text: 'What is your biggest day-to-day business challenge right now?',
      scored: false,
      options: [
        { label: 'Finding and keeping customers',           value: 'customers'   },
        { label: 'Managing daily operations efficiently',   value: 'operations'  },
        { label: 'Keeping costs under control',             value: 'costs'       },
        { label: 'Competing with larger businesses',        value: 'competition' },
        { label: 'Managing employees and scheduling',       value: 'employees'   },
      ],
    },
    {
      id: 'comfort',
      text: 'How comfortable is your team with learning new technology?',
      scored: true,
      options: [
        { label: 'We avoid new tech whenever possible',                         value: 0 },
        { label: 'We use what we have to, but keep it as simple as possible',   value: 1 },
        { label: 'Most of us are comfortable picking up new tools',             value: 2 },
        { label: 'We actively seek out better tools and adopt them quickly',    value: 3 },
      ],
    },
    {
      id: 'budget',
      text: 'What is your realistic monthly budget for new business tools or software?',
      scored: false,
      options: [
        { label: 'Nothing right now',         value: 'none' },
        { label: 'Up to $50 per month',       value: 'low'  },
        { label: '$51 to $200 per month',     value: 'mid'  },
        { label: '$200 or more per month',    value: 'high' },
      ],
    },
    {
      id: 'awareness',
      text: 'How would you describe your current relationship with AI tools for business?',
      scored: true,
      options: [
        { label: "I haven't really looked into AI for my business",   value: 0 },
        { label: "I've heard about it but think it's not for me",     value: 1 },
        { label: "I'm curious but don't know where to start",         value: 2 },
        { label: "I've already tried some AI tools",                  value: 3 },
      ],
    },
    {
      id: 'concern',
      text: 'What is your biggest hesitation about AI right now?',
      scored: false,
      options: [
        { label: "I'm not sure AI is relevant to my type of business",  value: 'relevance'    },
        { label: 'It seems too expensive for a business my size',       value: 'cost'         },
        { label: "I'm worried about my employees' reaction",            value: 'employees'    },
        { label: "I don't understand how it works",                     value: 'understanding'},
        { label: 'I have no major hesitations',                         value: 'none'         },
      ],
    },
    {
      id: 'openness',
      text: 'How do you typically approach new ideas or changes in your business?',
      scored: true,
      options: [
        { label: 'I need a lot of convincing before trying something new',   value: 0 },
        { label: "I'll try something if I see clear proof it works",         value: 1 },
        { label: "I'm generally open to trying new approaches",              value: 2 },
        { label: 'I actively seek out new tools and strategies',             value: 3 },
      ],
    },
    {
      id: 'support',
      text: 'Who is most likely to lead a technology change in your business?',
      scored: false,
      options: [
        { label: 'Me — I make all decisions myself',           value: 'owner'      },
        { label: 'An employee who handles our tech',           value: 'employee'   },
        { label: "We'd need outside guidance to get started",  value: 'outside'    },
        { label: 'I work with a consultant or advisor',        value: 'consultant' },
      ],
    },
    {
      id: 'goal',
      text: 'Where would you most want AI to help your business first?',
      scored: false,
      options: [
        { label: 'Saving time on repetitive tasks',              value: 'automation' },
        { label: 'Communicating better with customers',          value: 'customers'  },
        { label: 'Managing inventory, scheduling, or logistics', value: 'operations' },
        { label: 'Understanding my business data and trends',    value: 'analytics'  },
        { label: 'Marketing and reaching new customers',         value: 'marketing'  },
      ],
    },
  ];

  /* ── Scoring ── */
  function calcScore() {
    return questions.reduce((sum, q) => {
      if (q.scored && answers[q.id] !== undefined) return sum + Number(answers[q.id]);
      return sum;
    }, 0);
  }

  function profileKey(score) {
    if (score <= 3) return 'early';
    if (score <= 7) return 'ready';
    return 'strategic';
  }

  /* ── Profile content ── */
  const sectorLabels = {
    retail: 'Retail & Food Service', professional: 'Professional Services',
    manufacturing: 'Local Manufacturing & Trades', health: 'Health & Wellness',
    construction: 'Construction & Skilled Trades', other: 'Your Sector',
  };
  const challengeMap = {
    customers:   'the Strategic Communication Modules and Peer Learning Library',
    operations:  'the Sector-Specific Adoption Roadmaps and Visual Storytelling System',
    costs:       'the Diagnostic Roadmap and the Plain-Language AI Glossary',
    competition: 'the Sector-Specific Roadmaps and Peer Learning Library',
    employees:   'the Strategic Communication Modules, designed to build trust, not resistance',
  };
  const goalMap = {
    automation: 'scheduling tools, automated email responses, and AI-powered task management',
    customers:  'customer service chatbots, personalized email tools, and review management',
    operations: 'inventory forecasting, demand planning, and logistics optimization',
    analytics:  'sales dashboards, customer behavior tracking, and trend reporting',
    marketing:  'AI writing assistants, ad targeting tools, and social content schedulers',
  };

  /* Maps a framework resource name to an in-page destination.
     Only resources that currently exist as real, navigable content
     are linked, everything else stays plain text until it's built. */
  const resourceLinks = {
    'Plain-Language AI Glossary': '#glossary',
    'Sector-Specific Adoption Roadmaps': '#roadmaps',
    'Strategic Communication Modules': '#comms',
  };

  const profiles = {
    early: {
      name: 'Early Explorer',
      desc: "You're at the very beginning of your AI journey, and that is exactly the right place to start. The most important step right now is building a clear, honest understanding of what AI actually is and what it can realistically do for a business like yours. There is no rush. The path is clear.",
      steps: [
        'Start with the Plain-Language AI Glossary to build vocabulary without jargon',
        'Browse the Peer Learning Library, real stories from owners in your exact sector',
        'Return to the diagnostic in 30 days; your readiness score will likely shift',
      ],
      resources: ['Plain-Language AI Glossary', 'Peer Learning & Case Study Library', 'Visual Storytelling System'],
    },
    ready: {
      name: 'Ready Starter',
      desc: "You have the foundation, the technology literacy, the openness, the awareness. What you need now is a structured, specific path tailored to your sector and your challenges. You are closer than you think.",
      steps: [
        'Download your Sector-Specific Adoption Roadmap for a phased, realistic plan',
        'Use the Strategic Communication Modules before introducing AI to your team',
        'Identify one task in your business to automate or assist in the next 90 days',
      ],
      resources: ['Sector-Specific Adoption Roadmaps', 'Strategic Communication Modules', 'AI Adoption Diagnostic Tool'],
    },
    strategic: {
      name: 'Strategic Adopter',
      desc: "You are ahead of 82% of businesses your size. You have the technology comfort, the openness, and the awareness to move from curiosity to implementation. The question is no longer whether, it is where and in what order.",
      steps: [
        'Use the full six-component framework to build your 12-month AI strategy',
        'Connect with the Peer Learning Library to find implementation partners',
        'Consider contributing your experience to the case study library for others',
      ],
      resources: ['Full Six-Component Framework', 'Peer Learning & Case Study Library', 'Sector-Specific Adoption Roadmaps'],
    },
  };

  /* ── Render question ── */
  function renderQ(i) {
    const q     = questions[i];
    const total = questions.length;

    progFill.style.width     = ((i / total) * 100) + '%';
    stepLabel.textContent    = 'Question ' + (i + 1) + ' of ' + total;
    btnBack.disabled         = i === 0;
    btnNext.textContent      = i === total - 1 ? 'See My Results' : 'Continue';

    diagBody.innerHTML = `
      <div class="diag-question" role="group" aria-labelledby="qt${i}">
        <p class="diag-q-text" id="qt${i}">${q.text}</p>
        <div class="diag-options">
          ${q.options.map((opt, j) => `
            <div class="diag-option">
              <input
                type="radio"
                name="dq_${q.id}"
                id="do_${q.id}_${j}"
                value="${opt.value}"
                ${answers[q.id] === String(opt.value) ? 'checked' : ''}
              />
              <label for="do_${q.id}_${j}">${opt.label}</label>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* ── Show results ── */
  function showResults() {
    progFill.style.width = '100%';
    stepLabel.textContent = 'Your results are ready';
    diagBody.hidden = true;
    diagControls.hidden = true;
    diagResults.hidden = false;

    const score   = calcScore();
    const key     = profileKey(score);
    const profile = profiles[key];
    const sector  = sectorLabels[answers.sector] || 'Your Sector';
    const cTool   = challengeMap[answers.challenge] || 'the full six-component framework';
    const gTool   = goalMap[answers.goal] || 'AI tools tailored to your business';

    resultContent.innerHTML = `
      <div class="result-badge">
        <p class="result-badge__label">Your AI Readiness Profile</p>
        <h3 class="result-badge__name">${profile.name}</h3>
        <p class="result-badge__desc">${profile.desc}</p>
      </div>

      <div class="result-section">
        <h4>For ${sector} Businesses</h4>
        <ul>
          <li>To address your primary challenge, we recommend ${cTool}.</li>
          <li>For your goal area, explore ${gTool} as practical first steps.</li>
        </ul>
      </div>

      <div class="result-section">
        <h4>Your Next Three Steps</h4>
        <ul>
          ${profile.steps.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div class="result-section">
        <h4>Most Relevant Framework Resources</h4>
        <ul>
          ${profile.resources.map(r => resourceLinks[r]
            ? `<li><a href="${resourceLinks[r]}" class="result-link js-resource-link">${r} &rarr;</a></li>`
            : `<li>${r}</li>`
          ).join('')}
        </ul>
      </div>
    `;
  }

  /* ── Next / Back ── */
  function advance() {
    const q   = questions[step];
    const sel = diagBody.querySelector(`input[name="dq_${q.id}"]:checked`);
    if (!sel) {
      const opts = diagBody.querySelector('.diag-options');
      opts.style.animation = 'none';
      requestAnimationFrame(() => {
        opts.style.animation = '';
        opts.style.animation = 'nudge 0.35s ease';
      });
      return;
    }
    answers[q.id] = sel.value;
    if (step < questions.length - 1) {
      step++;
      renderQ(step);
    } else {
      showResults();
    }
  }

  btnNext.addEventListener('click', advance);
  btnBack.addEventListener('click', () => {
    if (step > 0) { step--; renderQ(step); }
  });
  diagBody.addEventListener('keydown', e => { if (e.key === 'Enter') advance(); });

  /* ── Open / Close modal ── */
  function openModal() {
    step = 0;
    Object.keys(answers).forEach(k => delete answers[k]);
    modal.removeAttribute('hidden');
    diagBody.hidden     = false;
    diagControls.hidden = false;
    diagResults.hidden  = true;
    document.body.style.overflow = 'hidden';
    renderQ(0);
    closeDrawer();

    // Reset the results screen back to page 1, and clear out any
    // previously-built action plan so a retake starts fresh.
    if (diagPageSummary && diagPageReport) {
      diagPageSummary.hidden = false;
      diagPageReport.hidden = true;
    }
    if (reportForm) reportForm.reset();
    if (reportSubmit) reportSubmit.disabled = true;
    if (reportError) reportError.hidden = true;
    if (reportFull) { reportFull.hidden = true; reportFull.innerHTML = ''; }
    if (reportPrintable) reportPrintable.innerHTML = '';
    // focus the panel for keyboard users
    setTimeout(() => {
      const panel = modal.querySelector('.diag-modal__box');
      panel.setAttribute('tabindex', '-1');
      panel.focus();
    }, 80);
  }
  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.js-diag-open').forEach(btn => btn.addEventListener('click', openModal));
  document.querySelectorAll('.js-diag-close').forEach(el => el.addEventListener('click', closeModal));
  if (btnRetake) btnRetake.addEventListener('click', openModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal(); });

  /* Clicking a linked resource in the results panel (e.g. the Glossary)
     should close the modal so the destination section is actually visible. */
  resultContent.addEventListener('click', (e) => {
    const link = e.target.closest('.js-resource-link');
    if (link) closeModal();
  });

  /* ── Nudge animation (injected once) ── */
  const nudgeStyle = document.createElement('style');
  nudgeStyle.textContent = `
    @keyframes nudge {
      0%,100% { transform: translateX(0); }
      25%      { transform: translateX(-8px); }
      75%      { transform: translateX(8px); }
    }
  `;
  document.head.appendChild(nudgeStyle);

  /* ──────────────── COUNTER ANIMATION ──────────────── */
  if ('IntersectionObserver' in window) {
    const cntIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el   = entry.target;
        const raw  = el.dataset.count;
        if (!raw) return;
        const num  = parseFloat(raw);
        const decimalPlaces = (raw.split('.')[1] || '').length;
        const dur  = 1400;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = num * eased;
          el.dataset.display = decimalPlaces > 0 ? val.toFixed(decimalPlaces) : Math.round(val);
          el.firstChild.nodeValue = el.dataset.display;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cntIO.unobserve(el);
      });
    }, { threshold: 0.5 });

    // Tag stats for counting
    document.querySelectorAll('.stat-pill__num').forEach(el => {
      const txt = el.textContent.trim();
      const match = txt.match(/^[\d.]+/);
      if (match) {
        el.dataset.count = match[0];
        el.dataset.suffix = txt.slice(match[0].length);
      }
      cntIO.observe(el);
    });
  }

  /* ──────────────── HERO PARALLAX (subtle) ──────────── */
  const heroPhotos = document.querySelector('.hero__photos');
  if (heroPhotos && window.matchMedia('(min-width: 1024px)').matches) {
    let raf = false;
    window.addEventListener('scroll', () => {
      if (!raf) {
        raf = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < 900) {
            heroPhotos.style.transform = `translateY(${y * 0.08}px)`;
          }
          raf = false;
        });
      }
    }, { passive: true });
  }

  /* ──────────────── GLOSSARY SEARCH ──────────────── */
  const glossarySearch = document.getElementById('glossarySearch');
  const glossaryEntries = Array.from(document.querySelectorAll('.glossary-entry'));
  const glossaryEmpty   = document.getElementById('glossaryEmpty');
  const glossaryQuery   = document.getElementById('glossaryQuery');

  if (glossarySearch && glossaryEntries.length) {
    glossarySearch.addEventListener('input', () => {
      const q = glossarySearch.value.trim().toLowerCase();
      let visible = 0;
      glossaryEntries.forEach(entry => {
        const term = (entry.dataset.term || '').toLowerCase();
        const text = entry.textContent.toLowerCase();
        const match = !q || term.includes(q) || text.includes(q);
        entry.classList.toggle('glossary-entry--hidden', !match);
        if (match) visible++;
      });
      if (glossaryEmpty) {
        glossaryEmpty.hidden = visible !== 0;
        if (glossaryQuery) glossaryQuery.textContent = glossarySearch.value.trim();
      }
    });
  }

  /* ──────────────── SECTOR-SPECIFIC ADOPTION ROADMAPS ──────────────── */
  const sectorRoadmaps = {
    retail: [
      { title: 'Get Ready',        desc: 'Walk your own floor and back office for a week and note every repetitive task, reordering stock, answering the same three customer questions, building the schedule. Talk to your staff before you talk to any vendor; their buy-in now saves you a rollout fight later.' },
      { title: 'Start Small',      desc: 'Pick one narrow, low-risk tool: a chatbot that answers store-hours and return-policy questions, or a simple inventory-reorder assistant. Run it alongside your current process for 30 days rather than replacing anything outright.' },
      { title: 'Build Confidence', desc: 'Once the first tool is routine, layer in AI-assisted scheduling or social media post drafting. Measure something concrete, hours saved per week, faster response times, so the case for the next step is evidence, not enthusiasm.' },
      { title: 'Make It Standard', desc: 'Fold the tools that worked into how you train new hires and write your SOPs. Revisit the stack every quarter, retail moves fast, and the tool that fit you at 5 employees may not fit you at 15.' },
    ],
    professional: [
      { title: 'Get Ready',        desc: 'Audit where your time actually goes: intake calls, drafting routine documents, scheduling, billing. Flag anything that is high-volume and low-judgment, that is where AI has the best risk-to-reward ratio for a licensed practice.' },
      { title: 'Start Small',      desc: 'Introduce an AI drafting assistant for routine correspondence or a scheduling/intake tool, always with a human reviewing output before it reaches a client. Keep the scope narrow enough that a mistake is easy to catch and cheap to fix.' },
      { title: 'Build Confidence', desc: 'Extend into research support or document summarization for case or client files, with the same review discipline. Track time saved per engagement so you can show clients and staff the tool is adding rigor, not cutting corners.' },
      { title: 'Make It Standard', desc: 'Write the review step into your firm\'s standard workflow so it survives staff turnover. Reassess annually against your licensing board\'s guidance, since professional-services AI rules are still evolving.' },
    ],
    manufacturing: [
      { title: 'Get Ready',        desc: 'Map your production floor for the slowest or most error-prone manual step, often quality inspection, inventory counts, or maintenance scheduling. Loop in your floor supervisors early; they will spot the practical obstacles you can\'t see from the office.' },
      { title: 'Start Small',      desc: 'Pilot one contained tool, such as predictive-maintenance alerts on a single machine line or an AI-assisted inventory count, before touching anything safety-critical. A small, visible win builds trust for the next step.' },
      { title: 'Build Confidence', desc: 'Expand successful pilots to additional lines and add AI-assisted quality inspection or demand forecasting. Keep a paper trail of defect-rate or downtime changes, trades crews and owners alike respond to numbers, not slogans.' },
      { title: 'Make It Standard', desc: 'Bake the tools into standard operating procedure and new-hire training. Schedule a yearly review tied to your equipment maintenance cycle so the technology stays aligned with what\'s actually on the floor.' },
    ],
    health: [
      { title: 'Get Ready',        desc: 'Identify the administrative burden that is not direct patient care, scheduling, intake forms, appointment reminders, billing follow-up. Confirm with your compliance advisor which categories of tool are appropriate for your license type before you evaluate vendors.' },
      { title: 'Start Small',      desc: 'Start with a narrow administrative tool, such as automated appointment reminders or intake-form digitization, that never touches clinical decision-making. Run it in parallel with your existing process until staff trust it.' },
      { title: 'Build Confidence', desc: 'Add patient-communication tools like automated follow-up messages or wait-time updates. Track no-show rates and patient-satisfaction feedback so you can show the change is helping care delivery, not just cutting cost.' },
      { title: 'Make It Standard', desc: 'Formalize the tools into your practice\'s standard operating procedures and staff onboarding. Revisit annually with your compliance advisor as healthcare AI guidance continues to develop.' },
    ],
    construction: [
      { title: 'Get Ready',        desc: 'Look at where estimating, scheduling, or subcontractor coordination eats the most time between bid and breaking ground. Talk to your project leads and field crews first, the tool has to survive a job site, not just a demo.' },
      { title: 'Start Small',      desc: 'Pilot one tool with clear ROI, like AI-assisted cost estimating or a scheduling assistant that tracks subcontractor availability. Test it on a single project before rolling it out company-wide.' },
      { title: 'Build Confidence', desc: 'Layer in progress-tracking tools, photo-based site documentation or AI-assisted punch-list management. Compare bid accuracy and schedule slippage before and after so the numbers make the case to your crews.' },
      { title: 'Make It Standard', desc: 'Write the successful tools into your standard bidding and project-management process. Reassess each season, since crew composition and project mix on a construction business change more than most.' },
    ],
  };

  const roadmapTabs   = document.getElementById('roadmapTabs');
  const roadmapPhases = document.getElementById('roadmapPhases');

  function renderRoadmap(sector) {
    const phases = sectorRoadmaps[sector] || sectorRoadmaps.retail;
    if (!roadmapPhases) return;
    roadmapPhases.innerHTML = phases.map((p, i) => `
      <li class="roadmap-phase">
        <p class="roadmap-phase__num">Phase ${i + 1} of ${phases.length}</p>
        <h3 class="roadmap-phase__title">${p.title}</h3>
        <p class="roadmap-phase__desc">${p.desc}</p>
      </li>
    `).join('');
  }

  if (roadmapTabs && roadmapPhases) {
    const tabs = Array.from(roadmapTabs.querySelectorAll('.roadmap-tab'));
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        renderRoadmap(tab.dataset.sector);
      });
    });
    renderRoadmap('retail');
  }

  /* ──────────────── STRATEGIC COMMUNICATION MODULES ──────────────── */
  /* Sends the owner's situation to a Cloudflare Worker, which calls the
     Anthropic API server-side (the API key never touches this file) and
     returns a tailored communication script. Replace COMMS_WORKER_URL
     with your deployed Worker's address once it's live. */
  const COMMS_WORKER_URL = 'https://sts-comms-generator.adeleyeoriola.workers.dev';

  const commsForm       = document.getElementById('commsForm');
  const commsSubmit     = document.getElementById('commsSubmit');
  const commsResult     = document.getElementById('commsResult');
  const commsResultBody = document.getElementById('commsResultBody');
  const commsError      = document.getElementById('commsError');
  const commsAgain      = document.getElementById('commsAgain');

  const COMMS_DAILY_LIMIT = 5;
  const COMMS_STORAGE_KEY = 'sts_comms_usage';

  function getCommsUsage() {
    try {
      const raw = localStorage.getItem(COMMS_STORAGE_KEY);
      if (!raw) return { date: '', count: 0 };
      return JSON.parse(raw);
    } catch (e) {
      return { date: '', count: 0 };
    }
  }

  function recordCommsUsage() {
    const today = new Date().toISOString().slice(0, 10);
    const usage = getCommsUsage();
    const next = usage.date === today
      ? { date: today, count: usage.count + 1 }
      : { date: today, count: 1 };
    try { localStorage.setItem(COMMS_STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
    return next;
  }

  function commsLimitReached() {
    const today = new Date().toISOString().slice(0, 10);
    const usage = getCommsUsage();
    return usage.date === today && usage.count >= COMMS_DAILY_LIMIT;
  }

  if (commsForm) {
    commsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      commsError.hidden = true;
      commsResult.hidden = true;

      if (commsLimitReached()) {
        commsError.textContent = `You've reached today's limit of ${COMMS_DAILY_LIMIT} free scripts on this browser. Please try again tomorrow.`;
        commsError.hidden = false;
        return;
      }

      const whatIntroducing = document.getElementById('commsWhat').value.trim();
      const teamConcerns    = document.getElementById('commsConcern').value.trim();
      const audience        = document.getElementById('commsAudience').value;
      const tone            = document.getElementById('commsTone').value;

      if (!whatIntroducing || !teamConcerns) {
        commsError.textContent = 'Please fill in both what you\'re introducing and the main concern.';
        commsError.hidden = false;
        return;
      }

      const originalLabel = commsSubmit.textContent;
      commsSubmit.disabled = true;
      commsSubmit.textContent = 'Generating…';

      try {
        const res = await fetch(COMMS_WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'comms', whatIntroducing, teamConcerns, audience, tone }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.result) {
          throw new Error(data.error || 'Something went wrong generating your script.');
        }

        commsResultBody.textContent = data.result;
        commsResult.hidden = false;
        recordCommsUsage();
        commsResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (err) {
        commsError.textContent = "We couldn't generate a script right now. Please try again in a moment.";
        commsError.hidden = false;
      } finally {
        commsSubmit.disabled = false;
        commsSubmit.textContent = originalLabel;
      }
    });
  }

  if (commsAgain) {
    commsAgain.addEventListener('click', () => {
      commsResult.hidden = true;
      commsForm.reset();
      const firstField = commsForm.querySelector('input');
      if (firstField) firstField.focus();
    });
  }

  /* ──────────────── FULL AI ACTION PLAN REPORT ──────────────── */
  /* Uses the same Worker as the Communication Modules generator, with
     type: 'report' in the request telling it which prompt/model to use.
     Reuses the diagnostic's own questions array to turn stored answer
     codes back into plain-English labels, the 11 questions themselves
     are never touched by any of this. */
  const REPORT_WORKER_URL = COMMS_WORKER_URL;

  const diagPageSummary = document.getElementById('diagPageSummary');
  const diagPageReport  = document.getElementById('diagPageReport');
  const reportCtaBtn    = document.getElementById('reportCtaBtn');
  const reportBack      = document.getElementById('reportBack');
  const reportForm      = document.getElementById('reportForm');
  const reportSubmit    = document.getElementById('reportSubmit');
  const reportLoading   = document.getElementById('reportLoading');
  const reportLoadingMsg = document.getElementById('reportLoadingMsg');
  const reportError     = document.getElementById('reportError');
  const reportFull      = document.getElementById('reportFull');
  const reportPrintable = document.getElementById('reportPrintable');
  const reportBizName   = document.getElementById('reportBizName');
  const reportLocationInput = document.getElementById('reportLocation');

  // The submit button stays disabled until both business name and
  // location have real (non-whitespace) values, the report prompt
  // depends on both, so we never want a submission missing either.
  function updateReportSubmitState() {
    if (!reportSubmit || !reportBizName || !reportLocationInput) return;
    const ready = reportBizName.value.trim() !== '' && reportLocationInput.value.trim() !== '';
    reportSubmit.disabled = !ready;
  }
  if (reportSubmit) reportSubmit.disabled = true;
  if (reportBizName) reportBizName.addEventListener('input', updateReportSubmitState);
  if (reportLocationInput) reportLocationInput.addEventListener('input', updateReportSubmitState);

  const REPORT_LOADING_MESSAGES = [
    'Reading your answers…',
    'Matching resources to your sector…',
    'Cross-checking what fits your location…',
    'Weighing time, revenue, and cost opportunities…',
    'Finalizing your plan…',
  ];

  function readableAnswers() {
    const out = {};
    questions.forEach(q => {
      const val = answers[q.id];
      if (val === undefined) return;
      const opt = q.options.find(o => String(o.value) === String(val));
      out[q.id] = opt ? opt.label : val;
    });
    return out;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  let reportMsgTimer = null;
  function startReportLoadingMessages() {
    let i = 0;
    reportLoadingMsg.textContent = REPORT_LOADING_MESSAGES[0];
    reportMsgTimer = setInterval(() => {
      i = (i + 1) % REPORT_LOADING_MESSAGES.length;
      reportLoadingMsg.textContent = REPORT_LOADING_MESSAGES[i];
    }, 2200);
  }
  function stopReportLoadingMessages() {
    if (reportMsgTimer) clearInterval(reportMsgTimer);
    reportMsgTimer = null;
  }

  // Guards against the AI's response coming back slightly differently
  // shaped than expected (e.g. one object instead of a list of them), // the Worker normalizes this too, but the page shouldn't crash even
  // if it somehow receives something unexpected.
  function asArray(val) {
    if (Array.isArray(val)) return val;
    if (val === null || val === undefined || val === '') return [];
    return [val];
  }

  // Fixed titles for the 8 content sections (the report always has this
  // same structure, only the content inside each section is generated).
  // Used both as page headers in the printable report and as the
  // checklist shown on the on-screen ready card.
  const REPORT_SECTION_TITLES = [
    'AI Readiness Snapshot',
    'Where You Can Save Time',
    'Where You Can Grow Revenue',
    'Where You Can Cut Costs Without Cutting People',
    'Tools to Explore & Getting Help',
    'Your 90-Day Roadmap',
    'Risks & Realistic Expectations',
    'Next Steps',
  ];

  function renderOpportunityCards(items) {
    return asArray(items).map(it => `
      <li class="report-opp">
        <p class="report-opp__title">${escapeHtml(it && it.opportunity)}</p>
        <p class="report-opp__desc">${escapeHtml(it && it.description)}</p>
        ${(it && it.tool_type) ? `<p class="report-opp__tools"><strong>${escapeHtml(it.tool_type)}:</strong> ${escapeHtml(asArray(it.example_tools).join(', '))}</p>` : ''}
      </li>
    `).join('');
  }

  function renderReport(data, businessName, location) {
    const snapshot = data.readiness_snapshot || {};
    const toolsHiring = data.tools_and_hiring || {};
    const risks = data.risks_and_expectations || {};
    const next = data.next_steps || {};
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const toolCards = asArray(toolsHiring.recommended_tools).map(t => `
      <div class="report-tool-card">
        <p class="report-tool-card__name">${escapeHtml(t && t.name)}</p>
        <p class="report-tool-card__cat">${escapeHtml(t && t.category)}</p>
        <p class="report-tool-card__why">${escapeHtml(t && t.why)}</p>
      </div>
    `).join('');

    const phases = asArray(data.roadmap_90_day).map(p => `
      <div class="report-phase">
        <p class="report-phase__label">${escapeHtml(p && p.phase)}</p>
        ${(p && p.goal) ? `<p class="report-phase__goal">${escapeHtml(p.goal)}</p>` : ''}
        <ul>${asArray(p && p.actions).map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
      </div>
    `).join('');

    // The full 9-page report, never shown on screen. It only becomes
    // visible when the page is printed or downloaded as a PDF (see the
    // print rules in styles.css). Each .report-print-page is forced onto
    // its own printed page, so the page count is guaranteed by this
    // fixed structure, not by how much text was generated.
    reportPrintable.innerHTML = `
      <div class="report-print-page report-print-page--title">
        <p class="report-title__kicker">AI Adoption Action Plan</p>
        <h1 class="report-title__headline">${escapeHtml(data.headline)}</h1>
        <p class="report-title__biz">${escapeHtml(businessName)}</p>
        <p class="report-title__meta">${escapeHtml(location)} &middot; ${escapeHtml(today)}</p>
      </div>

      <div class="report-print-page">
        <header class="report-page-head">
          <p class="report-page-head__eyebrow">Section 1 of 8 &middot; ${escapeHtml(REPORT_SECTION_TITLES[0])}</p>
          <h2 class="report-page-head__title">${escapeHtml(REPORT_SECTION_TITLES[0])}</h2>
        </header>
        <p class="report-snapshot__level">${escapeHtml(snapshot.level)}</p>
        <p class="report-snapshot__summary">${escapeHtml(snapshot.summary)}</p>
        <div class="report-snapshot__cols">
          <div>
            <h4>Working In Your Favor</h4>
            <ul>${asArray(snapshot.key_strengths).map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
          </div>
          <div>
            <h4>Where To Focus First</h4>
            <ul>${asArray(snapshot.growth_areas).map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
          </div>
        </div>
      </div>

      <div class="report-print-page">
        <header class="report-page-head">
          <p class="report-page-head__eyebrow">Section 2 of 8 &middot; ${escapeHtml(REPORT_SECTION_TITLES[1])}</p>
          <h2 class="report-page-head__title">${escapeHtml(REPORT_SECTION_TITLES[1])}</h2>
        </header>
        <ul class="report-opp-list">${renderOpportunityCards(data.time_savings)}</ul>
      </div>

      <div class="report-print-page">
        <header class="report-page-head">
          <p class="report-page-head__eyebrow">Section 3 of 8 &middot; ${escapeHtml(REPORT_SECTION_TITLES[2])}</p>
          <h2 class="report-page-head__title">${escapeHtml(REPORT_SECTION_TITLES[2])}</h2>
        </header>
        <ul class="report-opp-list">${renderOpportunityCards(data.revenue_growth)}</ul>
      </div>

      <div class="report-print-page">
        <header class="report-page-head">
          <p class="report-page-head__eyebrow">Section 4 of 8 &middot; ${escapeHtml(REPORT_SECTION_TITLES[3])}</p>
          <h2 class="report-page-head__title">${escapeHtml(REPORT_SECTION_TITLES[3])}</h2>
        </header>
        <ul class="report-opp-list">${renderOpportunityCards(data.cost_reduction)}</ul>
      </div>

      <div class="report-print-page">
        <header class="report-page-head">
          <p class="report-page-head__eyebrow">Section 5 of 8 &middot; ${escapeHtml(REPORT_SECTION_TITLES[4])}</p>
          <h2 class="report-page-head__title">${escapeHtml(REPORT_SECTION_TITLES[4])}</h2>
        </header>
        <div class="report-tools-grid">${toolCards}</div>
        <div class="report-hiring-note">
          <h4>Getting Extra Help</h4>
          <p>${escapeHtml(toolsHiring.hiring_guidance)}</p>
        </div>
      </div>

      <div class="report-print-page">
        <header class="report-page-head">
          <p class="report-page-head__eyebrow">Section 6 of 8 &middot; ${escapeHtml(REPORT_SECTION_TITLES[5])}</p>
          <h2 class="report-page-head__title">${escapeHtml(REPORT_SECTION_TITLES[5])}</h2>
        </header>
        ${phases}
      </div>

      <div class="report-print-page">
        <header class="report-page-head">
          <p class="report-page-head__eyebrow">Section 7 of 8 &middot; ${escapeHtml(REPORT_SECTION_TITLES[6])}</p>
          <h2 class="report-page-head__title">${escapeHtml(REPORT_SECTION_TITLES[6])}</h2>
        </header>
        <ul class="report-risks">${asArray(risks.risks).map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
        <p class="report-expectations">${escapeHtml(risks.realistic_expectations)}</p>
      </div>

      <div class="report-print-page">
        <header class="report-page-head">
          <p class="report-page-head__eyebrow">Section 8 of 8 &middot; ${escapeHtml(REPORT_SECTION_TITLES[7])}</p>
          <h2 class="report-page-head__title">${escapeHtml(REPORT_SECTION_TITLES[7])}</h2>
        </header>
        <ol class="report-next-list">${asArray(next.steps).map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
        <p class="report-closing">${escapeHtml(next.closing_message)}</p>
      </div>
    `;

    // What actually shows on screen: a confirmation, a one-line summary,
    // a checklist of what's in the download, and a single download
    // button, the button triggers the same print/save-as-PDF flow,
    // which picks up the full hidden content above.
    reportFull.innerHTML = `
      <p class="report-ready__kicker">Your Full AI Action Plan Is Ready</p>
      <h3 class="report-ready__headline">${escapeHtml(data.headline)}</h3>
      <p class="report-ready__meta">${escapeHtml(businessName)} &middot; ${escapeHtml(location)}</p>
      <p class="report-ready__summary">${escapeHtml(data.one_line_summary)}</p>
      <p class="report-ready__pagecount">9 pages, ready to download</p>
      <ul class="report-ready__checklist">
        ${REPORT_SECTION_TITLES.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
      </ul>
      <button type="button" class="btn-primary" id="reportDownloadBtn">Download as PDF &darr;</button>
    `;
    reportFull.hidden = false;

    const downloadBtn = document.getElementById('reportDownloadBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', () => window.print());
  }

  if (reportCtaBtn) {
    reportCtaBtn.addEventListener('click', () => {
      diagPageSummary.hidden = true;
      diagPageReport.hidden = false;
      const first = reportForm.querySelector('input');
      if (first) first.focus();
    });
  }

  if (reportBack) {
    reportBack.addEventListener('click', () => {
      diagPageReport.hidden = true;
      diagPageSummary.hidden = false;
    });
  }

  if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      reportError.hidden = true;

      const businessName = document.getElementById('reportBizName').value.trim();
      const location      = document.getElementById('reportLocation').value.trim();
      if (!businessName || !location) return;

      reportForm.hidden = true;
      reportLoading.hidden = false;
      startReportLoadingMessages();
      reportSubmit.disabled = true;

      try {
        const res = await fetch(REPORT_WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'report',
            businessName,
            location,
            answers: readableAnswers(),
          }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.report) {
          throw new Error(data.error || 'Something went wrong building your plan.');
        }

        renderReport(data.report, businessName, location);
      } catch (err) {
        reportError.textContent = (err && err.message)
          ? err.message
          : "We couldn't build your full plan right now. Please try again in a moment.";
        reportError.hidden = false;
        reportForm.hidden = false;
      } finally {
        stopReportLoadingMessages();
        reportLoading.hidden = true;
        reportSubmit.disabled = false;
      }
    });
  }

})();
