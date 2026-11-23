/* ==========================================================================
   GreenGuard AgroTech — Interactive Checklist, Track Switcher & Audit Inquiry
   ========================================================================== */

(function () {
  const WHATSAPP_NUMBER = '923001492715';
  const CONTACT_EMAIL = 'greenguardagrotech@gmail.com';
  const STORAGE_KEY = 'gg_launch_checklist_v1';

  let currentTrack = 'grower';
  let statusTimer = null;

  function setFooterYear() {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function showStatus(message) {
    const banner = document.getElementById('status-banner');
    if (!banner) return;
    banner.textContent = message;
    banner.classList.remove('hidden');
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => {
      banner.classList.add('hidden');
    }, 3600);
  }

  function loadChecklistState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      document.querySelectorAll('.launch-checkbox').forEach((cb, index) => {
        const key = cb.id || `step_${index}`;
        if (typeof saved[key] === 'boolean') {
          cb.checked = saved[key];
        }
      });
    } catch (e) {
      // Ignore storage restrictions
    }
  }

  function saveChecklistState() {
    try {
      const state = {};
      document.querySelectorAll('.launch-checkbox').forEach((cb, index) => {
        const key = cb.id || `step_${index}`;
        state[key] = cb.checked;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Ignore storage restrictions
    }
  }

  function updateLaunchChecklist() {
    const checkboxes = Array.from(document.querySelectorAll('.launch-checkbox'));
    const total = checkboxes.length || 1;
    const completed = checkboxes.filter((cb) => cb.checked).length;
    const percent = Math.round((completed / total) * 100);

    const textEl = document.getElementById('launch-progress-text');
    const barEl = document.getElementById('launch-progress-bar');
    const noteEl = document.getElementById('launch-progress-note');

    if (textEl) textEl.textContent = `${percent}% (${completed}/${total})`;
    if (barEl) barEl.style.width = `${percent}%`;

    if (noteEl) {
      if (completed === 0) {
        noteEl.textContent = 'Check each task as you complete it (saved automatically in your browser).';
      } else if (completed < total) {
        noteEl.textContent = 'Good progress—keep going to connect greenguardagrotech.com.';
      } else {
        noteEl.textContent = 'All 6 launch steps checked. Your domain, hosting, and forwarding are set!';
      }
    }

    saveChecklistState();
  }

  function setActiveTrack(track) {
    currentTrack = track === 'importer' ? 'importer' : 'grower';

    const growerTab = document.getElementById('tab-grower');
    const importerTab = document.getElementById('tab-importer');
    const growerFields = document.getElementById('grower-form-fields');
    const importerFields = document.getElementById('importer-form-fields');

    if (currentTrack === 'grower') {
      growerTab?.classList.add('active');
      importerTab?.classList.remove('active');
      growerFields?.classList.remove('hidden');
      importerFields?.classList.add('hidden');
    } else {
      importerTab?.classList.add('active');
      growerTab?.classList.remove('active');
      importerFields?.classList.remove('hidden');
      growerFields?.classList.add('hidden');
    }

    syncDirectShareLinks();
  }

  function buildAuditSummary() {
    const name = (document.getElementById('inq-name')?.value || '').trim() || 'Not provided';
    const contact = (document.getElementById('inq-contact')?.value || '').trim() || 'Not provided';
    const notes = (document.getElementById('inq-notes')?.value || '').trim() || 'None specified';

    if (currentTrack === 'grower') {
      const tehsil = (document.getElementById('inq-tehsil')?.value || '').trim() || 'Rahim Yar Khan / South Punjab';
      const crops = (document.getElementById('inq-crops')?.value || '').trim() || 'Not specified';
      const option = document.getElementById('inq-grower-option')?.value || 'Free 1-Hour Orchard Pest Audit';

      return [
        'GreenGuard AgroTech — Local Grower Inquiry',
        `Name / Farm: ${name}`,
        `Contact: ${contact}`,
        `Location / Tehsil: ${tehsil}`,
        `Crops & Acreage: ${crops}`,
        `Selected Option: ${option}`,
        `Notes: ${notes}`
      ].join('\n');
    }

    const region = document.getElementById('inq-region')?.value || 'Canada / UK / GCC';
    const volume = (document.getElementById('inq-volume')?.value || '').trim() || 'Not specified';
    const option =
      document.getElementById('inq-importer-option')?.value || 'Pre-Shipment Residue & Phytosanitary Audit ($350/container)';

    return [
      'GreenGuard AgroTech — International Importer Inquiry',
      `Name / Company: ${name}`,
      `Contact: ${contact}`,
      `Target Market: ${region}`,
      `Shipment Volume: ${volume}`,
      `Selected Option: ${option}`,
      `Notes: ${notes}`
    ].join('\n');
  }

  function syncDirectShareLinks() {
    const summary = buildAuditSummary();
    const waLink = document.getElementById('whatsapp-send-link');
    const mailLink = document.getElementById('email-send-link');

    if (waLink) {
      waLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
    }

    if (mailLink) {
      const subject =
        currentTrack === 'grower'
          ? 'GreenGuard AgroTech — Local Orchard Pest Audit Inquiry'
          : 'GreenGuard AgroTech — International Pre-Shipment Audit Inquiry';
      mailLink.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
    }
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const summary = buildAuditSummary();
    const outputBox = document.getElementById('summary-output-box');
    const outputText = document.getElementById('summary-output-text');

    if (outputText) outputText.textContent = summary;
    if (outputBox) outputBox.classList.remove('hidden');

    syncDirectShareLinks();
    showStatus('Summary generated. You can copy it or send directly via WhatsApp or Email.');
  }

  async function copySummaryToClipboard() {
    const outputText = document.getElementById('summary-output-text')?.textContent || '';
    if (!outputText) {
      showStatus('Generate a summary first before copying.');
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(outputText);
        showStatus('Audit inquiry summary copied to clipboard.');
        return;
      }
    } catch (err) {
      // Fallback below
    }

    try {
      const helper = document.createElement('textarea');
      helper.value = outputText;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.left = '-9999px';
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(helper);
      showStatus(copied ? 'Audit inquiry summary copied to clipboard.' : 'Please select and copy the text manually.');
    } catch (err) {
      showStatus('Please select and copy the text manually.');
    }
  }

  function bindEvents() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileBtn && mobileNav) {
      mobileBtn.addEventListener('click', () => {
        const isHidden = mobileNav.classList.toggle('hidden');
        mobileBtn.setAttribute('aria-expanded', String(!isHidden));
      });
      mobileNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileNav.classList.add('hidden');
          mobileBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    document.querySelectorAll('.launch-checkbox').forEach((cb) => {
      cb.addEventListener('change', updateLaunchChecklist);
    });

    document.querySelectorAll('[data-select-track]').forEach((el) => {
      el.addEventListener('click', () => {
        const track = el.getAttribute('data-select-track');
        if (track) {
          setActiveTrack(track);
        }
        const inquirySection = document.getElementById('audit-inquiry');
        if (inquirySection && el.tagName.toLowerCase() !== 'button') {
          inquirySection.scrollIntoView({ behavior: 'smooth' });
        } else if (inquirySection && !el.closest('.track-switcher')) {
          inquirySection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    const form = document.getElementById('audit-inquiry-form');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
      form.addEventListener('input', syncDirectShareLinks);
      form.addEventListener('change', syncDirectShareLinks);
    }

    const copyBtn = document.getElementById('copy-summary-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', copySummaryToClipboard);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setFooterYear();
    loadChecklistState();
    updateLaunchChecklist();
    setActiveTrack('grower');
    bindEvents();
  });
})();
