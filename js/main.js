/* ============================================
   Centro Cambiario Tara - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initDate();
    initExchangeRates();
    initScrollReveal();
    initCounters();
    initContactForm();
    initCareersForm();
    initParticles();
    initSmoothScroll();
});

/* --- Navbar Scroll Effect --- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Active link highlight
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.navbar__link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 150;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    menu.querySelectorAll('.navbar__link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* --- Date Display --- */
function initDate() {
    const dateEl = document.getElementById('currentDate');
    const yearEl = document.getElementById('year');
    const now = new Date();

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('es-MX', options);
    }
    if (yearEl) {
        yearEl.textContent = now.getFullYear();
    }
}

/* --- Exchange Rates API --- */
// Rates in MXN (1 foreign unit = X MXN), updated by API
const exchangeRates = {
    USD: null,
    EUR: null,
    CAD: null
};

async function initExchangeRates() {
    const API_URL = 'https://open.er-api.com/v6/latest/USD';

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.result !== 'success') throw new Error('API response error');

        const mxn = data.rates.MXN;
        const eur = data.rates.EUR;
        const cad = data.rates.CAD;

        exchangeRates.USD = mxn;
        exchangeRates.EUR = mxn / eur;
        exchangeRates.CAD = mxn / cad;

        // Update rates card
        updateRateEl('usdRate', exchangeRates.USD);
        updateRateEl('eurRate', exchangeRates.EUR);
        updateRateEl('cadRate', exchangeRates.CAD);

        // Show last update time
        const updateEl = document.getElementById('ratesUpdate');
        if (updateEl) {
            const date = new Date(data.time_last_update_utc);
            updateEl.textContent = 'Actualizado: ' + date.toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        }
    } catch (err) {
        console.error('Error al obtener tipos de cambio:', err);
        // Fallback values
        exchangeRates.USD = 20.00;
        exchangeRates.EUR = 21.80;
        exchangeRates.CAD = 14.50;

        updateRateEl('usdRate', exchangeRates.USD);
        updateRateEl('eurRate', exchangeRates.EUR);
        updateRateEl('cadRate', exchangeRates.CAD);

        const updateEl = document.getElementById('ratesUpdate');
        if (updateEl) {
            updateEl.textContent = 'No se pudo actualizar. Mostrando valores aproximados.';
        }
    }

    // Initialize calculator after rates are loaded
    initCalculator();
}

function updateRateEl(id, rate) {
    const el = document.getElementById(id);
    if (el) el.textContent = '$' + rate.toFixed(2);
}

/* --- Currency Calculator --- */
function initCalculator() {
    const fromInput = document.getElementById('calcFrom');
    const toInput = document.getElementById('calcTo');
    const fromCurrency = document.getElementById('calcFromCurrency');
    const toCurrency = document.getElementById('calcToCurrency');
    const swapBtn = document.getElementById('calcSwap');
    const rateDisplay = document.getElementById('calcRate');

    // Rates: 1 unit of currency = X MXN (interbancario)
    function getRateMXN(currency) {
        if (currency === 'MXN') return 1;
        return exchangeRates[currency] || 1;
    }

    function calculate() {
        const amount = parseFloat(fromInput.value) || 0;
        const from = fromCurrency.value;
        const to = toCurrency.value;

        let result;
        let rateText;

        if (from === to) {
            result = amount;
            rateText = '1 ' + from + ' = 1 ' + to;
        } else {
            // Convert: from → MXN → to
            const fromToMXN = getRateMXN(from);
            const toToMXN = getRateMXN(to);
            const rate = fromToMXN / toToMXN;
            result = amount * rate;

            if (to === 'MXN') {
                rateText = '1 ' + from + ' = $' + fromToMXN.toFixed(2) + ' MXN';
            } else if (from === 'MXN') {
                rateText = '1 ' + to + ' = $' + toToMXN.toFixed(2) + ' MXN';
            } else {
                rateText = '1 ' + from + ' = ' + rate.toFixed(4) + ' ' + to;
            }
        }

        toInput.value = result.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        if (rateDisplay) {
            rateDisplay.textContent = rateText + ' (interbancario)';
        }
    }

    fromInput.addEventListener('input', calculate);
    fromCurrency.addEventListener('change', calculate);
    toCurrency.addEventListener('change', calculate);

    swapBtn.addEventListener('click', () => {
        const tempCurrency = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = tempCurrency;
        calculate();
    });

    calculate();
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
    const elements = document.querySelectorAll(
        '.service-card, .currency-chip, .branch-card, .contact-item, .value-item, .valor-card, .stat, .about__card, .about__mv-card, .calculator__card, .contact__form-wrapper, .careers__content, .careers__form-wrapper, .section-header'
    );

    elements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* --- Animated Counters --- */
function initCounters() {
    const counters = document.querySelectorAll('.stat__number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        const current = Math.floor(eased * target);
        element.textContent = current.toLocaleString('es-MX');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString('es-MX');
        }
    }

    requestAnimationFrame(update);
}

/* --- Contact Form --- */
function initContactForm() {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            Mensaje enviado
        `;
        btn.style.background = '#22c55e';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
            form.reset();
        }, 3000);
    });
}

/* --- Careers Form --- */
function initCareersForm() {
    const form = document.getElementById('careersForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            Solicitud enviada
        `;
        btn.style.background = '#22c55e';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
            form.reset();
        }, 3000);
    });
}

/* --- Background Particles --- */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 4 + 2;

        Object.assign(particle.style, {
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `particleFloat ${Math.random() * 15 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
        });

        container.appendChild(particle);
    }

    // Add the animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            25% { transform: translate(${rand()}px, ${rand()}px) scale(1.2); opacity: 0.6; }
            50% { transform: translate(${rand()}px, ${rand()}px) scale(0.8); opacity: 0.2; }
            75% { transform: translate(${rand()}px, ${rand()}px) scale(1.1); opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
}

function rand() {
    return Math.floor(Math.random() * 80 - 40);
}

/* --- Smooth Scroll --- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}
