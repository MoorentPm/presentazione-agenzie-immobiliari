/* ================================================================
   MoorentPm — Presentazione Agenzie Immobiliari
   Main Script
   ================================================================ */

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function () { timeout = null; if (!immediate) func.apply(context, args); };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function isChartAvailable() { return typeof Chart !== 'undefined'; }

/* --- Grafici --- */
function initFinancialChartPadova() {
    if (!isChartAvailable() || document.getElementById('financialChartPadova')?.chartInstance) return;
    const ctx = document.getElementById('financialChartPadova')?.getContext('2d');
    if (!ctx) return;

    const padovaData = {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
        guadagni: [600, 700, 1000, 1500, 1800, 2200, 2300, 2500, 1700, 1200, 300, 500]
    };
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: padovaData.labels,
            datasets: [{
                label: 'Guadagni Possibili (€)',
                data: padovaData.guadagni,
                borderColor: '#e4c8c0',
                backgroundColor: 'rgba(243, 223, 217, 0.35)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#e4c8c0',
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#e4c8c0',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Guadagni Possibili (€)' },
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    ticks: { stepSize: 500 }
                },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: { label: (ctx) => `Guadagno: €${ctx.parsed.y}` }
                }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            animation: { duration: 1500, easing: 'easeOutExpo' }
        }
    });
    document.getElementById('financialChartPadova').chartInstance = chart;
}

/* --- Inizializzazione --- */
document.addEventListener('DOMContentLoaded', () => {

    /* Scroll: navbar hide/show + progress bar */
    const mainNav = document.getElementById('main-nav');
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    const navHeight = mainNav ? mainNav.offsetHeight : 65;
    document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
    let lastScrollTop = 0;

    const handleScroll = () => {
        if (document.body.classList.contains('mobile-menu-open')) return;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > navHeight) {
            mainNav.classList.add('nav-hidden');
        } else {
            mainNav.classList.remove('nav-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

        if (scrollProgressBar) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const pct = total > 0 ? (scrollTop / total) * 100 : 0;
            scrollProgressBar.style.width = `${pct}%`;
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    /* Animate on scroll */
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));

    /* Charts lazy load */
    const chartObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.chartInstance) {
                if (entry.target.id === 'financialChartPadova') initFinancialChartPadova();
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    document.querySelectorAll('canvas[id]').forEach(c => chartObserver.observe(c));

    /* Active nav link tracking */
    const navLinks = document.querySelectorAll('.desktop-nav a');
    const sections = document.querySelectorAll('section[id]');
    const updateActiveNavLink = debounce(() => {
        let currentSectionId = '';
        const ref = window.pageYOffset + navHeight + window.innerHeight * 0.4;
        sections.forEach(section => { if (ref >= section.offsetTop) currentSectionId = section.id; });
        if (window.pageYOffset < (sections[0]?.offsetTop ?? 0) - navHeight * 2) currentSectionId = 'hero';
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
        });
    }, 100);
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();

    /* Mobile menu */
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');

    function openMobileMenu() {
        mobileMenu?.classList.add('open');
        mobileOverlay?.classList.add('visible');
        document.body.classList.add('mobile-menu-open');
    }
    function closeMobileMenu() {
        mobileMenu?.classList.remove('open');
        mobileOverlay?.classList.remove('visible');
        document.body.classList.remove('mobile-menu-open');
    }

    mobileMenuButton?.addEventListener('click', openMobileMenu);
    closeMobileMenuButton?.addEventListener('click', closeMobileMenu);
    mobileOverlay?.addEventListener('click', closeMobileMenu);
    document.querySelectorAll('.nav-link-mobile').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    /* Service tabs */
    const serviceTabButtons = document.querySelectorAll('.service-tab-button');
    const serviceTabContents = document.querySelectorAll('.service-content');
    serviceTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            serviceTabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            serviceTabContents.forEach(content => {
                content.classList.toggle('active', content.id === targetId);
            });
        });
    });

    /* Toggle pacchetto attivazione */
    const packageToggleBtn = document.getElementById('packageToggleBtn');
    const packageContent = document.getElementById('packageContent');
    if (packageToggleBtn && packageContent) {
        packageToggleBtn.addEventListener('click', () => {
            packageToggleBtn.classList.toggle('active');
            packageContent.classList.toggle('active');
        });
    }
});
