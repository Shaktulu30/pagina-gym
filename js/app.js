'use strict';

// ── Utilidades globales ─────────────────────────────────────

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function _toast(elId, baseClass, msg, tipo, duration) {
    var t = document.getElementById(elId);
    if (!t) return;
    t.textContent = msg;
    t.className = baseClass + ' toast-' + (tipo || 'ok') + ' show';
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(function() {
        t.classList.remove('show');
        setTimeout(function() { t.hidden = true; }, 260);
    }, duration || 3000);
}

// Fuente única de datos de alumnos — usada por turno, planificacion, evaluacion y alumnos
var ALUMNOS_DATA = [
    {
        key: 'ms', nombre: 'María Sánchez',  iniciales: 'MS',
        rutina: 'push-pull-met', rutinaLabel: 'Push / Pull / Metabólico',
        pago: 'activo',  contacto: '(011) 4567-8901', objetivo: 'Cond. Física Gral',
        lesion: 'Dolor en hombro izquierdo (crónico). Sin restricción completa.',
        restriccion: { tipo: 'restriccion', texto: 'Hombro izq.' },
        eval: { fms: 16, peso: 62.5, handgrip_d: 28.4, handgrip_i: 26.1 }
    },
    {
        key: 'lg', nombre: 'Lucas García',   iniciales: 'LG',
        rutina: 'empuje-rodilla', rutinaLabel: 'Empuje MS / Dom. Rodilla',
        pago: 'pendiente', contacto: '(011) 3456-7890', objetivo: 'Cond. Física Dep.',
        lesion: 'Rodilla derecha — condromalacia rotuliana. Evitar sentadilla profunda.',
        restriccion: { tipo: 'restriccion', texto: 'Rodilla der.' },
        eval: { fms: 12, peso: 78.0, handgrip_d: 42.1, handgrip_i: 39.8 }
    },
    {
        key: 'vr', nombre: 'Valentina Ríos', iniciales: 'VR',
        rutina: 'sin-asignar', rutinaLabel: 'Sin asignar',
        pago: 'activo',  contacto: '(011) 5678-9012', objetivo: 'Rehab.',
        lesion: 'Lumbalgia crónica. Protocolo de rehabilitación lumbar activo.',
        restriccion: { tipo: 'rehab', texto: 'Rehab. lumbar' },
        eval: { fms: 9, peso: 58.0, handgrip_d: 22.0, handgrip_i: 21.5 }
    },
    {
        key: 'af', nombre: 'Ana Fernández',  iniciales: 'AF',
        rutina: 'push-pull-met', rutinaLabel: 'Push / Pull / Metabólico',
        pago: 'activo',  contacto: '(011) 2345-6789', objetivo: 'Cond. Física Gral',
        lesion: 'Hombro izquierdo — tendinitis supraespinoso. Limitación en abducción >90°.',
        restriccion: { tipo: 'restriccion', texto: 'Hombro izq.' },
        eval: { fms: 14, peso: 55.5, handgrip_d: 25.2, handgrip_i: 23.8 }
    },
    {
        key: 'rm', nombre: 'Roberto Méndez', iniciales: 'RM',
        rutina: 'traccion-cadera', rutinaLabel: 'Tracción MS / Dom. Cadera',
        pago: 'inactivo', contacto: '(011) 1234-5678', objetivo: 'Cond. Física Dep.',
        lesion: 'Sin lesiones reportadas.',
        restriccion: null,
        eval: { fms: 18, peso: 85.0, handgrip_d: 51.3, handgrip_i: 48.9 }
    },
    {
        key: 'cl', nombre: 'Carla López',    iniciales: 'CL',
        rutina: 'metabolico', rutinaLabel: 'Metabólico / Zona Media',
        pago: 'activo',  contacto: '(011) 6789-0123', objetivo: 'Cond. Física Gral',
        lesion: 'Sin lesiones reportadas.',
        restriccion: null,
        eval: { fms: 15, peso: 67.0, handgrip_d: 29.1, handgrip_i: 27.4 }
    },
    {
        key: 'jp', nombre: 'Juan Pérez',     iniciales: 'JP',
        rutina: 'traccion-cadera', rutinaLabel: 'Tracción MS / Dom. Cadera',
        pago: 'inactivo', contacto: '(011) 7890-1234', objetivo: 'Cond. Física Dep.',
        lesion: 'Sin lesiones reportadas.',
        restriccion: null,
        eval: { fms: 17, peso: 82.5, handgrip_d: 46.8, handgrip_i: 44.2 }
    }
];

document.addEventListener('DOMContentLoaded', function () {
    initAdminCheckbox();
    initProfileDropdown();
    initSidebarToggle();
    initRutinaTracking();
    initTurnoCards();
    initPlanificacion();
    initEditorRutina();
    initBiblioteca();
    initEvaluacion();
    initAlumnos();
});

// ── Checkbox admin (index.html) ─────────────────────────────
function initAdminCheckbox() {
    const form     = document.getElementById('loginForm');
    const checkbox = document.getElementById('admin');
    if (!form || !checkbox) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        window.location.href = checkbox.checked
            ? 'paginas/turno.html'
            : 'paginas/inicio.html';
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
    if (!closeBtn || !elAvatar || !elNombre || !elRutina || !elBadge || !elBody) return;
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
        const alumno = ALUMNOS_DATA.find(function(a) { return a.key === key; });
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

// ── Biblioteca de plantillas (planificacion.html) ───────────
function initPlanificacion() {
    var grid = document.getElementById('plantillasGrid');
    if (!grid) return;

    var CAT_LABELS  = { fuerza: 'Fuerza', funcional: 'Funcional', cardio: 'Cardio', rehabilitacion: 'Rehabilitación' };
    var CAT_CLASSES = { fuerza: 'cat-fuerza', funcional: 'cat-funcional', cardio: 'cat-cardio', rehabilitacion: 'cat-rehabilitacion' };

    var PLANTILLAS_BASE = [
        {
            id: 'pl-1', nombre: 'Full Body 3 Días', categoria: 'fuerza', dias: 3, duracion: 60,
            musculos: 'Cuerpo completo',
            descripcion: 'Para principiantes e intermedios. Equilibrio entre volumen y recuperación.',
            dias_detalle: [
                { nombre: 'Día A — Empuje', ejercicios: [
                    { nombre: 'Press de banca plano',       musculo: 'Pecho · Tríceps',            series: 4, reps: '6–8',    descanso: '2 min' },
                    { nombre: 'Press militar con barra',    musculo: 'Hombros · Tríceps',           series: 3, reps: '10–12',  descanso: '90 s' },
                    { nombre: 'Fondos en paralelas',        musculo: 'Tríceps · Pecho inferior',    series: 3, reps: 'Al fallo', descanso: '90 s' },
                    { nombre: 'Sentadilla con barra',       musculo: 'Cuádriceps · Glúteos',        series: 4, reps: '6–8',    descanso: '2 min' },
                    { nombre: 'Prensa de piernas',          musculo: 'Cuádriceps · Glúteos',        series: 3, reps: '10–12',  descanso: '90 s' }
                ]},
                { nombre: 'Día B — Tracción', ejercicios: [
                    { nombre: 'Remo con barra',             musculo: 'Espalda · Bíceps',            series: 4, reps: '6–8',    descanso: '2 min' },
                    { nombre: 'Jalón al pecho',             musculo: 'Dorsal · Bíceps',             series: 3, reps: '10–12',  descanso: '90 s' },
                    { nombre: 'Face pull',                  musculo: 'Deltoides posterior',         series: 3, reps: '15',     descanso: '60 s' },
                    { nombre: 'Peso muerto rumano',         musculo: 'Isquiotibiales · Glúteos',    series: 4, reps: '8–10',   descanso: '2 min' },
                    { nombre: 'Curl de bíceps',             musculo: 'Bíceps',                      series: 3, reps: '10–12',  descanso: '60 s' }
                ]},
                { nombre: 'Día C — Full body', ejercicios: [
                    { nombre: 'Sentadilla frontal',         musculo: 'Cuádriceps · Core',           series: 4, reps: '8–10',   descanso: '2 min' },
                    { nombre: 'Press de banca inclinado',   musculo: 'Pecho superior · Hombros',    series: 3, reps: '10–12',  descanso: '90 s' },
                    { nombre: 'Remo en polea baja',         musculo: 'Espalda media · Bíceps',      series: 3, reps: '12–15',  descanso: '60 s' },
                    { nombre: 'Elevaciones laterales',      musculo: 'Deltoides lateral',           series: 3, reps: '12–15',  descanso: '60 s' },
                    { nombre: 'Plancha',                    musculo: 'Core',                        series: 3, reps: '45 s',   descanso: '60 s' }
                ]}
            ]
        },
        {
            id: 'pl-2', nombre: 'Push / Pull / Legs', categoria: 'fuerza', dias: 3, duracion: 70,
            musculos: 'Pecho · Espalda · Piernas',
            descripcion: 'Split clásico PPL para nivel intermedio. Alta especificidad por grupo muscular.',
            dias_detalle: [
                { nombre: 'Push — Empuje', ejercicios: [
                    { nombre: 'Press de banca plano',           musculo: 'Pecho · Tríceps · Hombro ant.', series: 4, reps: '6–8',   descanso: '2 min' },
                    { nombre: 'Press inclinado con mancuernas', musculo: 'Pecho superior',                series: 3, reps: '10–12', descanso: '90 s' },
                    { nombre: 'Aperturas en cable',             musculo: 'Pecho · Aislamiento',           series: 3, reps: '12–15', descanso: '60 s' },
                    { nombre: 'Press militar con barra',        musculo: 'Hombros · Tríceps',             series: 4, reps: '6–8',   descanso: '2 min' },
                    { nombre: 'Elevaciones laterales',          musculo: 'Deltoides lateral',             series: 3, reps: '12–15', descanso: '60 s' },
                    { nombre: 'Fondos en paralelas',            musculo: 'Tríceps · Pecho inferior',      series: 3, reps: 'Al fallo', descanso: '90 s' }
                ]},
                { nombre: 'Pull — Tracción', ejercicios: [
                    { nombre: 'Dominadas',                  musculo: 'Dorsal · Bíceps',             series: 4, reps: 'Al fallo', descanso: '2 min' },
                    { nombre: 'Remo con barra',             musculo: 'Espalda · Bíceps',            series: 4, reps: '6–8',    descanso: '2 min' },
                    { nombre: 'Jalón agarre estrecho',      musculo: 'Dorsal · Bíceps',             series: 3, reps: '10–12',  descanso: '90 s' },
                    { nombre: 'Face pull',                  musculo: 'Deltoides post. · Manguito',  series: 3, reps: '15',     descanso: '60 s' },
                    { nombre: 'Curl de bíceps con barra',   musculo: 'Bíceps braquial',             series: 3, reps: '8–10',   descanso: '60 s' }
                ]},
                { nombre: 'Legs — Piernas', ejercicios: [
                    { nombre: 'Sentadilla con barra',       musculo: 'Cuádriceps · Glúteos · Core', series: 5, reps: '5',      descanso: '3 min' },
                    { nombre: 'Prensa de piernas',          musculo: 'Cuádriceps · Glúteos',        series: 4, reps: '10–12',  descanso: '2 min' },
                    { nombre: 'Peso muerto rumano',         musculo: 'Isquiotibiales · Glúteos',    series: 4, reps: '8–10',   descanso: '2 min' },
                    { nombre: 'Hip thrust con barra',       musculo: 'Glúteos · Core',              series: 3, reps: '10–12',  descanso: '90 s' },
                    { nombre: 'Extensión de cuádriceps',    musculo: 'Cuádriceps · Aislamiento',    series: 3, reps: '12–15',  descanso: '60 s' },
                    { nombre: 'Curl de isquiotibiales',     musculo: 'Isquiotibiales',              series: 3, reps: '12–15',  descanso: '60 s' }
                ]}
            ]
        },
        {
            id: 'pl-3', nombre: 'Preparación Física', categoria: 'funcional', dias: 5, duracion: 50,
            musculos: 'Full body funcional',
            descripcion: 'Alta demanda cardiorrespiratoria. Mejora potencia, velocidad y resistencia general.',
            dias_detalle: [
                { nombre: 'Lunes — Potencia', ejercicios: [
                    { nombre: 'Power clean',                musculo: 'Full body · Potencia',        series: 5, reps: '3',      descanso: '3 min' },
                    { nombre: 'Saltos al cajón',            musculo: 'Piernas · Explosividad',      series: 4, reps: '5',      descanso: '2 min' },
                    { nombre: 'Lanzamiento de balón med.',  musculo: 'Core · Tren superior',        series: 4, reps: '8',      descanso: '90 s' },
                    { nombre: 'Sprint interválico',         musculo: 'Cardio · Piernas',            series: 6, reps: '30 s',   descanso: '1 min' }
                ]},
                { nombre: 'Martes — Fuerza', ejercicios: [
                    { nombre: 'Sentadilla con barra',       musculo: 'Cuádriceps · Glúteos · Core', series: 5, reps: '5',      descanso: '3 min' },
                    { nombre: 'Press de banca',             musculo: 'Pecho · Tríceps',             series: 5, reps: '5',      descanso: '2 min' },
                    { nombre: 'Peso muerto',                musculo: 'Cadena posterior · Core',     series: 4, reps: '5',      descanso: '3 min' },
                    { nombre: 'Dominadas lastradas',        musculo: 'Dorsal · Bíceps',             series: 4, reps: '6',      descanso: '2 min' }
                ]},
                { nombre: 'Miércoles — Resistencia', ejercicios: [
                    { nombre: 'Remo en ergómetro',          musculo: 'Full body · Cardio',          series: 4, reps: '500 m',  descanso: '2 min' },
                    { nombre: 'Burpees',                    musculo: 'Full body',                   series: 5, reps: '12',     descanso: '60 s' },
                    { nombre: 'Kettlebell swing',           musculo: 'Glúteos · Core · Espalda',    series: 5, reps: '15',     descanso: '60 s' },
                    { nombre: 'Mountain climbers',          musculo: 'Core · Cardio',               series: 4, reps: '20/lado', descanso: '45 s' }
                ]},
                { nombre: 'Jueves — Velocidad', ejercicios: [
                    { nombre: 'Skipping alto',              musculo: 'Cardio · Coordinación',       series: 6, reps: '20 s',   descanso: '40 s' },
                    { nombre: 'Saltos pliométricos',        musculo: 'Piernas · Explosividad',      series: 4, reps: '10',     descanso: '90 s' },
                    { nombre: 'Agilidad con escalera',      musculo: 'Coordinación · Velocidad',    series: 5, reps: '20 s',   descanso: '40 s' },
                    { nombre: 'Plancha con desplazamiento', musculo: 'Core · Funcional',            series: 3, reps: '30 s',   descanso: '60 s' }
                ]},
                { nombre: 'Viernes — Full body', ejercicios: [
                    { nombre: 'Thruster con barra',         musculo: 'Full body',                   series: 4, reps: '8',      descanso: '2 min' },
                    { nombre: 'Pull-ups',                   musculo: 'Dorsal · Bíceps',             series: 4, reps: 'Al fallo', descanso: '90 s' },
                    { nombre: 'Box jump',                   musculo: 'Piernas · Explosividad',      series: 4, reps: '8',      descanso: '90 s' },
                    { nombre: 'Core circuit',               musculo: 'Core · Funcional',            series: 3, reps: '4 ej × 30 s', descanso: '60 s' }
                ]}
            ]
        },
        {
            id: 'pl-4', nombre: 'Rehabilitación Lumbar', categoria: 'rehabilitacion', dias: 3, duracion: 40,
            musculos: 'Core · Espalda baja · Cadera',
            descripcion: 'Protocolo para lumbalgia crónica. Énfasis en estabilización y fortalecimiento progresivo.',
            dias_detalle: [
                { nombre: 'Sesión A — Estabilización', ejercicios: [
                    { nombre: 'Bird dog',                   musculo: 'Core multífido · Glúteos',    series: 3, reps: '10/lado', descanso: '60 s' },
                    { nombre: 'Plancha abdominal',          musculo: 'Core · Transverso',           series: 3, reps: '30 s',   descanso: '60 s' },
                    { nombre: 'Puente de glúteos',          musculo: 'Glúteos · Isquiotibiales',    series: 3, reps: '15',     descanso: '45 s' },
                    { nombre: 'Cat-Cow',                    musculo: 'Movilidad lumbar',            series: 2, reps: '10',     descanso: '30 s' },
                    { nombre: 'Dead bug',                   musculo: 'Core profundo',               series: 3, reps: '8/lado', descanso: '60 s' }
                ]},
                { nombre: 'Sesión B — Fortalecimiento', ejercicios: [
                    { nombre: 'Peso muerto rumano suave',   musculo: 'Isquiotibiales · Glúteos',    series: 3, reps: '12',     descanso: '90 s' },
                    { nombre: 'Sentadilla asistida',        musculo: 'Cuádriceps · Glúteos',        series: 3, reps: '12',     descanso: '90 s' },
                    { nombre: 'Remo en polea baja',         musculo: 'Espalda media · Romboides',   series: 3, reps: '12',     descanso: '60 s' },
                    { nombre: 'Hip thrust',                 musculo: 'Glúteos · Core',              series: 3, reps: '12',     descanso: '60 s' },
                    { nombre: 'Elevación lateral de cadera', musculo: 'Abductores · Estabilizadores', series: 3, reps: '15/lado', descanso: '45 s' }
                ]},
                { nombre: 'Sesión C — Movilidad', ejercicios: [
                    { nombre: 'Estiramiento de piriforme',  musculo: 'Glúteo profundo · Cadera',    series: 3, reps: '30 s/lado', descanso: '30 s' },
                    { nombre: 'Rodillo espinal',            musculo: 'Columna · Movilidad',         series: 2, reps: '10',     descanso: '30 s' },
                    { nombre: 'Plancha lateral',            musculo: 'Core lateral · Cuadrado lumb.', series: 3, reps: '20 s/lado', descanso: '45 s' },
                    { nombre: 'McGill curl-up',             musculo: 'Core anterior',               series: 3, reps: '10',     descanso: '45 s' },
                    { nombre: 'Caminar con banda elástica', musculo: 'Abductores · Estabilizadores', series: 3, reps: '15/lado', descanso: '45 s' }
                ]}
            ]
        },
        {
            id: 'pl-5', nombre: 'Metabólico Intensivo', categoria: 'cardio', dias: 4, duracion: 45,
            musculos: 'Full body',
            descripcion: 'Circuitos HIIT para pérdida de grasa y acondicionamiento cardiovascular. Alta intensidad.',
            dias_detalle: [
                { nombre: 'Circuito A', ejercicios: [
                    { nombre: 'Burpees',                    musculo: 'Full body',                   series: 4, reps: '15',     descanso: '30 s' },
                    { nombre: 'Kettlebell swing',           musculo: 'Glúteos · Core',              series: 4, reps: '20',     descanso: '30 s' },
                    { nombre: 'Saltos al cajón',            musculo: 'Piernas · Cardio',            series: 4, reps: '12',     descanso: '30 s' },
                    { nombre: 'Battle ropes',               musculo: 'Tren superior · Core',        series: 4, reps: '20 s',   descanso: '30 s' }
                ]},
                { nombre: 'Circuito B', ejercicios: [
                    { nombre: 'Thruster con mancuernas',    musculo: 'Full body',                   series: 4, reps: '12',     descanso: '30 s' },
                    { nombre: 'Mountain climbers',          musculo: 'Core · Cardio',               series: 4, reps: '20/lado', descanso: '30 s' },
                    { nombre: 'Remo con barra',             musculo: 'Espalda · Cardio',            series: 4, reps: '15',     descanso: '30 s' },
                    { nombre: 'Sentadilla con salto',       musculo: 'Piernas · Cardio',            series: 4, reps: '15',     descanso: '30 s' }
                ]},
                { nombre: 'Circuito C', ejercicios: [
                    { nombre: 'Push-up con palmada',        musculo: 'Pecho · Tríceps · Explosividad', series: 4, reps: '10', descanso: '30 s' },
                    { nombre: 'Plank to downward dog',      musculo: 'Core · Hombros',              series: 4, reps: '12',     descanso: '30 s' },
                    { nombre: 'Lunge con salto',            musculo: 'Piernas · Cardio',            series: 4, reps: '12/lado', descanso: '30 s' },
                    { nombre: 'High knees',                 musculo: 'Cardio · Coordinación',       series: 4, reps: '30 s',   descanso: '30 s' }
                ]},
                { nombre: 'Circuito D — Finisher', ejercicios: [
                    { nombre: 'Tabata: burpee / swing',     musculo: 'Full body',                   series: 8, reps: '20 s / 20 s', descanso: '10 s' },
                    { nombre: 'Plancha total',              musculo: 'Core',                        series: 3, reps: '45 s',   descanso: '30 s' },
                    { nombre: 'Sprint en cinta',            musculo: 'Cardio',                      series: 5, reps: '30 s',   descanso: '60 s' }
                ]}
            ]
        },
        {
            id: 'pl-6', nombre: 'Principiantes — Fuerza', categoria: 'fuerza', dias: 2, duracion: 45,
            musculos: 'Cuerpo completo',
            descripcion: 'Introducción al entrenamiento de fuerza. Énfasis en técnica y adaptación neuromuscular.',
            dias_detalle: [
                { nombre: 'Día 1', ejercicios: [
                    { nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps · Glúteos',      series: 3, reps: '15',     descanso: '60 s' },
                    { nombre: 'Flexiones modificadas',      musculo: 'Pecho · Tríceps',             series: 3, reps: '8–12',   descanso: '60 s' },
                    { nombre: 'Remo con mancuernas',        musculo: 'Espalda · Bíceps',            series: 3, reps: '12',     descanso: '60 s' },
                    { nombre: 'Plancha estática',           musculo: 'Core',                        series: 3, reps: '20 s',   descanso: '45 s' },
                    { nombre: 'Extensión de cadera en suelo', musculo: 'Glúteos · Isquiotibiales', series: 3, reps: '15',     descanso: '45 s' }
                ]},
                { nombre: 'Día 2', ejercicios: [
                    { nombre: 'Goblet squat con mancuerna', musculo: 'Cuádriceps · Core',           series: 3, reps: '12',     descanso: '60 s' },
                    { nombre: 'Press con mancuernas tumbado', musculo: 'Pecho · Tríceps',           series: 3, reps: '12',     descanso: '60 s' },
                    { nombre: 'Jalón al pecho en polea',    musculo: 'Dorsal · Bíceps',             series: 3, reps: '12',     descanso: '60 s' },
                    { nombre: 'Dead bug',                   musculo: 'Core profundo',               series: 3, reps: '8/lado', descanso: '60 s' },
                    { nombre: 'Zancada estática',           musculo: 'Cuádriceps · Glúteos',        series: 3, reps: '10/lado', descanso: '60 s' }
                ]}
            ]
        }
    ];

    // ── Estado ──────────────────────────────────────────────
    var plantillas = PLANTILLAS_BASE.map(function(p) { return JSON.parse(JSON.stringify(p)); });
    try {
        var edSaved = sessionStorage.getItem('ed_plantilla');
        if (edSaved) {
            var edPl = JSON.parse(edSaved);
            var edIdx = plantillas.findIndex(function(x) { return x.id === edPl.id; });
            if (edIdx !== -1) plantillas[edIdx] = edPl;
        }
    } catch(e) {}
    var filtroCat     = '';
    var filtroBusq    = '';
    var previewId     = null;
    var previewDia    = 0;
    var editId        = null;
    var diasEditVal   = 3;
    var asignarId     = null;
    var deleteId      = null;

    // ── Helpers ─────────────────────────────────────────────
    function uid() { return 'pl-' + Date.now() + '-' + Math.floor(Math.random() * 1000); }

    function totalEjercicios(p) {
        return p.dias_detalle.reduce(function(acc, d) { return acc + d.ejercicios.length; }, 0);
    }

    function buildDiaDetalle(n) {
        var dias = [];
        for (var i = 1; i <= n; i++) {
            dias.push({ nombre: 'Día ' + i, ejercicios: [] });
        }
        return dias;
    }

    function showToast(msg, tipo) { _toast('plToast', 'pl-toast', msg, tipo); }

    function openOverlay(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.add('open');
        el.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
        var anyOpen = document.querySelector('.pl-overlay.open');
        if (!anyOpen) document.body.style.overflow = '';
    }

    // ── Render grid ─────────────────────────────────────────
    function render() {
        var lista = plantillas.filter(function(p) {
            var okCat  = !filtroCat  || p.categoria === filtroCat;
            var q      = filtroBusq.toLowerCase();
            var okSearch = !q || p.nombre.toLowerCase().includes(q) ||
                               p.musculos.toLowerCase().includes(q) ||
                               p.descripcion.toLowerCase().includes(q);
            return okCat && okSearch;
        });

        var sub = document.getElementById('libSub');
        if (sub) sub.textContent = plantillas.length + ' plantilla' + (plantillas.length !== 1 ? 's' : '');

        var empty = document.getElementById('libEmpty');
        if (empty) empty.hidden = lista.length > 0;

        grid.innerHTML = lista.map(renderCard).join('');

        grid.querySelectorAll('.plantilla-card').forEach(function(card) {
            var id = card.dataset.id;
            card.querySelector('.pcard-body').addEventListener('click', function() { openPreview(id); });
            card.querySelector('.pcard-body').addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPreview(id); }
            });
            card.querySelector('.btn-asignar').addEventListener('click', function(e) { e.stopPropagation(); openAsignar(id); });
            card.querySelector('.btn-editar').addEventListener('click', function(e) {
                e.stopPropagation();
                var p = plantillas.find(function(x) { return x.id === id; });
                if (p) { sessionStorage.setItem('ed_plantilla', JSON.stringify(p)); window.location.href = 'editorutina.html'; }
            });
            card.querySelector('.btn-duplicar').addEventListener('click', function(e) { e.stopPropagation(); duplicar(id); });
            card.querySelector('.btn-eliminar').addEventListener('click', function(e) { e.stopPropagation(); openDelete(id); });
        });
    }

    function renderCard(p) {
        var catLabel = CAT_LABELS[p.categoria] || p.categoria;
        var catClass = CAT_CLASSES[p.categoria] || '';
        var total    = totalEjercicios(p);
        var sNombre = escapeHtml(p.nombre);
        var sMusculos = escapeHtml(p.musculos);
        var sDesc = escapeHtml(p.descripcion);
        return '<article class="plantilla-card" data-id="' + p.id + '" role="listitem">' +
            '<div class="pcard-accent pcard-accent--' + p.categoria + '"></div>' +
            '<div class="pcard-body" tabindex="0" role="button" aria-label="Ver plantilla ' + sNombre + '">' +
                '<div class="pcard-top">' +
                    '<span class="pcat-badge ' + catClass + '">' + catLabel + '</span>' +
                    '<span class="pdias-badge">' + p.dias + ' días/sem</span>' +
                '</div>' +
                '<h3 class="pcard-nombre">' + sNombre + '</h3>' +
                '<p class="pcard-musculos">' + sMusculos + '</p>' +
                '<p class="pcard-desc">' + sDesc + '</p>' +
                '<div class="pcard-stats">' +
                    '<span>' + total + ' ejercicios</span>' +
                    '<span>~' + p.duracion + ' min/día</span>' +
                '</div>' +
            '</div>' +
            '<div class="pcard-footer">' +
                '<button class="pcard-btn-asignar btn-asignar" aria-label="Asignar plantilla ' + p.nombre + '">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' +
                    'Asignar' +
                '</button>' +
                '<div class="pcard-actions">' +
                    '<button class="pcard-icon-btn btn-editar" title="Editar" aria-label="Editar">' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
                    '</button>' +
                    '<button class="pcard-icon-btn btn-duplicar" title="Duplicar" aria-label="Duplicar">' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>' +
                    '</button>' +
                    '<button class="pcard-icon-btn pcard-icon-btn--danger btn-eliminar" title="Eliminar" aria-label="Eliminar">' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</article>';
    }

    // ── Modal vista previa ───────────────────────────────────
    function openPreview(id) {
        var p = plantillas.find(function(x) { return x.id === id; });
        if (!p) return;
        previewId  = id;
        previewDia = 0;

        var catLabel = CAT_LABELS[p.categoria] || p.categoria;
        var catClass = CAT_CLASSES[p.categoria] || '';

        document.getElementById('previewCatBadge').textContent  = catLabel;
        document.getElementById('previewCatBadge').className    = 'pcat-badge ' + catClass;
        document.getElementById('previewDiasBadge').textContent = p.dias + ' días/sem';
        document.getElementById('previewDuracion').textContent  = '~' + p.duracion + ' min/día';
        document.getElementById('previewNombre').textContent    = p.nombre;
        document.getElementById('previewMusculos').textContent  = p.musculos;
        document.getElementById('previewDesc').textContent      = p.descripcion;

        renderPreviewTabs(p);
        renderPreviewBody(p, 0);
        openOverlay('previewOverlay');
        document.getElementById('previewClose').focus();
    }

    function renderPreviewTabs(p) {
        var tabs = document.getElementById('previewTabs');
        tabs.innerHTML = p.dias_detalle.map(function(d, i) {
            return '<button class="pl-day-tab' + (i === previewDia ? ' pl-day-tab--active' : '') + '" ' +
                'role="tab" aria-selected="' + (i === previewDia) + '" data-dia="' + i + '">' +
                d.nombre + '</button>';
        }).join('');
        tabs.querySelectorAll('.pl-day-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                previewDia = parseInt(btn.dataset.dia, 10);
                tabs.querySelectorAll('.pl-day-tab').forEach(function(b) {
                    b.classList.toggle('pl-day-tab--active', b === btn);
                    b.setAttribute('aria-selected', b === btn);
                });
                var p2 = plantillas.find(function(x) { return x.id === previewId; });
                if (p2) renderPreviewBody(p2, previewDia);
            });
        });
    }

    function renderPreviewBody(p, diaIdx) {
        var dia   = p.dias_detalle[diaIdx];
        var body  = document.getElementById('previewBody');
        if (!dia) { body.innerHTML = ''; return; }
        if (!dia.ejercicios.length) {
            body.innerHTML = '<p style="color:rgba(255,255,255,0.35);font-size:0.85rem;padding:10px 0;text-align:center;">Sin ejercicios asignados en este día.</p>';
            return;
        }
        body.innerHTML = dia.ejercicios.map(function(ej, i) {
            return '<div class="pej-item">' +
                '<span class="pej-num">' + (i + 1) + '</span>' +
                '<div class="pej-info">' +
                    '<p class="pej-nombre">' + ej.nombre + '</p>' +
                    '<p class="pej-musculo">' + ej.musculo + '</p>' +
                '</div>' +
                '<div class="pej-chips">' +
                    '<span class="pej-chip pej-chip--series">' + ej.series + ' ser.</span>' +
                    '<span class="pej-chip pej-chip--reps">' + ej.reps + '</span>' +
                    '<span class="pej-chip pej-chip--descanso">' + ej.descanso + '</span>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    document.getElementById('previewClose').addEventListener('click', function() { closeOverlay('previewOverlay'); });
    document.getElementById('previewOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeOverlay('previewOverlay');
    });
    document.getElementById('previewBtnAsignar').addEventListener('click', function() {
        closeOverlay('previewOverlay');
        openAsignar(previewId);
    });
    document.getElementById('previewBtnEditar').addEventListener('click', function() {
        var p = plantillas.find(function(x) { return x.id === previewId; });
        if (p) { sessionStorage.setItem('ed_plantilla', JSON.stringify(p)); window.location.href = 'editorutina.html'; }
    });

    // ── Modal crear / editar ─────────────────────────────────
    function openEdit(id) {
        editId = id || null;

        var p = id ? plantillas.find(function(x) { return x.id === id; }) : null;

        document.getElementById('editTitle').textContent = p ? 'Editar Plantilla' : 'Nueva Plantilla';
        document.getElementById('fNombre').value         = p ? p.nombre      : '';
        document.getElementById('fCategoria').value      = p ? p.categoria   : 'fuerza';
        document.getElementById('fMusculos').value       = p ? p.musculos    : '';
        document.getElementById('fDuracion').value       = p ? p.duracion    : 60;
        document.getElementById('fDesc').value           = p ? p.descripcion : '';

        diasEditVal = p ? p.dias : 3;
        document.getElementById('fDiasVal').textContent = diasEditVal;

        document.getElementById('fNombre').classList.remove('invalid');
        document.getElementById('fNombreError').classList.remove('visible');

        openOverlay('editOverlay');
        document.getElementById('fNombre').focus();
    }

    document.getElementById('fDiasMinus').addEventListener('click', function() {
        if (diasEditVal > 1) { diasEditVal--; document.getElementById('fDiasVal').textContent = diasEditVal; }
    });
    document.getElementById('fDiasPlus').addEventListener('click', function() {
        if (diasEditVal < 7) { diasEditVal++; document.getElementById('fDiasVal').textContent = diasEditVal; }
    });

    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var nombre = document.getElementById('fNombre').value.trim();
        if (!nombre) {
            document.getElementById('fNombre').classList.add('invalid');
            document.getElementById('fNombreError').classList.add('visible');
            document.getElementById('fNombre').focus();
            return;
        }
        var datos = {
            nombre:      nombre,
            categoria:   document.getElementById('fCategoria').value,
            dias:        diasEditVal,
            musculos:    document.getElementById('fMusculos').value.trim() || 'Sin especificar',
            duracion:    parseInt(document.getElementById('fDuracion').value, 10) || 60,
            descripcion: document.getElementById('fDesc').value.trim() || ''
        };

        if (editId) {
            var idx = plantillas.findIndex(function(x) { return x.id === editId; });
            if (idx !== -1) {
                var diasActuales = plantillas[idx].dias_detalle;
                var nuevos = buildDiaDetalle(datos.dias);
                for (var i = 0; i < nuevos.length; i++) {
                    if (diasActuales[i]) nuevos[i] = diasActuales[i];
                }
                plantillas[idx] = Object.assign({}, plantillas[idx], datos, { dias_detalle: nuevos });
            }
            showToast('Plantilla actualizada.', 'ok');
        } else {
            var nueva = Object.assign({ id: uid(), dias_detalle: buildDiaDetalle(datos.dias) }, datos);
            plantillas.push(nueva);
            showToast('Plantilla creada.', 'ok');
        }

        closeOverlay('editOverlay');
        render();
    });

    document.getElementById('editClose').addEventListener('click',  function() { closeOverlay('editOverlay'); });
    document.getElementById('editCancel').addEventListener('click', function() { closeOverlay('editOverlay'); });
    document.getElementById('editOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeOverlay('editOverlay');
    });

    // ── Duplicar ─────────────────────────────────────────────
    function duplicar(id) {
        var p = plantillas.find(function(x) { return x.id === id; });
        if (!p) return;
        var copia = JSON.parse(JSON.stringify(p));
        copia.id     = uid();
        copia.nombre = p.nombre + ' — copia';
        plantillas.push(copia);
        render();
        showToast('Plantilla duplicada.', 'info');
    }

    // ── Modal asignar ────────────────────────────────────────
    function openAsignar(id) {
        asignarId = id;
        var p = plantillas.find(function(x) { return x.id === id; });
        if (!p) return;

        document.getElementById('asignarTitle').textContent    = 'Asignar plantilla';
        document.getElementById('asignarSubtitle').textContent = p.nombre;

        var list = document.getElementById('asignarList');
        list.innerHTML = ALUMNOS_DATA.map(function(a) {
            return '<div class="asignar-item" role="checkbox" data-key="' + a.key + '" tabindex="0" aria-checked="false">' +
                '<div class="asignar-avatar">' + escapeHtml(a.iniciales) + '</div>' +
                '<span class="asignar-nombre">' + escapeHtml(a.nombre) + '</span>' +
                '<div class="asignar-check" aria-hidden="true"></div>' +
            '</div>';
        }).join('');

        list.querySelectorAll('.asignar-item').forEach(function(item) {
            function toggle() {
                item.classList.toggle('selected');
                item.setAttribute('aria-checked', item.classList.contains('selected'));
                actualizarCount();
            }
            item.addEventListener('click', toggle);
            item.addEventListener('keydown', function(e) {
                if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
            });
        });

        actualizarCount();

        var searchEl = document.getElementById('asignarSearch');
        if (searchEl) {
            searchEl.value = '';
            searchEl.oninput = function() {
                var q = searchEl.value.toLowerCase().trim();
                document.querySelectorAll('#asignarList .asignar-item').forEach(function(item) {
                    var nombre = item.querySelector('.asignar-nombre').textContent.toLowerCase();
                    item.hidden = !!(q && !nombre.includes(q));
                });
            };
        }

        openOverlay('asignarOverlay');
        if (searchEl) searchEl.focus(); else document.getElementById('asignarClose').focus();
    }

    function actualizarCount() {
        var sel = document.querySelectorAll('#asignarList .asignar-item.selected').length;
        document.getElementById('asignarCount').textContent = sel + ' alumno' + (sel !== 1 ? 's' : '') + ' seleccionado' + (sel !== 1 ? 's' : '');
    }

    document.getElementById('asignarConfirm').addEventListener('click', function() {
        var selItems = document.querySelectorAll('#asignarList .asignar-item.selected');
        if (!selItems.length) {
            showToast('Seleccioná al menos un alumno.', 'warn');
            return;
        }
        var nombres = [];
        selItems.forEach(function(item) {
            var key    = item.dataset.key;
            var alumno = ALUMNOS_DATA.find(function(a) { return a.key === key; });
            if (alumno) nombres.push(alumno.nombre.split(' ')[0]);
        });
        closeOverlay('asignarOverlay');
        var p = plantillas.find(function(x) { return x.id === asignarId; });
        showToast('Asignada "' + (p ? p.nombre : '') + '" a ' + nombres.join(', ') + '.', 'ok');
    });

    document.getElementById('asignarClose').addEventListener('click',  function() { closeOverlay('asignarOverlay'); });
    document.getElementById('asignarCancel').addEventListener('click', function() { closeOverlay('asignarOverlay'); });
    document.getElementById('asignarOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeOverlay('asignarOverlay');
    });

    // ── Modal eliminar ───────────────────────────────────────
    function openDelete(id) {
        var p = plantillas.find(function(x) { return x.id === id; });
        if (!p) return;
        deleteId = id;
        document.getElementById('deleteSubtitle').textContent = '¿Eliminar "' + p.nombre + '"? Esta acción no se puede deshacer.';
        openOverlay('deleteOverlay');
        document.getElementById('deleteCancel').focus();
    }

    document.getElementById('deleteConfirm').addEventListener('click', function() {
        plantillas = plantillas.filter(function(x) { return x.id !== deleteId; });
        closeOverlay('deleteOverlay');
        render();
        showToast('Plantilla eliminada.', 'warn');
    });

    document.getElementById('deleteCancel').addEventListener('click',  function() { closeOverlay('deleteOverlay'); });
    document.getElementById('deleteOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeOverlay('deleteOverlay');
    });

    // ── Filtros ──────────────────────────────────────────────
    document.querySelectorAll('.cat-pill').forEach(function(btn) {
        btn.addEventListener('click', function() {
            filtroCat = btn.dataset.cat;
            document.querySelectorAll('.cat-pill').forEach(function(b) {
                b.classList.toggle('cat-pill--active', b === btn);
            });
            render();
        });
    });

    var libSearch = document.getElementById('libSearch');
    if (libSearch) {
        libSearch.addEventListener('input', function() {
            filtroBusq = libSearch.value;
            render();
        });
    }

    // ── Botones Nueva Plantilla ──────────────────────────────
    var btnNueva = document.getElementById('btnNuevaPlanificacion');
    if (btnNueva) btnNueva.addEventListener('click', function() { openEdit(null); });

    // ── Escape global ────────────────────────────────────────
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        ['previewOverlay', 'editOverlay', 'asignarOverlay', 'deleteOverlay'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el && el.classList.contains('open')) closeOverlay(id);
        });
    });

    // ── Render inicial ───────────────────────────────────────
    render();
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

// ── Editor de rutinas (editorutina.html) ────────────────────
function initEditorRutina() {
    var tabList = document.getElementById('edTabList');
    if (!tabList) return;

    // ── Base de ejercicios ─────────────────────────────────
    var EJ_DB = [
        // Pecho
        { id: 'e01', nombre: 'Press de banca plano',          musculo: 'Pecho · Tríceps · Hombro ant.', grupo: 'Pecho' },
        { id: 'e02', nombre: 'Press inclinado con mancuernas', musculo: 'Pecho superior · Hombros',     grupo: 'Pecho' },
        { id: 'e03', nombre: 'Press declinado',                musculo: 'Pecho inferior · Tríceps',     grupo: 'Pecho' },
        { id: 'e04', nombre: 'Aperturas con mancuernas',       musculo: 'Pecho · Aislamiento',          grupo: 'Pecho' },
        { id: 'e05', nombre: 'Aperturas en cable',             musculo: 'Pecho · Aislamiento',          grupo: 'Pecho' },
        { id: 'e06', nombre: 'Flexiones',                      musculo: 'Pecho · Tríceps · Core',       grupo: 'Pecho' },
        { id: 'e07', nombre: 'Fondos en paralelas',            musculo: 'Pecho inferior · Tríceps',     grupo: 'Pecho' },
        // Espalda
        { id: 'e08', nombre: 'Dominadas',                      musculo: 'Dorsal · Bíceps',              grupo: 'Espalda' },
        { id: 'e09', nombre: 'Remo con barra',                 musculo: 'Espalda media · Bíceps',       grupo: 'Espalda' },
        { id: 'e10', nombre: 'Jalón al pecho',                 musculo: 'Dorsal · Bíceps',              grupo: 'Espalda' },
        { id: 'e11', nombre: 'Remo en polea baja',             musculo: 'Espalda media · Bíceps',       grupo: 'Espalda' },
        { id: 'e12', nombre: 'Remo con mancuerna',             musculo: 'Dorsal · Bíceps',              grupo: 'Espalda' },
        { id: 'e13', nombre: 'Face pull',                      musculo: 'Deltoides post. · Manguito',   grupo: 'Espalda' },
        { id: 'e14', nombre: 'Pullover con mancuerna',         musculo: 'Dorsal · Pecho',               grupo: 'Espalda' },
        // Hombros
        { id: 'e15', nombre: 'Press militar con barra',        musculo: 'Hombros · Tríceps',            grupo: 'Hombros' },
        { id: 'e16', nombre: 'Press Arnold',                   musculo: 'Hombros · Tríceps',            grupo: 'Hombros' },
        { id: 'e17', nombre: 'Elevaciones laterales',          musculo: 'Deltoides lateral',            grupo: 'Hombros' },
        { id: 'e18', nombre: 'Elevaciones frontales',          musculo: 'Deltoides anterior',           grupo: 'Hombros' },
        { id: 'e19', nombre: 'Vuelos / Pájaros',               musculo: 'Deltoides posterior',          grupo: 'Hombros' },
        // Bíceps
        { id: 'e20', nombre: 'Curl de bíceps con barra',       musculo: 'Bíceps braquial',              grupo: 'Bíceps' },
        { id: 'e21', nombre: 'Curl martillo',                  musculo: 'Bíceps · Braquiorradial',      grupo: 'Bíceps' },
        { id: 'e22', nombre: 'Curl concentrado',               musculo: 'Bíceps braquial',              grupo: 'Bíceps' },
        { id: 'e23', nombre: 'Curl en polea baja',             musculo: 'Bíceps · Brachialis',          grupo: 'Bíceps' },
        // Tríceps
        { id: 'e24', nombre: 'Extensión en polea alta',        musculo: 'Tríceps braquial',             grupo: 'Tríceps' },
        { id: 'e25', nombre: 'Press francés',                  musculo: 'Tríceps · Codo',               grupo: 'Tríceps' },
        { id: 'e26', nombre: 'Extensión con mancuerna',        musculo: 'Tríceps braquial',             grupo: 'Tríceps' },
        { id: 'e27', nombre: 'Patada de tríceps',              musculo: 'Tríceps braquial',             grupo: 'Tríceps' },
        // Piernas
        { id: 'e28', nombre: 'Sentadilla con barra',           musculo: 'Cuádriceps · Glúteos · Core',  grupo: 'Piernas' },
        { id: 'e29', nombre: 'Sentadilla frontal',             musculo: 'Cuádriceps · Core',            grupo: 'Piernas' },
        { id: 'e30', nombre: 'Sentadilla búlgara',             musculo: 'Cuádriceps · Glúteos',         grupo: 'Piernas' },
        { id: 'e31', nombre: 'Prensa de piernas',              musculo: 'Cuádriceps · Glúteos',         grupo: 'Piernas' },
        { id: 'e32', nombre: 'Peso muerto rumano',             musculo: 'Isquiotibiales · Glúteos',     grupo: 'Piernas' },
        { id: 'e33', nombre: 'Peso muerto convencional',       musculo: 'Cadena posterior · Core',      grupo: 'Piernas' },
        { id: 'e34', nombre: 'Hip thrust con barra',           musculo: 'Glúteos · Core',               grupo: 'Piernas' },
        { id: 'e35', nombre: 'Extensión de cuádriceps',        musculo: 'Cuádriceps · Aislamiento',     grupo: 'Piernas' },
        { id: 'e36', nombre: 'Curl de isquiotibiales',         musculo: 'Isquiotibiales',               grupo: 'Piernas' },
        { id: 'e37', nombre: 'Zancadas',                       musculo: 'Cuádriceps · Glúteos',         grupo: 'Piernas' },
        { id: 'e38', nombre: 'Elevación de pantorrillas',      musculo: 'Gemelos · Sóleo',              grupo: 'Piernas' },
        // Core
        { id: 'e39', nombre: 'Plancha abdominal',              musculo: 'Core · Transverso',            grupo: 'Core' },
        { id: 'e40', nombre: 'Plancha lateral',                musculo: 'Core lateral · Cuadrado lumb.', grupo: 'Core' },
        { id: 'e41', nombre: 'Crunch abdominal',               musculo: 'Recto abdominal',              grupo: 'Core' },
        { id: 'e42', nombre: 'Dead bug',                       musculo: 'Core profundo · Transverso',   grupo: 'Core' },
        { id: 'e43', nombre: 'Bird dog',                       musculo: 'Core · Glúteos · Espalda',     grupo: 'Core' },
        { id: 'e44', nombre: 'Mountain climbers',              musculo: 'Core · Cardio',                grupo: 'Core' },
        { id: 'e45', nombre: 'Rueda abdominal',                musculo: 'Core · Hombros',               grupo: 'Core' },
        // Funcional
        { id: 'e46', nombre: 'Burpees',                        musculo: 'Full body · Cardio',           grupo: 'Funcional' },
        { id: 'e47', nombre: 'Kettlebell swing',               musculo: 'Glúteos · Core · Espalda',     grupo: 'Funcional' },
        { id: 'e48', nombre: 'Saltos al cajón',                musculo: 'Piernas · Explosividad',       grupo: 'Funcional' },
        { id: 'e49', nombre: 'Battle ropes',                   musculo: 'Tren superior · Core · Cardio', grupo: 'Funcional' },
        { id: 'e50', nombre: 'Thruster con barra',             musculo: 'Full body · Fuerza',           grupo: 'Funcional' },
        { id: 'e51', nombre: 'Power clean',                    musculo: 'Full body · Potencia',         grupo: 'Funcional' },
        { id: 'e52', nombre: 'Sentadilla con salto',           musculo: 'Piernas · Explosividad',       grupo: 'Funcional' },
        // Rehabilitación
        { id: 'e53', nombre: 'Puente de glúteos',              musculo: 'Glúteos · Isquiotibiales',     grupo: 'Rehabilitación' },
        { id: 'e55', nombre: 'McGill curl-up',                 musculo: 'Core anterior',                grupo: 'Rehabilitación' },
        { id: 'e56', nombre: 'Cat-Cow',                        musculo: 'Movilidad lumbar',             grupo: 'Rehabilitación' },
        { id: 'e57', nombre: 'Hip thrust con banda',           musculo: 'Glúteos · Core',               grupo: 'Rehabilitación' }
    ];

    // ── Estado ─────────────────────────────────────────────
    var plantilla    = null;
    var diaActivo    = 0;
    var editEjIdx    = null;

    // ── Cargar desde sessionStorage ────────────────────────
    try {
        var raw = sessionStorage.getItem('ed_plantilla');
        if (raw) plantilla = JSON.parse(raw);
    } catch(e) {}

    // Demo si no viene nada
    if (!plantilla) {
        plantilla = {
            id: 'demo', nombre: 'Plantilla de ejemplo', categoria: 'fuerza', dias: 3, duracion: 60,
            musculos: 'Cuerpo completo', descripcion: 'Plantilla de demostración.',
            dias_detalle: [
                { nombre: 'Día 1', ejercicios: [
                    { nombre: 'Press de banca plano', musculo: 'Pecho · Tríceps · Hombro ant.', series: 4, reps: '6–8', descanso: '2 min' },
                    { nombre: 'Press militar con barra', musculo: 'Hombros · Tríceps', series: 3, reps: '10–12', descanso: '90 s' }
                ]},
                { nombre: 'Día 2', ejercicios: [] },
                { nombre: 'Día 3', ejercicios: [] }
            ]
        };
    }

    // ── Guardar en sessionStorage ──────────────────────────
    function guardar() {
        try { sessionStorage.setItem('ed_plantilla', JSON.stringify(plantilla)); } catch(e) {}
        var hint = document.getElementById('edSavedHint');
        if (!hint) return;
        hint.hidden = false;
        hint.classList.add('show');
        clearTimeout(hint._t);
        hint._t = setTimeout(function() { hint.classList.remove('show'); }, 2000);
    }

    // ── Toast ──────────────────────────────────────────────
    function toast(msg, tipo) { _toast('edToast', 'ed-toast', msg, tipo, 2800); }

    // ── Modal open/close ───────────────────────────────────
    function openModal(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.add('open');
        el.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
        if (!document.querySelector('.ed-overlay.open')) document.body.style.overflow = '';
    }

    // ── Render cabecera ────────────────────────────────────
    function renderHeader() {
        document.getElementById('edNombre').textContent  = plantilla.nombre;
        document.getElementById('edDias').textContent    = plantilla.dias + ' días/sem';
        document.title = 'Enjoy — ' + plantilla.nombre;
    }

    // ── Render tabs ────────────────────────────────────────
    function renderTabs() {
        tabList.innerHTML = plantilla.dias_detalle.map(function(d, i) {
            return '<button class="ed-tab' + (i === diaActivo ? ' ed-tab--active' : '') + '" ' +
                'role="tab" aria-selected="' + (i === diaActivo) + '" data-dia="' + i + '">' +
                d.nombre + '</button>';
        }).join('');

        tabList.querySelectorAll('.ed-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                diaActivo = parseInt(btn.dataset.dia, 10);
                tabList.querySelectorAll('.ed-tab').forEach(function(b) {
                    b.classList.toggle('ed-tab--active', b === btn);
                    b.setAttribute('aria-selected', b === btn);
                });
                renderEjercicios();
            });
        });

        var delBtn = document.getElementById('btnEliminarDia');
        if (delBtn) delBtn.disabled = plantilla.dias_detalle.length <= 1;
    }

    // ── Render lista de ejercicios ─────────────────────────
    function renderEjercicios() {
        var dia       = plantilla.dias_detalle[diaActivo];
        var ejList    = document.getElementById('edEjList');
        var emptyEl   = document.getElementById('edEmpty');
        var countEl   = document.getElementById('edEjCount');
        var titleEl   = document.getElementById('edDayTitle');

        if (titleEl) titleEl.textContent = dia.nombre;
        if (countEl) countEl.textContent = dia.ejercicios.length + ' ejercicio' + (dia.ejercicios.length !== 1 ? 's' : '');
        if (emptyEl) emptyEl.hidden = dia.ejercicios.length > 0;

        var total = dia.ejercicios.length;
        ejList.innerHTML = dia.ejercicios.map(function(ej, i) {
            return '<div class="ed-ej-item" role="listitem" data-idx="' + i + '">' +
                '<div class="ed-order-btns">' +
                    '<button class="ed-order-btn" data-idx="' + i + '" data-dir="-1"' + (i === 0 ? ' disabled' : '') + ' aria-label="Mover arriba">' +
                        '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>' +
                    '</button>' +
                    '<button class="ed-order-btn" data-idx="' + i + '" data-dir="1"' + (i === total - 1 ? ' disabled' : '') + ' aria-label="Mover abajo">' +
                        '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>' +
                    '</button>' +
                '</div>' +
                '<span class="ed-ej-num">' + (i + 1) + '</span>' +
                '<div class="ed-ej-info">' +
                    '<p class="ed-ej-nombre">' + escapeHtml(ej.nombre) + '</p>' +
                    '<p class="ed-ej-musculo">' + escapeHtml(ej.musculo) + '</p>' +
                    '<div class="ed-ej-chips">' +
                        '<span class="ed-chip ed-chip--series">' + escapeHtml(String(ej.series)) + ' ser.</span>' +
                        '<span class="ed-chip ed-chip--reps">' + escapeHtml(ej.reps) + '</span>' +
                        '<span class="ed-chip ed-chip--descanso">' + escapeHtml(ej.descanso) + '</span>' +
                    '</div>' +
                '</div>' +
                '<button class="ed-ej-edit-btn" data-idx="' + i + '" aria-label="Editar ' + escapeHtml(ej.nombre) + '">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
                '</button>' +
            '</div>';
        }).join('');

        ejList.querySelectorAll('.ed-order-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(btn.dataset.idx, 10);
                var dir = parseInt(btn.dataset.dir, 10);
                var lista = plantilla.dias_detalle[diaActivo].ejercicios;
                var nuevoIdx = idx + dir;
                if (nuevoIdx < 0 || nuevoIdx >= lista.length) return;
                var tmp = lista[idx]; lista[idx] = lista[nuevoIdx]; lista[nuevoIdx] = tmp;
                guardar();
                renderEjercicios();
            });
        });

        ejList.querySelectorAll('.ed-ej-edit-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                openEditEj(parseInt(btn.dataset.idx, 10));
            });
        });
    }

    // ── Eliminar día ───────────────────────────────────────
    document.getElementById('btnEliminarDia').addEventListener('click', function() {
        if (plantilla.dias_detalle.length <= 1) return;
        var nombre = plantilla.dias_detalle[diaActivo].nombre;
        plantilla.dias_detalle.splice(diaActivo, 1);
        plantilla.dias = plantilla.dias_detalle.length;
        if (diaActivo >= plantilla.dias_detalle.length) diaActivo = plantilla.dias_detalle.length - 1;
        guardar();
        renderHeader();
        renderTabs();
        renderEjercicios();
        toast('"' + nombre + '" eliminado.', 'warn');
    });

    // ── Duplicar día ───────────────────────────────────────
    document.getElementById('btnDuplicarDia').addEventListener('click', function() {
        var original = plantilla.dias_detalle[diaActivo];
        var copia    = JSON.parse(JSON.stringify(original));
        var newNum   = plantilla.dias_detalle.length + 1;
        copia.nombre = 'Día ' + newNum;
        plantilla.dias_detalle.push(copia);
        plantilla.dias = plantilla.dias_detalle.length;
        diaActivo = plantilla.dias_detalle.length - 1;
        guardar();
        renderHeader();
        renderTabs();
        renderEjercicios();
        toast('Día duplicado como "' + copia.nombre + '".', 'ok');
    });

    // ── Modal Configuración ────────────────────────────────
    document.getElementById('btnConfig').addEventListener('click', function() {
        document.getElementById('cfgNombre').value = plantilla.nombre;
        document.getElementById('cfgDesc').value   = plantilla.descripcion || '';
        document.getElementById('cfgNombre').classList.remove('invalid');
        document.getElementById('cfgNombreError').classList.remove('visible');
        openModal('configOverlay');
        document.getElementById('cfgNombre').focus();
    });

    document.getElementById('configForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var nombre = document.getElementById('cfgNombre').value.trim();
        if (!nombre) {
            document.getElementById('cfgNombre').classList.add('invalid');
            document.getElementById('cfgNombreError').classList.add('visible');
            return;
        }
        plantilla.nombre      = nombre;
        plantilla.descripcion = document.getElementById('cfgDesc').value.trim();
        closeModal('configOverlay');
        renderHeader();
        guardar();
    });

    document.getElementById('configClose').addEventListener('click',  function() { closeModal('configOverlay'); });
    document.getElementById('configCancel').addEventListener('click', function() { closeModal('configOverlay'); });
    document.getElementById('configOverlay').addEventListener('click', function(e) { if (e.target === this) closeModal('configOverlay'); });

    // ── Modal Agregar Ejercicio ────────────────────────────
    document.getElementById('btnAgregarEj').addEventListener('click', function() {
        document.getElementById('ejSearch').value = '';
        renderEjDb('');
        openModal('searchOverlay');
        document.getElementById('ejSearch').focus();
    });

    function renderEjDb(q) {
        var lista    = document.getElementById('ejDbList');
        var qLow     = q.toLowerCase().trim();
        var filtered = !qLow ? EJ_DB : EJ_DB.filter(function(ej) {
            return ej.nombre.toLowerCase().includes(qLow) || ej.musculo.toLowerCase().includes(qLow);
        });

        if (!filtered.length) {
            lista.innerHTML = '<p class="ej-db-empty">Sin resultados para "' + q + '".</p>';
            return;
        }

        function ejDbItem(ej) {
            return '<div class="ej-db-item" role="listitem" data-ej-id="' + ej.id + '">' +
                '<span class="ej-db-nombre">' + ej.nombre + '</span>' +
                '<span class="ej-db-musculo">' + ej.musculo + '</span>' +
            '</div>';
        }

        if (qLow) {
            lista.innerHTML = filtered.map(ejDbItem).join('');
        } else {
            var grupos = {};
            filtered.forEach(function(ej) {
                if (!grupos[ej.grupo]) grupos[ej.grupo] = [];
                grupos[ej.grupo].push(ej);
            });
            var html = '';
            Object.keys(grupos).forEach(function(g) {
                html += '<div class="ej-db-grupo">' + g + '</div>';
                html += grupos[g].map(ejDbItem).join('');
            });
            lista.innerHTML = html;
        }

        lista.querySelectorAll('.ej-db-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var ejId = item.dataset.ejId;
                var ejRef = EJ_DB.find(function(ej) { return ej.id === ejId; });
                if (!ejRef) return;
                plantilla.dias_detalle[diaActivo].ejercicios.push({
                    nombre:   ejRef.nombre,
                    musculo:  ejRef.musculo,
                    series:   3,
                    reps:     '10–12',
                    descanso: '60 s'
                });
                guardar();
                renderEjercicios();
                closeModal('searchOverlay');
                toast('"' + ejRef.nombre + '" agregado.', 'ok');
            });
        });
    }

    document.getElementById('ejSearch').addEventListener('input', function() {
        renderEjDb(this.value);
    });

    document.getElementById('searchClose').addEventListener('click', function() { closeModal('searchOverlay'); });
    document.getElementById('searchOverlay').addEventListener('click', function(e) { if (e.target === this) closeModal('searchOverlay'); });

    // ── Modal Editar Ejercicio ─────────────────────────────
    function openEditEj(idx) {
        editEjIdx = idx;
        var ej = plantilla.dias_detalle[diaActivo].ejercicios[idx];
        if (!ej) return;

        document.getElementById('editEjTitle').textContent  = 'Editar ejercicio';
        document.getElementById('editEjNombre').textContent = ej.nombre;
        document.getElementById('editEjMusculo').textContent = ej.musculo;
        document.getElementById('ejSeries').value   = ej.series;
        document.getElementById('ejReps').value     = ej.reps;
        document.getElementById('ejDescanso').value = ej.descanso;

        openModal('editEjOverlay');
        document.getElementById('ejSeries').focus();
    }

    document.getElementById('editEjSave').addEventListener('click', function() {
        if (editEjIdx === null) return;
        var ej = plantilla.dias_detalle[diaActivo].ejercicios[editEjIdx];
        if (!ej) return;
        var series = parseInt(document.getElementById('ejSeries').value, 10);
        ej.series   = isNaN(series) || series < 1 ? 1 : series;
        ej.reps     = document.getElementById('ejReps').value.trim()     || ej.reps;
        ej.descanso = document.getElementById('ejDescanso').value.trim() || ej.descanso;
        guardar();
        renderEjercicios();
        closeModal('editEjOverlay');
    });

    document.getElementById('editEjDelete').addEventListener('click', function() {
        if (editEjIdx === null) return;
        var nombre = plantilla.dias_detalle[diaActivo].ejercicios[editEjIdx].nombre;
        plantilla.dias_detalle[diaActivo].ejercicios.splice(editEjIdx, 1);
        editEjIdx = null;
        guardar();
        renderEjercicios();
        closeModal('editEjOverlay');
        toast('"' + nombre + '" eliminado.', 'warn');
    });

    document.getElementById('editEjClose').addEventListener('click',  function() { closeModal('editEjOverlay'); });
    document.getElementById('editEjCancel').addEventListener('click', function() { closeModal('editEjOverlay'); });
    document.getElementById('editEjOverlay').addEventListener('click', function(e) { if (e.target === this) closeModal('editEjOverlay'); });

    // ── Escape global ──────────────────────────────────────
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        ['configOverlay', 'searchOverlay', 'editEjOverlay'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el && el.classList.contains('open')) closeModal(id);
        });
    });

    // ── Inicialización ─────────────────────────────────────
    renderHeader();
    renderTabs();
    renderEjercicios();
}

// ── Biblioteca de ejercicios (biblioteca.html) ──────────────
function initBiblioteca() {
    var grid = document.getElementById('bibGrid');
    if (!grid) return;

    var PAT_LABELS = {
        'empuje':         'Empuje',
        'traccion':       'Tracción',
        'dom-rodilla':    'Dom. Rodilla',
        'core':           'Core',
        'dom-cadera':     'Dom. Cadera',
        'rehabilitacion': 'Rehabilitación'
    };

    var BASE_IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

    var EJERCICIOS_BASE = [
        // Empuje
        { id: 'b01', nombre: 'Press de banca plano',       patron: 'empuje',         musculo: 'Pecho · Tríceps · Hombro ant.',  descripcion: 'Ejercicio básico de empuje horizontal para el desarrollo del pecho.',        foto: BASE_IMG + 'Barbell_Bench_Press_-_Medium_Grip/0.jpg' },
        { id: 'b02', nombre: 'Press inclinado',             patron: 'empuje',         musculo: 'Pecho superior · Hombros',       descripcion: 'Variante inclinada que enfatiza la porción clavicular del pectoral.',        foto: BASE_IMG + 'Incline_Dumbbell_Press/0.jpg' },
        { id: 'b03', nombre: 'Press militar con barra',     patron: 'empuje',         musculo: 'Hombros · Tríceps',              descripcion: 'Ejercicio compuesto de empuje vertical para el desarrollo de hombros.',     foto: BASE_IMG + 'Barbell_Shoulder_Press/0.jpg' },
        { id: 'b04', nombre: 'Fondos en paralelas',         patron: 'empuje',         musculo: 'Pecho inferior · Tríceps',       descripcion: 'Ejercicio de peso corporal para pecho inferior y tríceps.',                 foto: BASE_IMG + 'Dips_-_Triceps_Version/0.jpg' },
        // Tracción
        { id: 'b05', nombre: 'Dominadas',                   patron: 'traccion',       musculo: 'Dorsal · Bíceps',                descripcion: 'Ejercicio de peso corporal fundamental para el desarrollo del dorsal.',     foto: BASE_IMG + 'Pullups/0.jpg' },
        { id: 'b06', nombre: 'Remo con barra',              patron: 'traccion',       musculo: 'Espalda media · Bíceps',         descripcion: 'Ejercicio de tracción horizontal para el desarrollo de la espalda media.',  foto: BASE_IMG + 'Barbell_Row/0.jpg' },
        { id: 'b07', nombre: 'Jalón al pecho',              patron: 'traccion',       musculo: 'Dorsal · Bíceps',                descripcion: 'Jalón en polea para trabajar el dorsal ancho y los bíceps.',                foto: BASE_IMG + 'Pulldown/0.jpg' },
        { id: 'b08', nombre: 'Face pull',                   patron: 'traccion',       musculo: 'Deltoides post. · Manguito',     descripcion: 'Ejercicio correctivo para los rotadores externos y el deltoides posterior.', foto: BASE_IMG + 'Face_Pull/0.jpg' },
        // Dominante Rodilla
        { id: 'b09', nombre: 'Sentadilla con barra',        patron: 'dom-rodilla',    musculo: 'Cuádriceps · Glúteos · Core',    descripcion: 'El ejercicio rey del tren inferior. Alta demanda sobre cuádriceps y glúteos.', foto: BASE_IMG + 'Barbell_Full_Squat/0.jpg' },
        { id: 'b10', nombre: 'Prensa de piernas',           patron: 'dom-rodilla',    musculo: 'Cuádriceps · Glúteos',           descripcion: 'Variante en máquina con menor demanda sobre la columna.',                   foto: BASE_IMG + 'Leg_Press/0.jpg' },
        { id: 'b11', nombre: 'Zancadas',                    patron: 'dom-rodilla',    musculo: 'Cuádriceps · Glúteos',           descripcion: 'Ejercicio unilateral para piernas que mejora equilibrio y simetría.',       foto: BASE_IMG + 'Dumbbell_Lunge/0.jpg' },
        { id: 'b12', nombre: 'Extensión de cuádriceps',     patron: 'dom-rodilla',    musculo: 'Cuádriceps · Aislamiento',       descripcion: 'Ejercicio de aislamiento para los cuádriceps en máquina.',                  foto: BASE_IMG + 'Leg_Extensions/0.jpg' },
        // Core
        { id: 'b13', nombre: 'Plancha abdominal',           patron: 'core',           musculo: 'Core · Transverso',              descripcion: 'Ejercicio isométrico de core para la estabilización lumbo-pélvica.',       foto: BASE_IMG + 'Plank/0.jpg' },
        { id: 'b14', nombre: 'Dead bug',                    patron: 'core',           musculo: 'Core profundo · Transverso',     descripcion: 'Ejercicio de core con disociación de extremidades. Ideal para rehab.',      foto: BASE_IMG + 'Dead_Bug/0.jpg' },
        { id: 'b15', nombre: 'Mountain climbers',           patron: 'core',           musculo: 'Core · Cardio',                  descripcion: 'Ejercicio dinámico de core con componente cardiovascular.',                  foto: BASE_IMG + 'Mountain_Climbers/0.jpg' },
        { id: 'b16', nombre: 'Bird dog',                    patron: 'core',           musculo: 'Core · Glúteos · Espalda',       descripcion: 'Ejercicio de estabilización lumbar y activación glútea.',                   foto: BASE_IMG + 'Bird_Dog/0.jpg' },
        // Dominante Cadera
        { id: 'b17', nombre: 'Peso muerto rumano',          patron: 'dom-cadera',     musculo: 'Isquiotibiales · Glúteos',       descripcion: 'Ejercicio de bisagra de cadera con énfasis en isquiotibiales.',             foto: BASE_IMG + 'Romanian_Deadlift/0.jpg' },
        { id: 'b18', nombre: 'Hip thrust con barra',        patron: 'dom-cadera',     musculo: 'Glúteos · Core',                 descripcion: 'El ejercicio más eficaz para la activación máxima del glúteo mayor.',       foto: BASE_IMG + 'Barbell_Hip_Thrust/0.jpg' },
        { id: 'b19', nombre: 'Peso muerto convencional',    patron: 'dom-cadera',     musculo: 'Cadena posterior · Core',        descripcion: 'Ejercicio fundamental que involucra toda la cadena posterior.',             foto: BASE_IMG + 'Barbell_Deadlift/0.jpg' },
        { id: 'b20', nombre: 'Curl de isquiotibiales',      patron: 'dom-cadera',     musculo: 'Isquiotibiales',                 descripcion: 'Ejercicio de aislamiento para isquiotibiales en máquina.',                  foto: BASE_IMG + 'Lying_Leg_Curls/0.jpg' },
        // Rehabilitación
        { id: 'b21', nombre: 'Puente de glúteos',           patron: 'rehabilitacion', musculo: 'Glúteos · Isquiotibiales',       descripcion: 'Ejercicio básico de activación glútea, ideal para principiantes y rehab.',  foto: BASE_IMG + 'Glute_Bridge/0.jpg' },
        { id: 'b22', nombre: 'Cat-Cow',                     patron: 'rehabilitacion', musculo: 'Movilidad lumbar',               descripcion: 'Ejercicio de movilidad para la columna vertebral. Alivia tensión lumbar.',  foto: BASE_IMG + 'Cat_Stretch/0.jpg' },
        { id: 'b23', nombre: 'Plancha lateral',             patron: 'rehabilitacion', musculo: 'Core lateral · Cuadrado lumb.', descripcion: 'Ejercicio isométrico para la estabilización lateral del core.',              foto: BASE_IMG + 'Side_Bridge/0.jpg' },
        { id: 'b24', nombre: 'McGill curl-up',              patron: 'rehabilitacion', musculo: 'Core anterior',                  descripcion: 'Variante del curl-up de bajo estrés discal lumbar, propuesta por McGill.',  foto: BASE_IMG + 'Lying_Crunch/0.jpg' }
    ];

    // ── Estado ──────────────────────────────────────────────
    var ejercicios  = EJERCICIOS_BASE.map(function(e) { return JSON.parse(JSON.stringify(e)); });
    var filtroPatron = '';
    var filtroBusq  = '';
    var editId      = null;

    // ── Helpers ─────────────────────────────────────────────
    function uid() { return 'b-' + Date.now() + '-' + Math.floor(Math.random() * 1000); }

    function showToast(msg, tipo) { _toast('bibToast', 'bib-toast', msg, tipo); }

    function openOverlay() {
        var el = document.getElementById('bibEditOverlay');
        if (!el) return;
        el.classList.add('open');
        el.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay() {
        var el = document.getElementById('bibEditOverlay');
        if (!el) return;
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // ── Render grid ──────────────────────────────────────────
    function render() {
        var lista = ejercicios.filter(function(ej) {
            var okPat = !filtroPatron || ej.patron === filtroPatron;
            var q     = filtroBusq.toLowerCase().trim();
            var okQ   = !q || ej.nombre.toLowerCase().includes(q) || ej.musculo.toLowerCase().includes(q);
            return okPat && okQ;
        });

        var sub = document.getElementById('bibSub');
        if (sub) sub.textContent = ejercicios.length + ' ejercicio' + (ejercicios.length !== 1 ? 's' : '');

        var empty = document.getElementById('bibEmpty');
        if (empty) empty.hidden = lista.length > 0;

        grid.innerHTML = lista.map(renderCard).join('');

        grid.querySelectorAll('.bib-btn-editar').forEach(function(btn) {
            btn.addEventListener('click', function() { openEdit(btn.dataset.id); });
        });
    }

    function renderCard(ej) {
        var patLabel = PAT_LABELS[ej.patron] || ej.patron;
        var sNombre  = escapeHtml(ej.nombre);
        var sMusculo = escapeHtml(ej.musculo);
        var sFoto    = escapeHtml(ej.foto || '');
        return '<article class="bib-card" role="listitem">' +
            '<div class="bib-card-img" id="img-' + ej.id + '">' +
                '<img src="' + sFoto + '" alt="' + sNombre + '" ' +
                    'onerror="document.getElementById(\'img-' + ej.id + '\').classList.add(\'bib-img-err\')">' +
                '<span class="bib-pat-badge pat-' + ej.patron + '">' + patLabel + '</span>' +
            '</div>' +
            '<div class="bib-card-body">' +
                '<p class="bib-card-nombre">' + sNombre + '</p>' +
                '<p class="bib-card-musculo">' + sMusculo + '</p>' +
            '</div>' +
            '<div class="bib-card-footer">' +
                '<button class="bib-action-btn bib-btn-editar" data-id="' + ej.id + '" aria-label="Editar ' + sNombre + '">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
                    'Editar ejercicio' +
                '</button>' +
            '</div>' +
        '</article>';
    }

    // ── Modal nuevo / editar ─────────────────────────────────
    function openEdit(id) {
        editId = id || null;
        var ej = id ? ejercicios.find(function(e) { return e.id === id; }) : null;

        document.getElementById('bibEditTitle').textContent = ej ? 'Editar ejercicio' : 'Nuevo ejercicio';
        document.getElementById('bibFNombre').value   = ej ? ej.nombre      : '';
        document.getElementById('bibFPatron').value   = ej ? ej.patron      : 'empuje';
        document.getElementById('bibFMusculo').value  = ej ? ej.musculo     : '';
        document.getElementById('bibFFoto').value     = ej ? ej.foto        : '';
        document.getElementById('bibFDesc').value     = ej ? ej.descripcion : '';

        document.getElementById('bibFNombre').classList.remove('invalid');
        document.getElementById('bibFNombreError').classList.remove('visible');

        var delBtn = document.getElementById('bibEditDelete');
        if (delBtn) delBtn.hidden = !ej;

        openOverlay();
        document.getElementById('bibFNombre').focus();
    }

    document.getElementById('bibEditForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var nombre = document.getElementById('bibFNombre').value.trim();
        if (!nombre) {
            document.getElementById('bibFNombre').classList.add('invalid');
            document.getElementById('bibFNombreError').classList.add('visible');
            document.getElementById('bibFNombre').focus();
            return;
        }

        var datos = {
            nombre:      nombre,
            patron:      document.getElementById('bibFPatron').value,
            musculo:     document.getElementById('bibFMusculo').value.trim() || 'Sin especificar',
            foto:        document.getElementById('bibFFoto').value.trim() || '',
            descripcion: document.getElementById('bibFDesc').value.trim() || ''
        };

        if (editId) {
            var idx = ejercicios.findIndex(function(e) { return e.id === editId; });
            if (idx !== -1) ejercicios[idx] = Object.assign({}, ejercicios[idx], datos);
            showToast('Ejercicio actualizado.', 'ok');
        } else {
            ejercicios.push(Object.assign({ id: uid() }, datos));
            showToast('Ejercicio creado.', 'ok');
        }

        closeOverlay();
        render();
    });

    document.getElementById('bibEditDelete').addEventListener('click', function() {
        if (!editId) return;
        var ej = ejercicios.find(function(e) { return e.id === editId; });
        ejercicios = ejercicios.filter(function(e) { return e.id !== editId; });
        closeOverlay();
        render();
        showToast((ej ? '"' + ej.nombre + '"' : 'Ejercicio') + ' eliminado.', 'warn');
    });

    document.getElementById('bibEditClose').addEventListener('click',  closeOverlay);
    document.getElementById('bibEditCancel').addEventListener('click', closeOverlay);
    document.getElementById('bibEditOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeOverlay();
    });

    // ── Filtros ──────────────────────────────────────────────
    document.querySelectorAll('.bib-pill').forEach(function(btn) {
        btn.addEventListener('click', function() {
            filtroPatron = btn.dataset.patron;
            document.querySelectorAll('.bib-pill').forEach(function(b) {
                b.classList.toggle('bib-pill--active', b === btn);
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            render();
        });
    });

    var bibSearch = document.getElementById('bibSearch');
    if (bibSearch) {
        bibSearch.addEventListener('input', function() {
            filtroBusq = bibSearch.value;
            render();
        });
    }

    // ── Botón nuevo ejercicio ────────────────────────────────
    var btnNuevo = document.getElementById('btnNuevoEjercicio');
    if (btnNuevo) btnNuevo.addEventListener('click', function() { openEdit(null); });

    // ── Escape global ────────────────────────────────────────
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        var overlay = document.getElementById('bibEditOverlay');
        if (overlay && overlay.classList.contains('open')) closeOverlay();
    });

    // ── Render inicial ───────────────────────────────────────
    render();
}

// ── Evaluación FMS + Handgrip (evaluacion.html) ─────────────
function initEvaluacion() {
    if (!document.getElementById('fmsTable')) return;

    var FMS = [
        { id: 'ds',   bilateral: false, clearing: false },
        { id: 'hs',   bilateral: true,  clearing: false },
        { id: 'il',   bilateral: true,  clearing: false },
        { id: 'sm',   bilateral: true,  clearing: true  },
        { id: 'aslr', bilateral: true,  clearing: false },
        { id: 'tsp',  bilateral: false, clearing: true  },
        { id: 'rs',   bilateral: true,  clearing: true  }
    ];

    var CHIP_CLASSES = ['ev-chip--zero', 'ev-chip--one', 'ev-chip--two', 'ev-chip--three'];

    var scores = {};
    FMS.forEach(function(t) { scores[t.id] = { d: null, i: null, cl: 'none' }; });

    // Fecha de hoy
    var sub = document.getElementById('evFechaHoy');
    if (sub) {
        sub.textContent = new Date().toLocaleDateString('es-AR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Toast
    function toast(msg, tipo) { _toast('evToast', 'ev-toast', msg, tipo, 3200); }

    // Calcular puntaje de un test
    function getTestScore(testId) {
        var cfg = FMS.find(function(t) { return t.id === testId; });
        var s   = scores[testId];
        if (!cfg) return null;
        if (cfg.clearing && s.cl === '+') return 0;
        if (cfg.bilateral) {
            if (s.d === null || s.i === null) return null;
            return Math.min(s.d, s.i);
        }
        return s.d;
    }

    // Actualizar celda de puntaje de un test
    function updateTestScore(testId) {
        var val = getTestScore(testId);
        var el  = document.getElementById('fms-s-' + testId);
        if (!el) return;
        if (val === null) {
            el.textContent = '—';
            el.className = 'ev-score-val';
        } else {
            el.textContent = val;
            el.className = 'ev-score-val ev-score-' + val;
        }
        updateTotal();
    }

    // Actualizar total FMS
    function updateTotal() {
        var total = 0;
        var complete = true;
        FMS.forEach(function(t) {
            var val = getTestScore(t.id);
            if (val === null) complete = false;
            else total += val;
        });

        var totalCell = document.getElementById('fmsTotalCell');
        if (totalCell) {
            if (!complete) {
                totalCell.innerHTML = '—<span class="ev-fms-total-max">/21</span>';
                totalCell.className = 'ev-td-score ev-fms-total-cell';
            } else {
                var cat = total >= 14 ? 'green' : total >= 10 ? 'yellow' : 'red';
                totalCell.innerHTML = total + '<span class="ev-fms-total-max">/21</span>';
                totalCell.className = 'ev-td-score ev-fms-total-cell ev-total-' + cat;
            }
        }

        var badge    = document.getElementById('evFmsBadge');
        var badgeVal = document.getElementById('fmsTotalVal');
        if (badge && badgeVal) {
            if (!complete) {
                badgeVal.textContent = '—';
                badge.className = 'ev-fms-badge';
            } else {
                badgeVal.textContent = total;
                var badgeCat = total >= 14 ? 'green' : total >= 10 ? 'yellow' : 'red';
                badge.className = 'ev-fms-badge ev-fms-badge--' + badgeCat;
            }
        }
    }

    // Botones de objetivo
    var objGroup = document.getElementById('evObjetivoGroup');
    var objHidden = document.getElementById('evObjetivo');
    if (objGroup) {
        objGroup.querySelectorAll('.ev-obj-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var isActive = btn.classList.contains('ev-obj-btn--active');
                objGroup.querySelectorAll('.ev-obj-btn').forEach(function(b) {
                    b.classList.remove('ev-obj-btn--active');
                });
                if (!isActive) {
                    btn.classList.add('ev-obj-btn--active');
                    if (objHidden) objHidden.value = btn.dataset.val;
                } else {
                    if (objHidden) objHidden.value = '';
                }
            });
        });
    }

    function setObjetivo(val) {
        if (!objGroup) return;
        objGroup.querySelectorAll('.ev-obj-btn').forEach(function(b) {
            b.classList.toggle('ev-obj-btn--active', b.dataset.val === val);
        });
        if (objHidden) objHidden.value = val || '';
    }

    // Chips de puntaje
    document.querySelectorAll('.ev-chip-group').forEach(function(group) {
        group.addEventListener('click', function(e) {
            var chip = e.target.closest('.ev-chip');
            if (!chip) return;
            var testId   = group.dataset.test;
            var side     = group.dataset.side;
            var val      = parseInt(chip.dataset.val, 10);
            var wasActive = chip.classList.contains('ev-chip--active');

            group.querySelectorAll('.ev-chip').forEach(function(c) {
                c.classList.remove('ev-chip--active');
                CHIP_CLASSES.forEach(function(cls) { c.classList.remove(cls); });
            });

            if (!wasActive) {
                chip.classList.add('ev-chip--active', CHIP_CLASSES[val]);
                scores[testId][side] = val;
            } else {
                scores[testId][side] = null;
            }
            updateTestScore(testId);
        });
    });

    // Clearing test toggle
    document.querySelectorAll('.ev-cl-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var testId = btn.dataset.test;
            if (btn.dataset.state === 'none') {
                btn.dataset.state = '+';
                btn.textContent   = '+';
                btn.className     = 'ev-cl-btn ev-cl-btn--pos';
                btn.setAttribute('aria-label', 'Clearing POSITIVO — puntaje = 0');
                scores[testId].cl = '+';
            } else {
                btn.dataset.state = 'none';
                btn.textContent   = '—';
                btn.className     = 'ev-cl-btn';
                btn.setAttribute('aria-label', 'Clearing test — sin evaluar');
                scores[testId].cl = 'none';
            }
            updateTestScore(testId);
        });
    });


    // Modal cargar alumno
    function openCargar() {
        var overlay = document.getElementById('evCargarOverlay');
        if (!overlay) return;
        var search = document.getElementById('evCargarSearch');
        if (search) search.value = '';
        renderAlumnoList('');
        overlay.classList.add('open');
        overlay.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
        if (search) search.focus();
    }

    function closeCargar() {
        var overlay = document.getElementById('evCargarOverlay');
        if (!overlay) return;
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function renderAlumnoList(q) {
        var lista = document.getElementById('evAlumnoList');
        if (!lista) return;
        var filtrados = ALUMNOS_DATA.filter(function(a) {
            return !q || a.nombre.toLowerCase().includes(q.toLowerCase());
        });
        if (!filtrados.length) {
            lista.innerHTML = '<li style="padding:16px 12px;color:rgba(255,255,255,0.3);font-size:0.84rem;text-align:center;">Sin resultados.</li>';
            return;
        }
        lista.innerHTML = filtrados.map(function(a) {
            var ini = escapeHtml(a.nombre.split(' ').map(function(p) { return p[0] || ''; }).join('').slice(0, 2).toUpperCase());
            return '<li class="ev-alumno-item" data-key="' + a.key + '" tabindex="0" role="option">' +
                '<div class="ev-alumno-av">' + ini + '</div>' +
                '<div class="ev-alumno-info">' +
                    '<p class="ev-alumno-nombre">' + escapeHtml(a.nombre) + '</p>' +
                    '<p class="ev-alumno-obj">' + escapeHtml(a.objetivo) + '</p>' +
                '</div></li>';
        }).join('');

        lista.querySelectorAll('.ev-alumno-item').forEach(function(item) {
            function sel() {
                var alumno = ALUMNOS_DATA.find(function(a) { return a.key === item.dataset.key; });
                if (!alumno) return;
                var n = document.getElementById('evNombre');
                var c = document.getElementById('evContacto');
                if (n) n.value = alumno.nombre;
                if (c) c.value = alumno.contacto || '';
                setObjetivo(alumno.objetivo || '');
                closeCargar();
                toast('Alumno "' + alumno.nombre + '" cargado.', 'ok');
            }
            item.addEventListener('click', sel);
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(); }
            });
        });
    }

    ['btnCargarAlumno', 'btnCargarAlumno2'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', openCargar);
    });

    var cargarClose = document.getElementById('evCargarClose');
    if (cargarClose) cargarClose.addEventListener('click', closeCargar);

    var cargarOverlay = document.getElementById('evCargarOverlay');
    if (cargarOverlay) cargarOverlay.addEventListener('click', function(e) {
        if (e.target === this) closeCargar();
    });

    var cargarSearch = document.getElementById('evCargarSearch');
    if (cargarSearch) cargarSearch.addEventListener('input', function() { renderAlumnoList(this.value.trim()); });


    // Guardar ficha
    var btnGuardar = document.getElementById('btnGuardar');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', function() {
            var nEl   = document.getElementById('evNombre');
            var nombre = nEl ? nEl.value.trim() : '';
            if (!nombre) {
                toast('Completá el nombre del alumno antes de guardar.', 'warn');
                if (nEl) nEl.focus();
                return;
            }
            toast('Ficha de ' + nombre + ' guardada correctamente.', 'ok');
        });
    }

    // Escape global
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        var overlay = document.getElementById('evCargarOverlay');
        if (overlay && overlay.classList.contains('open')) closeCargar();
    });
}

// ── Lista de alumnos (alumnos.html) ─────────────────────────
function initAlumnos() {
    var tbody = document.getElementById('alBody');
    if (!tbody) return;

    var PAGO_LABELS = { activo: 'Al día', pendiente: 'Pendiente', inactivo: 'Inactivo' };
    var PAGO_BADGES = { activo: 'badge-activo', pendiente: 'badge-pendiente', inactivo: 'badge-inactivo' };

    var filtroPago = '';
    var filtroBusq = '';

    // ── Toast ────────────────────────────────────────────────
    function toast(msg, tipo) { _toast('alToast', 'al-toast', msg, tipo); }

    // ── Render tabla ─────────────────────────────────────────
    function render() {
        var lista = ALUMNOS_DATA.filter(function(a) {
            var okPago = !filtroPago || a.pago === filtroPago;
            var q      = filtroBusq.toLowerCase().trim();
            var okQ    = !q || a.nombre.toLowerCase().includes(q) || a.rutinaLabel.toLowerCase().includes(q);
            return okPago && okQ;
        });

        var sub = document.getElementById('alSub');
        if (sub) sub.textContent = ALUMNOS_DATA.length + ' alumno' + (ALUMNOS_DATA.length !== 1 ? 's' : '') + ' registrados';

        var empty = document.getElementById('alEmpty');
        if (empty) empty.hidden = lista.length > 0;

        tbody.innerHTML = lista.map(function(a) {
            var sNombre = escapeHtml(a.nombre);
            return '<tr>' +
                '<td>' +
                    '<div class="alumno-nombre">' +
                        '<div class="alumno-avatar">' + escapeHtml(a.iniciales) + '</div>' +
                        sNombre +
                    '</div>' +
                '</td>' +
                '<td>' + escapeHtml(a.rutinaLabel) + '</td>' +
                '<td><span class="badge ' + PAGO_BADGES[a.pago] + '">' + PAGO_LABELS[a.pago] + '</span></td>' +
                '<td>' +
                    '<button class="al-ver-perfil" data-key="' + a.key + '" aria-label="Ver perfil de ' + sNombre + '">' +
                        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z"/></svg>' +
                        'Ver perfil' +
                    '</button>' +
                '</td>' +
            '</tr>';
        }).join('');

        tbody.querySelectorAll('.al-ver-perfil').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var alumno = ALUMNOS_DATA.find(function(a) { return a.key === btn.dataset.key; });
                if (alumno) openDrawer(alumno);
            });
        });
    }

    // ── Drawer ───────────────────────────────────────────────
    function openDrawer(a) {
        var drawer  = document.getElementById('alDrawer');
        var overlay = document.getElementById('alDrawerOverlay');
        if (!drawer || !overlay) return;

        // Rellenar datos
        document.getElementById('drAv').textContent      = a.iniciales;
        document.getElementById('drNombre').textContent  = a.nombre;
        document.getElementById('drContacto').textContent = a.contacto || '—';
        document.getElementById('drObjetivo').textContent = a.objetivo || '—';
        document.getElementById('drLesion').textContent  = a.lesion || '—';
        document.getElementById('drRutina').textContent  = a.rutinaLabel || '—';

        // Badge de pago en el hero
        var badgesEl = document.getElementById('drBadges');
        badgesEl.innerHTML = '<span class="badge ' + PAGO_BADGES[a.pago] + '">' + PAGO_LABELS[a.pago] + '</span>';

        // Evaluación
        var ev = a.eval;
        var fmsEl = document.getElementById('drFms');
        var fmsCat = ev.fms >= 14 ? 'al-fms-green' : ev.fms >= 10 ? 'al-fms-yellow' : 'al-fms-red';
        fmsEl.textContent = ev.fms + '/21';
        fmsEl.className   = 'al-eval-val ' + fmsCat;

        document.getElementById('drPeso').textContent  = ev.peso + ' kg';
        document.getElementById('drHandR').textContent = ev.handgrip_d + ' kg';
        document.getElementById('drHandL').textContent = ev.handgrip_i + ' kg';

        // Abrir
        overlay.classList.add('open');
        drawer.classList.add('open');
        drawer.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
        document.getElementById('alDrawerClose').focus();
    }

    function closeDrawer() {
        var drawer  = document.getElementById('alDrawer');
        var overlay = document.getElementById('alDrawerOverlay');
        if (!drawer || !overlay) return;
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.getElementById('alDrawerClose').addEventListener('click', closeDrawer);
    document.getElementById('alDrawerOverlay').addEventListener('click', closeDrawer);

    // ── Filtros ──────────────────────────────────────────────
    document.querySelectorAll('.al-pill').forEach(function(btn) {
        btn.addEventListener('click', function() {
            filtroPago = btn.dataset.pago;
            document.querySelectorAll('.al-pill').forEach(function(b) {
                b.classList.toggle('al-pill--active', b === btn);
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            render();
        });
    });

    var alSearch = document.getElementById('alSearch');
    if (alSearch) alSearch.addEventListener('input', function() {
        filtroBusq = alSearch.value;
        render();
    });

    // ── Nuevo alumno (placeholder) ───────────────────────────
    var btnNuevo = document.getElementById('btnNuevoAlumno');
    if (btnNuevo) btnNuevo.addEventListener('click', function() {
        toast('Alta de alumnos — próximamente disponible.', 'info');
    });

    // ── Escape global ────────────────────────────────────────
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var drawer = document.getElementById('alDrawer');
            if (drawer && drawer.classList.contains('open')) closeDrawer();
        }
    });

    render();
}
