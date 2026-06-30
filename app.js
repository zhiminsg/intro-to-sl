/* =====================================================
   Before the day · Systems Thinking
   App: locking, progress, exports
   ===================================================== */

(function () {
  'use strict';

  const SECTION_ORDER = ['frame', '1', '2', '3', '4', '5', '6', 'close', 'task'];
  const SECTION_LABELS = {
    frame: 'Frame',
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
      r7: (document.getElementById('f_r7')?.value || '').trim(),
      r6: (document.getElementById('f_r6')?.value || '').trim(),
      r5: (document.getElementById('f_r5')?.value || '').trim(),
      r4: (document.getElementById('f_r4')?.value || '').trim(),
      r3: (document.getElementById('f_r3')?.value || '').trim(),
      r2: (document.getElementById('f_r2')?.value || '').trim(),
      r1: (document.getElementById('f_r1')?.value || '').trim(),
    };
  }
  function hasAny(d) { return [d.r7, d.r6, d.r5, d.r4, d.r3, d.r2, d.r1].some(v => v.length > 0); }

  // ========== Export: PDF ==========
  function buildPrintableHTML(d) {
    const name = d.name || 'My ladder';
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const row = (n, h, v) => `
      <tr>
        <td style="vertical-align:top;padding:14px 10px 14px 0;width:36px;font-weight:700;color:#0e5a55;font-size:16px;">${n}</td>
        <td style="vertical-align:top;padding:14px 0;border-bottom:1px solid #e2dccf;">
          <div style="font-family:Georgia,serif;font-size:17px;color:#1a1a1c;margin-bottom:6px;">${h}</div>
          <div style="white-space:pre-wrap;font-size:14.5px;color:#1a1a1c;line-height:1.5;min-height:1.5em;">${v ? escapeHtml(v) : '<span style="color:#aaa;">(left blank)</span>'}</div>
        </td>
      </tr>`;
    return `
<div style="font-family:'Helvetica Neue',Arial,sans-serif;padding:36px;max-width:680px;color:#1a1a1c;background:#fbf7ef;">
  <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#0e5a55;font-weight:700;">Before the day · Systems thinking</div>
  <h1 style="font-family:Georgia,serif;font-size:28px;margin:6px 0 4px;letter-spacing:-0.01em;">Walking one real work moment down the ladder.</h1>
  <div style="font-size:13px;color:#7a7268;margin-bottom:20px;">${escapeHtml(name)} · ${today}</div>
  <table style="width:100%;border-collapse:collapse;">
    ${row(7, 'Actions.', d.r7)}
    ${row(6, 'Beliefs.', d.r6)}
    ${row(5, 'Conclusions.', d.r5)}
    ${row(4, 'Assumptions.', d.r4)}
    ${row(3, 'Assigned meaning.', d.r3)}
    ${row(2, 'Filtered information.', d.r2)}
    ${row(1, 'Raw data and observations.', d.r1)}
  </table>
  <p style="margin-top:24px;padding:14px 16px;background:rgba(14,90,85,0.10);border-left:3px solid #0e5a55;border-radius:6px;font-size:13.5px;line-height:1.55;">At rung 1, there is only <em>raw data and observations</em>. The other rungs are the thinking to test before acting.</p>
</div>`;
  }
  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ========== Export buttons ==========
  document.querySelectorAll('[data-export]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.getAttribute('data-export');
      const d = getFormData();
      if (!hasAny(d)) {
        showToast('Fill in at least one rung first.');
        return;
      }

      if (type === 'pdf') {
        const el = document.createElement('div');
        el.innerHTML = buildPrintableHTML(d);
        document.body.appendChild(el);
        try {
          await window.html2pdf().set({
            margin: 0,
            filename: `ladder-${(d.name || 'my').toLowerCase().replace(/\s+/g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fbf7ef' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          }).from(el).save();
          showToast('PDF saved.');
        } catch (err) {
          showToast('PDF save failed. Try email instead.');
          console.error(err);
        } finally {
          el.remove();
        }
      }

      else if (type === 'docx') {
        try {
          const { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } = window.docx;
          const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          const rung = (n, h, v) => [
            new Paragraph({
              spacing: { before: 200, after: 80 },
              children: [
                new TextRun({ text: `${n}  `, bold: true, color: '0E5A55', size: 28 }),
                new TextRun({ text: h, italics: true, size: 26 }),
              ]
            }),
            new Paragraph({
              spacing: { after: 160 },
              children: [new TextRun({ text: v || '(left blank)', size: 24, color: v ? '1A1A1C' : 'AAAAAA' })],
            }),
          ];
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                new Paragraph({ children: [new TextRun({ text: 'BEFORE THE DAY  ·  SYSTEMS THINKING', bold: true, color: '0E5A55', size: 18 })] }),
                new Paragraph({
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 100, after: 100 },
                  children: [new TextRun({ text: 'Walking one real work moment down the ladder.', size: 40 })]
                }),
                new Paragraph({ children: [new TextRun({ text: `${d.name || 'My ladder'}  ·  ${today}`, color: '7A7268', size: 22 })] }),
                ...rung(7, 'Actions.', d.r7),
                ...rung(6, 'Beliefs.', d.r6),
                ...rung(5, 'Conclusions.', d.r5),
                ...rung(4, 'Assumptions.', d.r4),
                ...rung(3, 'Assigned meaning.', d.r3),
                ...rung(2, 'Filtered information.', d.r2),
                ...rung(1, 'Raw data and observations.', d.r1),
                new Paragraph({
                  spacing: { before: 240 },
                  children: [new TextRun({
                    text: 'At rung 1, there is only raw data and observations. The other rungs are the thinking to test before acting.',
                    italics: true, size: 22, color: '4A4641'
                  })]
                }),
              ]
            }]
          });
          const blob = await Packer.toBlob(doc);
          window.saveAs(blob, `ladder-${(d.name || 'my').toLowerCase().replace(/\s+/g,'-')}.docx`);
          showToast('Word file saved.');
        } catch (err) {
          showToast('Word save failed. Try PDF instead.');
          console.error(err);
        }
      }

      else if (type === 'email') {
        const lines = [
          `My ladder — ${d.name || 'My ladder'}`,
          '',
          `7 · Actions:`,
          `   ${d.r7 || '(left blank)'}`,
          '',
          `6 · Beliefs:`,
          `   ${d.r6 || '(left blank)'}`,
          '',
          `5 · Conclusions:`,
          `   ${d.r5 || '(left blank)'}`,
          '',
          `4 · Assumptions:`,
          `   ${d.r4 || '(left blank)'}`,
          '',
          `3 · Assigned meaning:`,
          `   ${d.r3 || '(left blank)'}`,
          '',
          `2 · Filtered information:`,
          `   ${d.r2 || '(left blank)'}`,
          '',
          `1 · Raw data and observations:`,
          `   ${d.r1 || '(left blank)'}`,
          '',
          '— At rung 1, there is only raw data and observations. The other rungs are the thinking to test before acting.'
        ].join('\n');
        const subject = `My ladder — ${d.name || 'before the day'}`;
        const href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
        window.location.href = href;
        showToast('Opening your email app…');
      }

      else if (type === 'poster') {
        const prompt = `Make a clean, classy poster (portrait, A4) showing my ladder walk.

Title at the top: "Walking one real work moment down the ladder."
Subtitle: "${d.name || 'My ladder'}".

Then seven rungs, top to bottom (read from the bottom up):

7 · Actions: ${d.r7 || '(left blank)'}
6 · Beliefs: ${d.r6 || '(left blank)'}
5 · Conclusions: ${d.r5 || '(left blank)'}
4 · Assumptions: ${d.r4 || '(left blank)'}
3 · Assigned meaning: ${d.r3 || '(left blank)'}
2 · Filtered information: ${d.r2 || '(left blank)'}
1 · Raw data and observations: ${d.r1 || '(left blank)'}

Highlight rung 1 in a deep teal colour (#0E5A55) — that is the only thing that actually happened.

At the bottom, add this caption: "At rung 1, there is only raw data and observations. The other rungs are the thinking to test before acting."

Use a calm warm cream background (#FBF7EF), a serif headline font, and a clean modern sans-serif body. Premium magazine aesthetic.`;
        try {
          await navigator.clipboard.writeText(prompt);
          showToast('Prompt copied. Pick Gemini or ChatGPT…', 2200);
        } catch {
          showToast('Could not copy. Pick a service to open.');
        }
        setTimeout(() => {
          if (confirm('Open Gemini (OK) or ChatGPT (Cancel)?\n\nPaste the prompt I just copied to your clipboard.')) {
            window.open('https://gemini.google.com/app', '_blank', 'noopener');
          } else {
            window.open('https://chat.openai.com/', '_blank', 'noopener');
          }
        }, 600);
      }
    });
  });

})();
