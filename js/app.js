'use strict';

document.addEventListener('DOMContentLoaded', function () {
    initAdminCheckbox();
    initProfileDropdown();
    initSidebarToggle();
    initRutinaTracking();
});

// ── Checkbox admin (index.html) ─────────────────────────────
function initAdminCheckbox() {
    const checkbox = document.getElementById('admin');
    const loginLink = document.querySelector('.login-link');
    if (!checkbox || !loginLink) return;

    const ALUMNO_URL = 'paginas/inicio.html';
    const ADMIN_URL  = 'paginas/profesor.html';

    checkbox.addEventListener('change', function () {
        loginLink.href = this.checked ? ADMIN_URL : ALUMNO_URL;
    });
}

// ── Profile dropdown ────────────────────────────────────────
function initProfileDropdown() {
    const btn      = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function (e) {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            dropdown.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            btn.focus();
        }
    });
}

// ── Sidebar toggle (mobile — profesor.html) ─────────────────
function initSidebarToggle() {
    const toggle  = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!toggle || !sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeSidebar();
    });
}

// ── Tracking de ejercicios (rutina.html) ────────────────────
function initRutinaTracking() {
    const list    = document.getElementById('ej-list');
    const counter = document.getElementById('completados-cnt');
    if (!list || !counter) return;

    const finBtn   = document.getElementById('fin-btn');
    const total    = list.querySelectorAll('.ej-item').length;
    const completed = new Set();

    list.addEventListener('click', function (e) {
        const checkBtn = e.target.closest('.check-btn');
        if (!checkBtn) return;

        const item = checkBtn.closest('.ej-item');
        const num  = item.querySelector('.ej-num');
        const idx  = item.dataset.idx;
        const done = completed.has(idx);

        if (done) {
            completed.delete(idx);
        } else {
            completed.add(idx);
        }

        item.classList.toggle('completado', !done);
        checkBtn.classList.toggle('done', !done);
        checkBtn.setAttribute('aria-label', done ? 'Marcar completado' : 'Desmarcar');
        if (num) num.classList.toggle('done', !done);

        counter.textContent = completed.size;

        if (finBtn) finBtn.classList.toggle('all-done', completed.size === total);
    });
}
