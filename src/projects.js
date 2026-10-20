// Screenshot walkthrough data. All images were captured from the running apps
// using synthetic sample data (no real personal information).
export const PROJECTS = {
  sd: {
    ar: 1800 / 1250,
    url: 'sewadaar-directory.app / demo',
    steps: [
      { img: 'sd-02-dashboard', t: 'Command dashboard', d: 'Live counts of devotional‑service duties and volunteers, plus the day’s upcoming duties at a glance.' },
      { img: 'sd-03-sewa-list', t: 'Duties with coordinators & volunteers', d: 'Every duty with its time window. Select one to see coordinators and volunteers with their individual time slots.' },
      { img: 'sd-04-sewa-schedule', t: 'Schedule (roster) view', d: 'A colour‑coded daily timeline across morning, afternoon, evening and night — spot gaps and overlaps instantly.' },
      { img: 'sd-08-sewadaar-list', t: 'Volunteer directory', d: 'Searchable cards with photos and assignment counts, plus a rich profile panel with assigned duties and status.' },
      { img: 'sd-10-sewadaar-detail-docs', t: 'Profile, documents & remarks', d: 'Address, guardian details, skills and education, uploaded documents with view / download, and admin remarks.' },
      { img: 'sd-12-sewadaar-filter', t: 'Filters that scale', d: 'Filter 880+ records by ID, name, phone, skills and status — executed server‑side with pagination.' },
      { img: 'sd-13-sewadaar-form', t: 'Guided volunteer onboarding', d: 'Photo capture and a structured form feeding the approval workflow (pending → documents verified → active).' },
      { img: 'sd-07-sewa-add-form', t: 'Create a duty', d: 'Category, sub‑category, location, hours and skills — assignments are validated against the duty’s hours.' },
    ],
    phones: [
      { img: 'sd-m1-dashboard', t: 'Dashboard' },
      { img: 'sd-m2-sewa-list', t: 'Duties' },
      { img: 'sd-m3-sewa-detail', t: 'Duty detail' },
      { img: 'sd-m4-sewadaar-list', t: 'Volunteers' },
      { img: 'sd-m5-sewadaar-detail', t: 'Profile' },
    ],
  },
  ex: {
    ar: 1800 / 1125,
    url: 'ashram-expenses.app / demo',
    steps: [
      { img: 'ex-signin', t: 'Secure sign‑in', d: 'Session‑cookie authentication with role‑based landing pages for volunteers, admins and super admins.' },
      { img: 'ex-sv-saints', t: 'Saint profiles', d: 'Onboard saints with contact details, join date and supporting documents; see each saint’s request history.' },
      { img: 'ex-sv-categories', t: 'Category taxonomy', d: 'Maintain categories and sub‑categories (with optional “attachment required” rules) used across every case.' },
      { img: 'ex-sv-case', t: 'Itemised expense cases', d: 'Raise a case for a saint with multiple line items — category, vendor, urgency, amount and bills.' },
      { img: 'ex-ad-queue', t: 'Admin case queue', d: 'Open cases can be claimed; assigned ones show status, saint and total. Processed cases remain visible read‑only.' },
      { img: 'ex-ad-review', t: 'Line‑by‑line review', d: 'Approve, partially approve or reject every item with its own amount, plus internal notes and shared comments.' },
      { img: 'ex-sa-all-cases', t: 'Super‑admin overview', d: 'All cases across the workflow with “action required” filters and quick access to review & disburse.' },
      { img: 'ex-sa-review', t: 'Approve & record disbursement', d: 'Final approval with payment amount, mode (cash / bank / UPI) and reference — fully or in instalments.' },
      { img: 'ex-sa-automated', t: 'Recurring (automated) cases', d: 'Monthly templates that a timezone‑correct scheduler turns into real cases — pause, edit or expire any time.' },
      { img: 'ex-sa-reports', t: 'Reports & analytics', d: 'Totals for requested, approved and disbursed amounts with a monthly expenditure trend.' },
      { img: 'ex-sa-reports-2', t: 'Category‑wise spend', d: 'Doughnut and ranked charts show where the fund goes, by category and by saint.' },
      { img: 'ex-sa-report-payments', t: 'Aggregated payments', d: 'Every disbursement in a date range with mode, reference and totals — ready for reconciliation.' },
      { img: 'ex-sa-report-volume', t: 'Saint volume ranking', d: 'Requested vs approved vs paid per saint for any period.' },
      { img: 'ex-sa-users', t: 'User management', d: 'Create, edit, deactivate and restore users across the Volunteer, Admin and Super Admin roles.' },
      { img: 'ex-sv-notifications', t: 'Notifications', d: 'Approval and payment events surface in‑app, with unread badges in the navigation.' },
    ],
    phones: [
      { img: 'ex-m-sv-cases', t: 'Volunteer · cases' },
      { img: 'ex-m-ad-queue', t: 'Admin · queue' },
      { img: 'ex-m-sa-review', t: 'Super admin · review' },
    ],
  },
};

export function renderProjects() {
  document.querySelectorAll('[data-stepper]').forEach((host) => {
    const p = PROJECTS[host.dataset.stepper];
    host.style.setProperty('--n', p.steps.length);
    host.style.setProperty('--ar', p.ar);
    const caps = p.steps.map((s, i) => `<button class="cap${i === 0 ? ' active' : ''}" data-i="${i}" type="button"><b><i>${String(i + 1).padStart(2, '0')}</i>${s.t}</b><span>${s.d}</span></button>`).join('');
    const imgs = p.steps.map((s, i) => `<img class="shot${i === 0 ? ' on' : ''}" src="./img/${s.img}.webp" alt="${s.t}" data-cap="${s.t} — ${s.d.replace(/"/g, '&quot;')}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" />`).join('');
    const list = p.steps.map((s) => `<figure><div class="device"><div class="device-bar"><i></i><i></i><i></i><span>${p.url}</span></div><div class="device-screen" style="--ar:${p.ar}"><img class="shot on" src="./img/${s.img}.webp" alt="${s.t}" data-cap="${s.t} — ${s.d.replace(/"/g, '&quot;')}" loading="lazy" decoding="async" style="position:static;opacity:1;transform:none;height:auto" /></div></div><figcaption><b>${s.t}</b><span>${s.d}</span></figcaption></figure>`).join('');
    host.innerHTML = `
      <div class="stepper-sticky">
        <div class="stepper-captions">${caps}</div>
        <div class="stepper-stage"><div class="device"><div class="device-bar"><i></i><i></i><i></i><span>${p.url}</span></div><div class="device-screen">${imgs}</div></div></div>
      </div>
      <div class="step-list">${list}</div>`;
  });
  document.querySelectorAll('[data-phones]').forEach((host) => {
    const p = PROJECTS[host.dataset.phones];
    host.innerHTML = p.phones.map((s) => `<figure class="phone tilt" style="margin-bottom:2.4rem"><img class="shot" src="./img/${s.img}.webp" alt="${s.t} (mobile)" data-cap="${s.t} (mobile)" width="780" height="1688" loading="lazy" decoding="async" /><figcaption>${s.t}</figcaption></figure>`).join('');
  });
}
