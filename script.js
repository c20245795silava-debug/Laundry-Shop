gsap.registerPlugin(ScrollTrigger);

// ---- B1: DARK MODE TOGGLE ----
const root = document.documentElement;
const toggle = document.getElementById('darkModeToggle');

try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
    }
} catch (e) { /* storage unavailable: ignore */ }

function syncToggle() {
    const isDark = root.classList.contains('dark');
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.textContent = isDark ? 'Light Mode' : ' Dark Mode';
}
syncToggle();

toggle.addEventListener('click', () => {
    root.classList.toggle('dark');
    try { localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light'); } catch (e) { }
    syncToggle();
});

// ---- E3: everything animated lives inside matchMedia ----
let introTl = null;
const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {

    // ---- D1 + D2: PAGE-LOAD INTRO TIMELINE (about 2.2s) ----
    introTl = gsap.timeline({ defaults: { duration: 0.7, ease: 'power3.out' } });
    introTl
        // power3.out: a quick start that settles softly, so the nav feels like it glides into place
        .from('header nav', { y: -60, opacity: 0 })
        // back.out: a small overshoot gives the headline a friendly bounce, staggered per element
        .from('.hero-item', { y: 40, opacity: 0, stagger: 0.15, ease: 'back.out(1.4)' }, '-=0.4');

    // ---- E1: SCROLL REVEALS (one ScrollTrigger per .reveal; fills in going down, out going up) ----
    gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
    });

    // Cards fade in and out in staggered batches
    gsap.set('.card', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.card', {
        start: 'top 90%',
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, stagger: 0.12, duration: 0.6, ease: 'power2.out', overwrite: true }),
        onLeaveBack: (b) => gsap.to(b, { opacity: 0, y: 40, duration: 0.4, overwrite: true })
    });

    // ---- FILL IN / OUT: headings fill with the accent color as you scroll, and empty again on the way up ----
    gsap.utils.toArray('.fill').forEach((h) => {
        gsap.fromTo(h, { '--p': '0%' }, {
            '--p': '100%',
            ease: 'none',
            scrollTrigger: { trigger: h, start: 'top 85%', end: 'top 45%', scrub: true }
        });
    });

    // ---- E2: SCRUB — progress bar tied to page scroll ----
    gsap.to('#progressBar', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });

    // ---- PIN: #work stays fixed while the line grows and each step lights up ----
    const workTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#work',
            start: 'top top',
            end: '+=1400',
            pin: true,
            scrub: 1,
            anticipatePin: 1
        }
    });
    workTl
        .from('.step', { opacity: 0.2, y: 40, scale: 0.92, stagger: 0.6, duration: 0.6, ease: 'power2.out' }, 0)
        .fromTo('#stepLine', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 2.4 }, 0);
});

// Reduced motion: no animation at all, everything is visible and static
mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('#progressBar', { display: 'none' });
});

// ---- D3: CLICK INTERACTION — replay the intro ----
document.getElementById('replayBtn').addEventListener('click', () => {
    if (introTl) introTl.restart();
});