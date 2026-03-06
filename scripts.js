'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ── Dark Mode ─────────────────────────────────────────── */
    const darkBtn  = document.getElementById('darkModeToggle');
    const htmlEl   = document.documentElement;

    const applyTheme = (theme) => {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (darkBtn) {
            darkBtn.querySelector('i').className =
                theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            darkBtn.setAttribute('aria-label',
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
    };

    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    if (darkBtn) {
        darkBtn.addEventListener('click', () => {
            applyTheme(htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });
    }

    /* ── Mobile Menu ───────────────────────────────────────── */
    const menuBtn  = document.getElementById('menuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', String(isOpen));
            menuBtn.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        });

        // Close on nav link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.querySelector('i').className = 'fas fa-bars';
            });
        });
    }

    /* ── Smooth Scroll ─────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const headerH = parseInt(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--header-h'), 10) || 68;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - headerH,
                behavior: 'smooth'
            });
        });
    });

    /* ── Scroll Spy (active nav link) ──────────────────────── */
    const sections   = document.querySelectorAll('section[id]');
    const navItems   = document.querySelectorAll('.nav-links a');
    const headerH    = () => parseInt(
        getComputedStyle(document.documentElement)
            .getPropertyValue('--header-h'), 10) || 68;

    const onScroll = () => {
        const scrollY = window.scrollY + headerH() + 10;
        let current  = '';

        sections.forEach(sec => {
            if (scrollY >= sec.offsetTop) current = sec.id;
        });

        navItems.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── Header shadow on scroll ───────────────────────────── */
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.style.boxShadow =
                window.scrollY > 10
                    ? '0 2px 18px rgba(0,0,0,0.12)'
                    : '0 2px 12px rgba(0,0,0,0.08)';
        }, { passive: true });
    }

    /* ── Scroll-reveal (IntersectionObserver) ──────────────── */
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }

});
