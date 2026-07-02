/* =====================================================
   Before the day · Systems Thinking
   App: locking, progress, exports
   ===================================================== */

(function () {
  'use strict';

  const SECTION_ORDER = ['frame', 'intro', '1', '2', '3', '4', '5', '6', 'close', 'task'];
  const SECTION_LABELS = {
    frame: 'Frame',
    intro: 'Why',
    '1': 'Levels',
    '2': 'Tension',
    '3': 'Success',
    '4': 'Advocacy',
    '5': 'Model',
    '6': 'Ladder',
    close: 'Six tools',
    task: 'Your task'
  };

  // ========== Theme toggle ==========
  const themeBtn = document.querySelector('[data-theme]');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) document.documentElement.setAttribute('data-theme-dark', '');
  themeBtn?.addEventListener('click', () => {
    if (document.documentElement.hasAttribute('data-theme-dark')) {
      document.documentElement.removeAttribute('data-theme-dark');
    } else {
      document.documentElement.setAttribute('data-theme-dark', '');
    }
  });

  // ========== Lock state (in-memory only — no storage) ==========
  // Sections unlock one at a time when the learner taps Begin or "I'm done".
  const completed = new Set(); // beats the user has marked done

  function getNext(beat) {
    const i = SECTION_ORDER.indexOf(beat);
    return i >= 0 && i < SECTION_ORDER.length - 1 ? SECTION_ORDER[i + 1] : null;
  }
  function getPrev(beat) {
    const i = SECTION_ORDER.indexOf(beat);
    return i > 0 ? SECTION_ORDER[i - 1] : null;
  }
  function isUnlocked(beat) {
    if (beat === 'frame') return true;
    const prev = getPrev(beat);
    return prev !== null && completed.has(prev);
  }

  // ========== Render lock states ==========
  function renderLocks() {
    document.querySelectorAll('.screen[data-beat]').forEach(el => {
      const beat = el.getAttribute('data-beat');
      const unlocked = isUnlocked(beat);
      el.classList.toggle('locked', !unlocked);
    });
    // Menu items
    document.querySelectorAll('.menu__list li[data-jump]').forEach(li => {
      const target = li.getAttribute('data-jump');
      const beat = target === 'b1' ? '1' :
                   target === 'b2' ? '2' :
                   target === 'b3' ? '3' :
                   target === 'b4' ? '4' :
                   target === 'b5' ? '5' :
                   target === 'b6' ? '6' :
                   target;
      const unlocked = isUnlocked(beat);
      li.classList.toggle('is-locked', !unlocked);
      li.classList.toggle('is-done', completed.has(beat));
    });
    // "Done" buttons — mark as done if completed
    document.querySelectorAll('[data-done]').forEach(btn => {
      const beat = btn.getAttribute('data-done');
      btn.classList.toggle('is-done', completed.has(beat));
      btn.disabled = completed.has(beat) && !document.querySelector(`.screen[data-beat="${getNext(beat)}"]`);
    });
  }

  // ========== Progress bar ==========
  const progressFill = document.querySelector('[data-progress]');
  const stepLabel = document.querySelector('[data-step]');
  function updateProgress(activeBeat) {
    const idx = SECTION_ORDER.indexOf(activeBeat);
    const pct = idx >= 0 ? (idx / (SECTION_ORDER.length - 1)) * 100 : 0;
    if (progressFill) progressFill.style.width = pct + '%';
    if (stepLabel) stepLabel.textContent = SECTION_LABELS[activeBeat] || '';
  }

  // ========== Section observer ==========
  const sections = document.querySelectorAll('.screen[data-beat]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const beat = e.target.getAttribute('data-beat');
        updateProgress(beat);
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => io.observe(s));

  // ========== Toast ==========
  const toast = document.querySelector('[data-toast]');
  let toastTimer;
  function showToast(msg, ms = 2400) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-show');
      setTimeout(() => { toast.hidden = true; }, 400);
    }, ms);
  }

  // ========== "I'm done" buttons ==========
  document.querySelectorAll('[data-done]').forEach(btn => {
    btn.addEventListener('click', () => {
      const beat = btn.getAttribute('data-done');
      completed.add(beat);
      btn.classList.add('is-done');
      btn.textContent = "Done — next part unlocked";
      renderLocks();
      // Scroll to next unlocked section
      const next = getNext(beat);
      if (next) {
        const nextEl = document.querySelector(`.screen[data-beat="${next}"]`);
        if (nextEl) {
          setTimeout(() => {
            nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 250);
        }
      }
      showToast('Next part unlocked.');
    });
  });

  // ========== Hash-link jumps ==========
  document.querySelectorAll('[data-jump]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = el.getAttribute('data-jump');
      const beatId = target === 'b1' ? '1' :
                     target === 'b2' ? '2' :
                     target === 'b3' ? '3' :
                     target === 'b4' ? '4' :
                     target === 'b5' ? '5' :
                     target === 'b6' ? '6' :
                     target;
      if (!isUnlocked(beatId)) {
        e.preventDefault();
        showToast('Finish the previous part first.');
        return;
      }
      // Close menu if jumping from there
      closeMenu();
    });
  });

  // ========== Menu ==========
  const menuBtn = document.querySelector('[data-menu]');
  const menuPanel = document.querySelector('[data-menu-panel]');
  const menuClose = document.querySelector('[data-menu-close]');
  function openMenu() { menuPanel?.removeAttribute('hidden'); }
  function closeMenu() { menuPanel?.setAttribute('hidden', ''); }
  menuBtn?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  menuPanel?.addEventListener('click', (e) => { if (e.target === menuPanel) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  document.querySelectorAll('.menu__list li[data-jump]').forEach(li => {
    li.addEventListener('click', () => {
      const target = li.getAttribute('data-jump');
      const beatId = target === 'b1' ? '1' :
                     target === 'b2' ? '2' :
                     target === 'b3' ? '3' :
                     target === 'b4' ? '4' :
                     target === 'b5' ? '5' :
                     target === 'b6' ? '6' :
                     target;
      if (!isUnlocked(beatId)) {
        showToast('Finish the previous part first.');
        return;
      }
      const id = target === 'frame' ? 'frame' :
                 target === 'close' ? 'close' :
                 target === 'task' ? 'task' :
                 target;
      const el = document.getElementById(id);
      if (el) {
        closeMenu();
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      }
    });
  });

  // ========== Render initial state ==========
  renderLocks();
  updateProgress('frame');

  // ========== Form helpers ==========
  function getFormData() {
    return {
      name: (document.getElementById('f_name')?.value || '').trim(),
      story: (document.getElementById('f_story')?.value || '').trim(),
    };
  }
  function hasAny(d) {
    return d.story.length > 0;
  }

  // ========== Poster prompt ==========
  const POSTER_STYLES = {
    modern: {
      title: 'Modern clean',
      description: 'minimal, polished, easy to read, with a clear scene composition and generous white space'
    },
    cartoon: {
      title: 'Friendly cartoon',
      description: 'playful and light-hearted, with simple original characters, rounded shapes, and a warm learning feel'
    },
    anime: {
      title: 'Anime-inspired',
      description: 'expressive, colourful, and energetic, with original characters only and no reference to copyrighted shows or characters'
    },
    storybook: {
      title: 'Storybook sketch',
      description: 'warm, hand-drawn, reflective, with soft illustration details and a personal journal feel'
    },
    pop: {
      title: 'Bold pop',
      description: 'bright, energetic, attention-grabbing, with strong shapes and a poster-like sense of movement'
    }
  };

  const POSTER_PALETTES = {
    'teal-coral': 'teal, coral, warm cream, and charcoal text',
    'sky-lemon': 'sky blue, lemon yellow, white, and dark navy text',
    sunset: 'sunset orange, purple, blush pink, and warm off-white',
    'sage-gold': 'sage green, charcoal, soft gold, and warm cream',
    'mono-red': 'white background, black typography, one precise red accent for the tension point',
  };

  function getPosterChoices() {
    const styleKey = document.querySelector('input[name="poster_style"]:checked')?.value || 'modern';
    const paletteKey = document.getElementById('poster_palette')?.value || 'teal-coral';
    return {
      style: POSTER_STYLES[styleKey] || POSTER_STYLES.modern,
      palette: POSTER_PALETTES[paletteKey] || POSTER_PALETTES['teal-coral'],
      custom: (document.getElementById('poster_custom')?.value || '').trim()
    };
  }

  function buildPosterPrompt(d, service = 'gemini') {
    const choices = getPosterChoices();
    const serviceLead = service === 'chatgpt'
      ? 'Create a polished poster image from the content below.'
      : 'Generate a polished poster image from the content below.';
    const customLine = choices.custom
      ? `\nAdditional look and feel from me: ${choices.custom}\n`
      : '';

    return `${serviceLead}

Format: portrait A4 poster, suitable for an upcoming class pre-work activity.

Main header: "One Moment To Explore"
Title: Create a short, neutral title from the story.
Subtitle: "${d.name || 'My moment'}"

Design direction: ${choices.style.title} — ${choices.style.description}.
Colour direction: ${choices.palette}.${customLine}
Story from my perspective:
${d.story || '(moment not written yet)'}

Poster goal:
Create a learner-facing poster that makes this one moment easy to revisit in class. It should feel curious, human, and slightly playful, not like a complaint, judgement, or performance review.

Visual treatment:
- Show the moment as a scene, metaphor, split-screen, comic panel, or symbolic composition that fits the chosen style.
- Use original characters only. If names, teams, or organisations appear in the story, anonymise them visually.
- Make the tension visible without blaming anyone.
- Leave space for interpretation. Do not diagnose the situation or complete the Ladder of Inference for me.

Include these small caption areas with short, legible text:
1. "What happened"
2. "What I noticed or felt"
3. "What I am still curious about"

Footer line: "A moment to explore, not a case to prove."

Keep all text legible. Do not add extra facts that are not in the story. Avoid clutter, dark backgrounds, and tiny text.`;
  }

  function buildPromptBundle(d) {
    return [
      'Poster prompt for Gemini',
      '========================',
      buildPosterPrompt(d, 'gemini'),
      '',
      'Poster prompt for ChatGPT',
      '=========================',
      buildPosterPrompt(d, 'chatgpt')
    ].join('\n');
  }

  function refreshPosterPrompt(service = 'gemini') {
    const output = document.getElementById('poster_prompt');
    if (!output) return;
    output.value = buildPosterPrompt(getFormData(), service);
  }

  async function copyPosterPrompt(service) {
    const prompt = buildPosterPrompt(getFormData(), service);
    const output = document.getElementById('poster_prompt');
    if (output) output.value = prompt;
    try {
      await navigator.clipboard.writeText(prompt);
      showToast(service === 'chatgpt' ? 'ChatGPT prompt copied.' : 'Gemini prompt copied.');
      return true;
    } catch {
      if (output) {
        output.focus();
        output.select();
      }
      showToast('Prompt ready. Copy it from the box.');
      return false;
    }
  }

  // ========== Export buttons ==========
  document.querySelectorAll('[data-export]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.getAttribute('data-export');
      const d = getFormData();
      if (!hasAny(d)) {
        showToast('Describe your moment first.');
        return;
      }

      if (type === 'docx') {
        try {
          const { Document, Packer, Paragraph, HeadingLevel, TextRun } = window.docx;
          const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          const promptBundle = buildPromptBundle(d);
          const storyParagraphs = (d.story || '(left blank)').split('\n').map(line => new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: line || ' ', size: 24, color: d.story ? '1A1A1C' : 'AAAAAA' })]
          }));
          const promptParagraphs = (prompt) => prompt.split('\n').map(line => new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: line || ' ', size: 18, font: 'Courier New', color: '333333' })]
          }));
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                new Paragraph({ children: [new TextRun({ text: 'BEFORE THE DAY  ·  SYSTEMS THINKING', bold: true, color: '0E5A55', size: 18 })] }),
                new Paragraph({
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 100, after: 100 },
                  children: [new TextRun({ text: 'One real moment for class.', size: 40 })]
                }),
                new Paragraph({ children: [new TextRun({ text: `${d.name || 'My moment'}  ·  ${today}`, color: '7A7268', size: 22 })] }),
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 320, after: 120 },
                  children: [new TextRun({ text: 'My moment, from my perspective', size: 30 })]
                }),
                ...storyParagraphs,
                new Paragraph({
                  spacing: { before: 180, after: 80 },
                  children: [new TextRun({
                    text: 'This does not need to be a perfect analysis. It is a starting point for curiosity in class.',
                    italics: true, size: 22, color: '4A4641'
                  })]
                }),
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 360, after: 120 },
                  children: [new TextRun({ text: 'Poster prompts', size: 30 })]
                }),
                new Paragraph({
                  spacing: { after: 160 },
                  children: [new TextRun({
                    text: 'Use one of the prompts below in Gemini or ChatGPT to generate a poster from your moment. You can edit the prompt before using it.',
                    size: 22, color: '4A4641'
                  })]
                }),
                ...promptParagraphs(promptBundle),
              ]
            }]
          });
          const blob = await Packer.toBlob(doc);
          window.saveAs(blob, `moment-${(d.name || 'my').toLowerCase().replace(/\s+/g,'-')}.docx`);
          showToast('Word file saved.');
        } catch (err) {
          showToast('Word save failed. Try email instead.');
          console.error(err);
        }
      }

      else if (type === 'email') {
        const lines = [
          `My moment for class — ${d.name || 'My moment'}`,
          '',
          'My moment, from my perspective:',
          '',
          d.story || '(left blank)',
          '',
          'This does not need to be a perfect analysis. It is a starting point for curiosity in class.',
          '',
          '',
          buildPromptBundle(d)
        ].join('\n');
        const subject = `My moment for class — ${d.name || 'before the day'}`;
        const href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
        window.location.href = href;
        showToast('Opening your email app…');
      }
    });
  });

  // ========== Poster builder ==========
  const posterBuilder = document.querySelector('[data-poster-builder]');

  posterBuilder?.querySelectorAll('input[name="poster_style"], #poster_palette, #poster_custom').forEach(control => {
    const eventName = control.tagName === 'TEXTAREA' ? 'input' : 'change';
    control.addEventListener(eventName, () => refreshPosterPrompt('gemini'));
  });

  document.querySelector('[data-form]')?.addEventListener('input', (event) => {
    if (!posterBuilder) return;
    if (event.target?.id === 'poster_prompt') return;
    refreshPosterPrompt('gemini');
  });

  document.querySelectorAll('[data-poster-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const d = getFormData();
      if (!hasAny(d)) {
        showToast('Describe your moment first.');
        return;
      }
      await copyPosterPrompt(btn.getAttribute('data-poster-copy'));
    });
  });

  document.querySelectorAll('[data-poster-copy-open]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const d = getFormData();
      if (!hasAny(d)) {
        showToast('Describe your moment first.');
        return;
      }
      const service = btn.getAttribute('data-poster-copy-open');
      await copyPosterPrompt(service);
      window.open(service === 'chatgpt' ? 'https://chatgpt.com/' : 'https://gemini.google.com/app', '_blank', 'noopener');
    });
  });

  refreshPosterPrompt('gemini');

})();
