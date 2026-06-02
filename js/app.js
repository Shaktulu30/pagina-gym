'use strict';

document.addEventListener('DOMContentLoaded', function () {
    initAdminCheckbox();
    initProfileDropdown();
    initSidebarToggle();
    initRutinaTracking();
    initTurnoCards();
});

// ── Checkbox admin (index.html) ─────────────────────────────
function initAdminCheckbox() {
    const checkbox = document.getElementById('admin');
    const loginLink = document.querySelector('.login-link');
    if (!checkbox || !loginLink) return;

    const ALUMNO_URL = 'paginas/inicio.html';
    const ADMIN_URL  = 'paginas/turno.html';

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

// ── Modal de rutina (turno.html) ────────────────────────────
function initTurnoCards() {
    const overlay = document.getElementById('turnoModalOverlay');
    if (!overlay) return;

    const MOBILE_LIMIT = 3;

    const ALUMNOS = {
        ms: { nombre: 'María Sánchez',  iniciales: 'MS', rutina: 'push-pull-met',  restriccion: { tipo: 'restriccion', texto: 'Hombro izq.' } },
        lg: { nombre: 'Lucas García',   iniciales: 'LG', rutina: 'empuje-rodilla', restriccion: { tipo: 'restriccion', texto: 'Rodilla der.' } },
        vr: { nombre: 'Valentina Ríos', iniciales: 'VR', rutina: 'sin-asignar',    restriccion: { tipo: 'rehab',       texto: 'Rehab. lumbar' } },
        af: { nombre: 'Ana Fernández',  iniciales: 'AF', rutina: 'push-pull-met' },
        rm: { nombre: 'Roberto Méndez', iniciales: 'RM', rutina: 'traccion-cadera' },
        cl: { nombre: 'Carla López',    iniciales: 'CL', rutina: 'metabolico' }
    };

    const RUTINAS = {
        'push-pull-met': {
            nombre: 'Push / Pull / Metabólico',
            ejercicios: [
                { nombre: 'Press de banca plano',    musculo: 'Pecho · Tríceps',               series: 4, reps: '6–8' },
                { nombre: 'Press militar con barra', musculo: 'Hombros · Tríceps',              series: 4, reps: '6–8' },
                { nombre: 'Remo con barra',          musculo: 'Espalda · Bíceps',               series: 4, reps: '8–10' },
                { nombre: 'Jalón al pecho',          musculo: 'Dorsal · Bíceps',                series: 3, reps: '10–12' },
                { nombre: 'Burpees',                 musculo: 'Full body',                      series: 3, reps: '12' }
            ]
        },
        'empuje-rodilla': {
            nombre: 'Empuje MS / Dom. Rodilla',
            ejercicios: [
                { nombre: 'Press de banca plano',    musculo: 'Pecho · Tríceps · Hombro ant.',  series: 4, reps: '6–8' },
                { nombre: 'Press inclinado',         musculo: 'Pecho superior',                 series: 3, reps: '10–12' },
                { nombre: 'Press militar con barra', musculo: 'Hombros · Tríceps',              series: 4, reps: '6–8' },
                { nombre: 'Sentadilla con barra',    musculo: 'Cuádriceps · Glúteos · Core',    series: 4, reps: '6–8' },
                { nombre: 'Prensa de piernas',       musculo: 'Cuádriceps · Glúteos',           series: 3, reps: '10–12' },
                { nombre: 'Extensión de cuádriceps', musculo: 'Cuádriceps · Aislamiento',       series: 3, reps: '12–15' }
            ]
        },
        'traccion-cadera': {
            nombre: 'Tracción MS / Dom. Cadera',
            ejercicios: [
                { nombre: 'Remo con barra',          musculo: 'Espalda · Bíceps',               series: 4, reps: '6–8' },
                { nombre: 'Jalón al pecho',          musculo: 'Dorsal ancho · Bíceps',          series: 3, reps: '10–12' },
                { nombre: 'Face pull',               musculo: 'Deltoides post. · Manguito',     series: 3, reps: '15' },
                { nombre: 'Peso muerto rumano',      musculo: 'Isquiotibiales · Glúteos',       series: 4, reps: '6–8' },
                { nombre: 'Hip thrust con barra',    musculo: 'Glúteos · Core',                 series: 4, reps: '8–10' },
                { nombre: 'Curl de bíceps',          musculo: 'Bíceps braquial',                series: 3, reps: '10–12' }
            ]
        },
        'metabolico': {
            nombre: 'Metabólico / Zona Media',
            ejercicios: [
                { nombre: 'Burpees',                 musculo: 'Full body',                      series: 4, reps: '12' },
                { nombre: 'Kettlebell swing',        musculo: 'Glúteos · Core · Espalda',       series: 4, reps: '15' },
                { nombre: 'Plancha',                 musculo: 'Core · Hombros',                 series: 3, reps: '45 s' },
                { nombre: 'Mountain climbers',       musculo: 'Core · Cardio',                  series: 3, reps: '20/lado' },
                { nombre: 'Saltos al cajón',         musculo: 'Piernas · Explosividad',         series: 3, reps: '8' }
            ]
        },
        'sin-asignar': { nombre: 'Sin asignar', ejercicios: [] }
    };

    const closeBtn  = document.getElementById('modalClose');
    const elAvatar  = document.getElementById('modalAvatar');
    const elNombre  = document.getElementById('modalNombre');
    const elRutina  = document.getElementById('modalRutinaNombre');
    const elBadge   = document.getElementById('modalBadge');
    const elBody    = document.getElementById('modalBody');
    let   lastFocused = null;

    function buildLista(ejercicios) {
        if (!ejercicios.length) {
            return '<p class="modal-sin-rutina">No tiene rutina asignada todavía.</p>' +
                   '<a href="rutina.html" class="modal-ver-rutina">Ver rutina completa</a>';
        }

        const hiddenCount = Math.max(0, ejercicios.length - MOBILE_LIMIT);

        const items = ejercicios.map(function (ej, i) {
            const extraClass = i >= MOBILE_LIMIT ? ' modal-ej-item--hidden' : '';
            return '<li class="modal-ej-item' + extraClass + '">' +
                '<span class="modal-ej-num">' + (i + 1) + '</span>' +
                '<div class="modal-ej-info">' +
                    '<p class="modal-ej-nombre">' + ej.nombre + '</p>' +
                    '<p class="modal-ej-musculo">' + ej.musculo + '</p>' +
                '</div>' +
                '<span class="modal-ej-series">' + ej.series + ' × ' + ej.reps + '</span>' +
            '</li>';
        }).join('');

        const showMore = hiddenCount > 0
            ? '<button class="modal-show-more" id="modalShowMore">+ ' + hiddenCount + ' ejercicios más</button>'
            : '';

        return '<ul class="modal-ej-list">' + items + '</ul>' +
               showMore +
               '<a href="rutina.html" class="modal-ver-rutina">Ver rutina completa</a>';
    }

    function openModal(key) {
        const alumno = ALUMNOS[key];
        if (!alumno) return;
        const rutina = RUTINAS[alumno.rutina] || RUTINAS['sin-asignar'];

        elAvatar.textContent = alumno.iniciales;
        elAvatar.className   = 'modal-avatar' + (alumno.restriccion ? ' modal-avatar--' + alumno.restriccion.tipo : '');
        elNombre.textContent = alumno.nombre;
        elRutina.textContent = rutina.nombre;

        if (alumno.restriccion) {
            elBadge.textContent = alumno.restriccion.texto;
            elBadge.className   = 'badge badge-' + alumno.restriccion.tipo + ' modal-badge';
            elBadge.hidden      = false;
        } else {
            elBadge.hidden = true;
        }

        elBody.innerHTML = buildLista(rutina.ejercicios);

        const showMoreBtn = document.getElementById('modalShowMore');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', function () {
                elBody.querySelectorAll('.modal-ej-item--hidden').forEach(function (el) {
                    el.classList.remove('modal-ej-item--hidden');
                });
                showMoreBtn.remove();
            });
        }

        lastFocused = document.activeElement;
        overlay.classList.add('open');
        overlay.removeAttribute('aria-hidden');
        document.body.classList.add('modal-open');
        closeBtn.focus();
    }

    function closeModal() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.alumno-card[data-alumno]').forEach(function (card) {
        card.addEventListener('click', function () { openModal(card.dataset.alumno); });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card.dataset.alumno); }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
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
