// ============================================================
//  PREMIUM PORTFOLIO — Enhanced JavaScript
//  Features: Particle Canvas, Count-Up, Mouse Parallax,
//             Skill Progress Bars, Scroll Animations, Tabs,
//             Lightbox, Theme Toggle, Preloader, Timeline
// ============================================================

class PortfolioApp {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentLightboxIndex = 0;
        this.lightboxImages = [];
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.statsAnimated = false;
        this.init();
    }

    init() {
        this.showPreloader();
        this.setupTheme();
        this.setupEventListeners();
        this.initializeAnimations();
        this.handleHashChange();
        this.setupLightbox();
        this.setupScrollableTabs();
        this.setupJournalInteraction();
        this.setupParallax();
        this.setupCustomCursor();
        this.setupSpotlightTilt();
    }

    // ─────────────────────────────────────────
    //  PRELOADER
    // ─────────────────────────────────────────
    showPreloader() {
        const preloader = document.getElementById('preloader');
        const loadingFill = document.querySelector('.loading-fill');
        const logoPreloader = document.querySelector('.logo-icon-preloader');

        if (logoPreloader) {
            logoPreloader.style.animation = 'preloaderPulse 2s ease-in-out infinite';
        }

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 18 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                        this.startLetterAnimation();
                        this.startTypingAnimation();
                        this.initParticles();
                        // Animate stats after preloader hides
                        setTimeout(() => this.animateStats(), 1800);
                    }, 600);
                }, 300);
            }
            if (loadingFill) loadingFill.style.width = progress + '%';
        }, 80);
    }

    // ─────────────────────────────────────────
    //  PARTICLE CANVAS SYSTEM
    // ─────────────────────────────────────────
    initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const hero = document.querySelector('.home-hero');
        if (!hero) return;

        const resizeCanvas = () => {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Spawn particles — minimal & elegant
        const PARTICLE_COUNT = 40;
        this.particles = [];

        const primaryColor = '37,99,235';
        const violetColor = '99,102,241';

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.6 + 0.4,
                dx: (Math.random() - 0.5) * 0.28,
                dy: (Math.random() - 0.5) * 0.28,
                alpha: Math.random() * 0.28 + 0.04,
                color: Math.random() > 0.6 ? primaryColor : violetColor,
            });
        }

        const drawParticles = () => {
            if (!document.getElementById('home')?.classList.contains('active')) {
                requestAnimationFrame(drawParticles);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            this.particles.forEach(p => {
                // Very gentle mouse attraction
                const mx = this.mouse.x - p.x;
                const my = this.mouse.y - p.y;
                const dist = Math.sqrt(mx * mx + my * my);
                if (dist < 90) {
                    p.dx += mx * 0.000035;
                    p.dy += my * 0.000035;
                }

                p.x += p.dx;
                p.y += p.dy;

                // Speed damping
                p.dx *= 0.995;
                p.dy *= 0.995;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
                ctx.fill();
            });

            // Draw connecting lines between nearby particles — very subtle
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 95) {
                        const opacity = (1 - dist / 95) * 0.07;
                        ctx.beginPath();
                        ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        ctx.strokeStyle = `rgba(${this.particles[i].color},${opacity})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawParticles);
        };

        drawParticles();
    }

    // ─────────────────────────────────────────
    //  COUNT-UP ANIMATION (HERO STATS)
    // ─────────────────────────────────────────
    animateStats() {
        if (this.statsAnimated) return;
        this.statsAnimated = true;

        const statEls = document.querySelectorAll('.stat-number');
        statEls.forEach(el => {
            const target = parseFloat(el.getAttribute('data-target') || '0');
            const decimals = parseInt(el.getAttribute('data-decimals') || '0');
            const duration = 1800;
            const start = performance.now();

            const tick = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // easeOutExpo
                const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const current = eased * target;
                el.textContent = decimals > 0
                    ? current.toFixed(decimals)
                    : Math.floor(current).toString();
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toString();
            };
            requestAnimationFrame(tick);
        });
    }

    // ─────────────────────────────────────────
    //  SKILL PROGRESS BARS
    // ─────────────────────────────────────────
    animateProgressBars() {
        document.querySelectorAll('.skill-progress-bar').forEach(bar => {
            const width = bar.getAttribute('data-width');
            if (width && bar.style.width === '') {
                setTimeout(() => { bar.style.width = width + '%'; }, 100);
            }
        });
    }

    // ─────────────────────────────────────────
    //  MOUSE PARALLAX (HERO PROFILE IMAGE)
    // ─────────────────────────────────────────
    setupParallax() {
        const profileImg = document.getElementById('profile-img');
        if (!profileImg) return;

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            const hero = document.querySelector('.home-hero');
            if (!hero) return;

            const rect = hero.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / rect.width;
            const dy = (e.clientY - cy) / rect.height;

            const moveX = dx * 8;
            const moveY = dy * 6;

            profileImg.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });

        // Reset on mouse leave
        document.addEventListener('mouseleave', () => {
            if (profileImg) {
                profileImg.style.transform = 'translate(0, 0)';
            }
        });
    }

    // ─────────────────────────────────────────
    //  INTERACTIVE CUSTOM CURSOR
    // ─────────────────────────────────────────
    setupCustomCursor() {
        const dot = document.querySelector('.cursor-dot');
        const outline = document.querySelector('.cursor-outline');
        if (!dot || !outline) return;

        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) return;

        document.body.classList.add('custom-cursor-active');

        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;
        const speed = 0.15; // spring damping lag

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        const animateOutline = () => {
            outlineX += (mouseX - outlineX) * speed;
            outlineY += (mouseY - outlineY) * speed;
            outline.style.left = outlineX + 'px';
            outline.style.top = outlineY + 'px';
            requestAnimationFrame(animateOutline);
        };
        animateOutline();

        const hoverSelectors = 'a, button, .btn, .tab-btn, .achievement-tab-btn, .certificate-item, .journal-item, .theme-toggle, .fixed-logo a, .social-links a, .social-icons a';

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverSelectors)) {
                document.body.classList.add('cursor-hover');
            } else {
                document.body.classList.remove('cursor-hover');
            }
        });
    }

    // ─────────────────────────────────────────
    //  3D TILT EFFECT & SPOTLIGHT GLOW
    // ─────────────────────────────────────────
    setupSpotlightTilt() {
        const cards = document.querySelectorAll('.skill-card, .quality-card, .contact-item, .education-card, .experience-card, .journal-item');
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                if (!isTouchDevice) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const relativeX = (x - centerX) / centerX;
                    const relativeY = (y - centerY) / centerY;

                    // Subtle tilt — professional feel
                    const maxRotateX = 4;
                    const maxRotateY = 4;

                    const rotateX = -relativeY * maxRotateX;
                    const rotateY = relativeX * maxRotateY;

                    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
                    card.style.transition = 'transform 0.12s ease';
                }
            });

            card.addEventListener('mouseleave', () => {
                if (!isTouchDevice) {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                    card.style.transition = 'transform 0.5s ease';
                }
            });
        });
    }

    // ─────────────────────────────────────────
    //  LETTER-BY-LETTER ANIMATION
    // ─────────────────────────────────────────
    startLetterAnimation() {
        const el = document.querySelector('.letter-animate');
        if (!el) return;

        const text = el.innerHTML;
        el.innerHTML = '';
        el.style.opacity = '1';

        const letters = [];
        let inTag = false;
        let tagBuffer = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '<') {
                inTag = true;
                tagBuffer = char;
            } else if (char === '>' && inTag) {
                inTag = false;
                tagBuffer += char;
                letters.push(tagBuffer);
                tagBuffer = '';
            } else if (inTag) {
                tagBuffer += char;
            } else if (char === ' ') {
                letters.push('<span class="letter">&nbsp;</span>');
            } else {
                letters.push(`<span class="letter" style="opacity:0;transform:translateY(20px)">${char}</span>`);
            }
        }

        el.innerHTML = letters.join('');

        el.querySelectorAll('.letter').forEach((span, i) => {
            if (span.innerHTML !== '&nbsp;') {
                setTimeout(() => {
                    span.style.transition = 'opacity 0.30s ease, transform 0.30s ease';
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                }, i * 42);
            }
        });
    }

    // ─────────────────────────────────────────
    //  TYPING ANIMATION
    // ─────────────────────────────────────────
    startTypingAnimation() {
        const el = document.querySelector('.typing-text');
        if (!el) return;

        const text = el.textContent;
        el.textContent = '';
        el.style.borderRight = '3px solid var(--primary)';

        let i = 0;
        const type = () => {
            if (i < text.length) {
                el.textContent += text.charAt(i++);
                setTimeout(type, 45);
            } else {
                setTimeout(() => { el.style.borderRight = 'none'; }, 1000);
            }
        };
        setTimeout(type, 1800);
    }

    // ─────────────────────────────────────────
    //  SMOOTH GRADIENT ON SCROLL
    // ─────────────────────────────────────────
    setupSmoothGradientChange() {
        window.addEventListener('scroll', () => {
            const pct = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight), 1);
            const hue = 20 + pct * 240;
            const opacity = 0.03 + pct * 0.06;
            document.documentElement.style.setProperty('--dynamic-bg',
                `linear-gradient(135deg, var(--bg) 0%, var(--bg) ${50 + pct * 30}%, hsla(${hue},70%,60%,${opacity}) 100%)`
            );
        });
    }

    // ─────────────────────────────────────────
    //  THEME
    // ─────────────────────────────────────────
    setupTheme() {
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const container = document.querySelector('.theme-icon-container');
        if (!container) return;
        const sun = container.querySelector('.sun-icon');
        const moon = container.querySelector('.moon-icon');

        container.style.transition = 'transform 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)';
        container.style.transform = 'rotate(360deg)';

        setTimeout(() => {
            if (this.currentTheme === 'dark') {
                if (sun) sun.style.display = 'block';
                if (moon) moon.style.display = 'none';
            } else {
                if (sun) sun.style.display = 'none';
                if (moon) moon.style.display = 'block';
            }
            container.style.transform = 'rotate(0deg)';
        }, 250);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
    }

    // ─────────────────────────────────────────
    //  EVENT LISTENERS
    // ─────────────────────────────────────────
    setupEventListeners() {
        window.addEventListener('hashchange', () => this.handleHashChange());
        window.addEventListener('load', () => this.handleHashChange());
        window.addEventListener('resize', () => this.handleWindowResize());

        window.addEventListener('scroll', () => {
            this.handleScroll();
            this.updateScrollProgress();
        });

        document.addEventListener('click', (e) => this.closeMobileMenuOnOutsideClick(e));
        document.addEventListener('keydown', (e) => {
            this.closeMobileMenuOnEscape(e);
            this.closeLightboxOnEscape(e);
        });

        // Smooth anchor scrolling
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                const href = a.getAttribute('href');
                if (href !== '#' && href.length > 1) {
                    e.preventDefault();
                    this.smoothScrollTo(href.substring(1));
                }
            });
        });
    }

    // ─────────────────────────────────────────
    //  SCROLL PROGRESS BAR
    // ─────────────────────────────────────────
    updateScrollProgress() {
        const bar = document.querySelector('.timeline-progress');
        const scrolled = window.scrollY;
        const total = document.body.scrollHeight - window.innerHeight;
        if (bar && total > 0) bar.style.width = (scrolled / total * 100) + '%';
    }

    // Also keep the old timeline fill for experience cards
    updateTimelineProgress() {
        document.querySelectorAll('.timeline-line').forEach(line => {
            const parent = line.parentElement?.parentElement;
            if (!parent?.style?.display || parent.style.display !== 'none') {
                const timeline = line.parentElement;
                const top = timeline.offsetTop;
                const height = timeline.scrollHeight;
                const scroll = window.pageYOffset;
                const wh = window.innerHeight;
                const pct = Math.max(0, Math.min(1, (scroll + wh - top) / (height + wh)));
                line.style.height = `${pct * 100}%`;
            }
        });
    }

    // ─────────────────────────────────────────
    //  SCROLL HANDLER
    // ─────────────────────────────────────────
    handleScroll() {
        this.updateTimelineProgress();

        const scrollTop = window.pageYOffset;
        if (scrollTop < 100) {
            this.updateActiveNavLink('home');
            return;
        }

        const sections = ['aboutme', 'skills', 'experience', 'projects', 'achievement', 'journal', 'contact'];
        const navbarH = document.querySelector('.navbar')?.offsetHeight || 70;

        for (let i = sections.length - 1; i >= 0; i--) {
            const sec = document.getElementById(sections[i]);
            if (sec && scrollTop >= sec.offsetTop - navbarH - 100) {
                this.updateActiveNavLink(sections[i]);
                break;
            }
        }
    }

    // ─────────────────────────────────────────
    //  LIGHTBOX
    // ─────────────────────────────────────────
    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');
        const overlay = document.querySelector('.lightbox-overlay');

        document.addEventListener('click', (e) => {
            const img = e.target.classList.contains('certificate-img') ? e.target : null;
            const zoom = e.target.classList.contains('certificate-zoom') ? e.target : null;

            if (img || zoom) {
                const certImg = img || zoom.closest('.certificate-item').querySelector('.certificate-img');
                const grid = certImg.closest('.certificate-grid');
                this.openLightbox(certImg, grid);
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', () => this.closeLightbox());
        if (overlay) overlay.addEventListener('click', () => this.closeLightbox());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevImage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextImage());

        document.addEventListener('keydown', (e) => {
            if (lightbox?.classList.contains('active')) {
                if (e.key === 'ArrowLeft') this.prevImage();
                if (e.key === 'ArrowRight') this.nextImage();
            }
        });
    }

    openLightbox(clickedImg, grid) {
        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightbox-img');
        const lbCurrent = document.getElementById('lightbox-current');
        const lbTotal = document.getElementById('lightbox-total');

        this.lightboxImages = Array.from(grid.querySelectorAll('.certificate-img'));
        this.currentLightboxIndex = this.lightboxImages.indexOf(clickedImg);

        if (lbImg) { lbImg.src = clickedImg.src; lbImg.alt = clickedImg.alt; }
        if (lbCurrent) lbCurrent.textContent = this.currentLightboxIndex + 1;
        if (lbTotal) lbTotal.textContent = this.lightboxImages.length;

        lightbox?.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (lbImg) { lbImg.style.transform = 'scale(1)'; lbImg.style.opacity = '1'; }
        }, 50);
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightbox-img');
        if (lbImg) { lbImg.style.transform = 'scale(0.85)'; lbImg.style.opacity = '0'; }
        setTimeout(() => {
            lightbox?.classList.remove('active');
            document.body.style.overflow = 'auto';
        }, 300);
    }

    prevImage() {
        this.currentLightboxIndex = this.currentLightboxIndex > 0
            ? this.currentLightboxIndex - 1
            : this.lightboxImages.length - 1;
        this.updateLightboxImage();
    }

    nextImage() {
        this.currentLightboxIndex = this.currentLightboxIndex < this.lightboxImages.length - 1
            ? this.currentLightboxIndex + 1
            : 0;
        this.updateLightboxImage();
    }

    updateLightboxImage() {
        const lbImg = document.getElementById('lightbox-img');
        const lbCurrent = document.getElementById('lightbox-current');
        const current = this.lightboxImages[this.currentLightboxIndex];

        if (lbImg) {
            lbImg.style.transform = 'translateX(60px)';
            lbImg.style.opacity = '0';
            setTimeout(() => {
                lbImg.src = current.src;
                lbImg.alt = current.alt;
                if (lbCurrent) lbCurrent.textContent = this.currentLightboxIndex + 1;
                lbImg.style.transform = 'translateX(-60px)';
                setTimeout(() => {
                    lbImg.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                    lbImg.style.transform = 'translateX(0)';
                    lbImg.style.opacity = '1';
                }, 30);
            }, 160);
        }
    }

    closeLightboxOnEscape(e) {
        if (e.key === 'Escape') this.closeLightbox();
    }

    // ─────────────────────────────────────────
    //  ANIMATIONS
    // ─────────────────────────────────────────
    initializeAnimations() {
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupCardAnimations();
        this.setupTimelineAnimations();
        this.setupSectionTransitions();
        this.setupSmoothGradientChange();
    }

    setupSectionTransitions() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.tab-content, .achievement-tab-content').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });
    }

    setupScrollAnimations() {
        const opts = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');

                    // Animate progress bars when skills section enters view
                    if (entry.target.classList.contains('skills-section') ||
                        entry.target.classList.contains('skill-card')) {
                        this.animateProgressBars();
                    }

                    const id = entry.target.id;
                    if (id && ['aboutme', 'skills', 'experience', 'achievement', 'journal', 'contact'].includes(id)) {
                        this.updateActiveNavLink(id);
                    }
                }
            });
        }, opts);

        document.querySelectorAll(
            '.about-section, .skills-section, .experience-section, .achievement-section,' +
            '.journal-section, .contact-section, .why-choose-section, .projects-section, .achievements-highlights-section,' +
            '.skill-card, .certificate-item, .quality-card, .tool-item, .timeline-item, .journal-item, .project-card, .achievement-highlight'
        ).forEach(el => {
            el.classList.add('animate-element');
            observer.observe(el);
        });

        // Home observer
        const homeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) this.updateActiveNavLink('home');
            });
        }, { threshold: 0.3 });
        const hero = document.querySelector('.home-hero');
        if (hero) homeObserver.observe(hero);

        // Achievement counter animation
        const achievementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateAchievementStats();
                    achievementObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const achievementSection = document.querySelector('.achievements-highlights-section');
        if (achievementSection) achievementObserver.observe(achievementSection);
    }

    animateAchievementStats() {
        const statEls = document.querySelectorAll('.achievement-stat strong');
        let hasAnimated = false;

        statEls.forEach((el, index) => {
            if (hasAnimated) return;

            const text = el.textContent.trim();
            const numMatch = text.match(/\d+(\.\d+)?/);

            if (numMatch) {
                const target = parseFloat(numMatch[0]);
                const duration = 1200;
                const start = performance.now();

                const tick = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    const current = Math.floor(eased * target);
                    el.textContent = current + (text.includes('.') && progress < 1 ? '.' : '');

                    if (progress < 1) {
                        requestAnimationFrame(tick);
                    } else {
                        el.textContent = target;
                    }
                };

                setTimeout(() => requestAnimationFrame(tick), index * 100);
                hasAnimated = true;
            }
        });
    }

    setupTimelineAnimations() {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('animate-timeline');
            });
        }, { threshold: 0.3 });
        document.querySelectorAll('.timeline-item').forEach(el => obs.observe(el));
    }

    setupHoverAnimations() {
        // Skill cards
        document.querySelectorAll('.skill-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 0.08}s`;
        });

        // Experience cards
        document.querySelectorAll('.experience-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Certificate hover
        document.querySelectorAll('.certificate-item').forEach((item, i) => {
            item.style.animationDelay = `${i * 0.08}s`;
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-10px)';
                const overlay = item.querySelector('.certificate-overlay');
                const img = item.querySelector('.certificate-img');
                if (overlay) overlay.style.opacity = '1';
                if (img) img.style.transform = 'scale(1.06)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
                const overlay = item.querySelector('.certificate-overlay');
                const img = item.querySelector('.certificate-img');
                if (overlay) overlay.style.opacity = '0';
                if (img) img.style.transform = 'scale(1)';
            });
        });
    }

    setupCardAnimations() {
        const opts = { threshold: 0.08, rootMargin: '0px 0px -20px 0px' };

        const stagger = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Array.from(entry.target.children).forEach((child, i) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, i * 70);
                    });
                    stagger.unobserve(entry.target);
                }
            });
        }, opts);

        document.querySelectorAll('.skills-grid, .qualities-grid, .certificate-grid, .journal-grid, .projects-grid, .achievements-grid').forEach(grid => {
            Array.from(grid.children).forEach(child => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(18px)';
                child.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
            });
            stagger.observe(grid);
        });
    }

    // ─────────────────────────────────────────
    //  JOURNAL INTERACTION
    // ─────────────────────────────────────────
    setupJournalInteraction() {
        document.querySelectorAll('.journal-item').forEach((item, i) => {
            item.style.animationDelay = `${i * 0.08}s`;
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-4px)';
                const arrow = item.querySelector('.journal-arrow');
                const overlay = item.querySelector('.journal-overlay');
                if (arrow) arrow.style.transform = 'rotate(35deg) scale(1.05)';
                if (overlay) overlay.style.opacity = '1';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
                const arrow = item.querySelector('.journal-arrow');
                const overlay = item.querySelector('.journal-overlay');
                if (arrow) arrow.style.transform = 'rotate(0deg) scale(1)';
                if (overlay) overlay.style.opacity = '0';
            });
        });
    }

    // ─────────────────────────────────────────
    //  SCROLLABLE ACHIEVEMENT TABS
    // ─────────────────────────────────────────
    setupScrollableTabs() {
        const tabs = document.querySelector('.achievement-tabs');
        if (!tabs) return;

        let isDown = false, startX = 0, scrollLeft = 0;

        tabs.addEventListener('mousedown', e => {
            isDown = true; startX = e.pageX - tabs.offsetLeft; scrollLeft = tabs.scrollLeft;
            tabs.style.cursor = 'grabbing';
        });
        tabs.addEventListener('mouseleave', () => { isDown = false; tabs.style.cursor = 'grab'; });
        tabs.addEventListener('mouseup', () => { isDown = false; tabs.style.cursor = 'grab'; });
        tabs.addEventListener('mousemove', e => {
            if (!isDown) return;
            e.preventDefault();
            tabs.scrollLeft = scrollLeft - (e.pageX - tabs.offsetLeft - startX) * 2;
        });

        // Touch support
        tabs.addEventListener('touchstart', e => { startX = e.touches[0].pageX; scrollLeft = tabs.scrollLeft; });
        tabs.addEventListener('touchmove', e => {
            tabs.scrollLeft = scrollLeft - (e.touches[0].pageX - startX) * 2;
        });
        tabs.addEventListener('touchend', () => { startX = 0; });
    }

    // ─────────────────────────────────────────
    //  MOBILE MENU
    // ─────────────────────────────────────────
    toggleMobileMenu() {
        const menu = document.getElementById('navMenu');
        const btn = document.querySelector('.mobile-menu-btn');
        const isOpen = menu.classList.contains('active');
        menu.classList.toggle('active', !isOpen);
        btn.classList.toggle('active', !isOpen);
        document.body.style.overflow = isOpen ? 'auto' : 'hidden';
    }

    closeMobileMenu() {
        const menu = document.getElementById('navMenu');
        const btn = document.querySelector('.mobile-menu-btn');
        menu?.classList.remove('active');
        btn?.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeMobileMenuOnOutsideClick(e) {
        const navbar = document.querySelector('.navbar');
        const menu = document.getElementById('navMenu');
        if (navbar && menu && !navbar.contains(e.target) && menu.classList.contains('active')) {
            this.closeMobileMenu();
        }
    }

    closeMobileMenuOnEscape(e) {
        if (e.key === 'Escape') this.closeMobileMenu();
    }

    handleWindowResize() {
        if (window.innerWidth > 899) this.closeMobileMenu();
    }

    // ─────────────────────────────────────────
    //  NAVIGATION
    // ─────────────────────────────────────────
    showSection(sectionId) {
        this.closeMobileMenu();

        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
            s.style.opacity = '0';
            s.style.transform = 'translateY(20px)';
        });

        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.add('active');
            setTimeout(() => {
                target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
            }, 50);
        }

        history.replaceState(null, null, '#' + sectionId);
        this.updateActiveNavLink(sectionId);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Re-trigger stats if returning to home
        if (sectionId === 'home') {
            this.statsAnimated = false;
            setTimeout(() => this.animateStats(), 800);
        }
    }

    smoothScrollTo(sectionId) {
        this.closeMobileMenu();
        const home = document.getElementById('home');
        if (!home?.classList.contains('active')) {
            this.showSection('home');
            setTimeout(() => this.scrollToSection(sectionId), 150);
        } else {
            this.scrollToSection(sectionId);
        }
    }

    scrollToSection(sectionId) {
        const target = document.getElementById(sectionId);
        const navbarH = document.querySelector('.navbar')?.offsetHeight || 70;
        if (target) {
            window.scrollTo({ top: target.offsetTop - navbarH - 20, behavior: 'smooth' });
            this.updateActiveNavLink(sectionId);
        }
    }

    updateActiveNavLink(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId ||
                link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (!hash || hash === 'home') {
            this.showSection('home');
        } else if (['aboutme', 'skills', 'experience', 'projects', 'achievement', 'journal', 'contact'].includes(hash)) {
            this.smoothScrollTo(hash);
        }
    }

    // ─────────────────────────────────────────
    //  EXPERIENCE TABS
    // ─────────────────────────────────────────
    showExperienceTab(tabName) {
        const contents = document.querySelectorAll('.tab-content');
        const buttons = document.querySelectorAll('.tab-btn');

        contents.forEach(c => {
            c.style.opacity = '0';
            c.style.transform = 'translateY(20px)';
            setTimeout(() => { c.style.display = 'none'; }, 300);
        });
        buttons.forEach(b => b.classList.remove('active'));

        setTimeout(() => {
            const target = document.getElementById(tabName + '-tab');
            if (target) {
                target.style.display = 'block';
                target.style.opacity = '0';
                target.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0)';
                }, 50);

                setTimeout(() => {
                    target.querySelectorAll('.timeline-item').forEach((item, i) => {
                        setTimeout(() => item.classList.add('animate-timeline'), i * 180);
                    });
                }, 200);
            }
        }, 300);

        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(tabName) ||
                (tabName === 'internship' && btn.textContent.includes('Internship')) ||
                (tabName === 'organization' && btn.textContent.includes('Organization')) ||
                (tabName === 'work' && btn.textContent.includes('Work'))) {
                btn.classList.add('active');
            }
        });
    }

    // ─────────────────────────────────────────
    //  ACHIEVEMENT TABS
    // ─────────────────────────────────────────
    showAchievementTab(tabName) {
        const contents = document.querySelectorAll('.achievement-tab-content');
        const buttons = document.querySelectorAll('.achievement-tab-btn');

        contents.forEach(c => {
            c.style.opacity = '0';
            c.style.transform = 'translateY(20px)';
            setTimeout(() => { c.style.display = 'none'; }, 300);
        });
        buttons.forEach(b => b.classList.remove('active'));

        setTimeout(() => {
            const target = document.getElementById(tabName + '-tab');
            if (target) {
                target.style.display = 'block';
                target.style.opacity = '0';
                target.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0)';
                }, 50);

                setTimeout(() => {
                    target.querySelectorAll('.certificate-item').forEach((cert, i) => {
                        setTimeout(() => {
                            cert.style.opacity = '1';
                            cert.style.transform = 'translateY(0)';
                        }, i * 80);
                    });
                }, 200);
            }
        }, 300);

        buttons.forEach(btn => {
            const t = btn.textContent.toLowerCase();
            if ((tabName.includes('internship') && t.includes('internship')) ||
                (tabName.includes('course') && t.includes('course')) ||
                (tabName.includes('competition') && t.includes('competition')) ||
                (tabName.includes('organization') && t.includes('organization')) ||
                (tabName.includes('webinar') && t.includes('webinar'))) {
                btn.classList.add('active');
            }
        });
    }
}

// ─────────────────────────────────────────
//  GLOBAL FUNCTION WRAPPERS
// ─────────────────────────────────────────
function openJournalLink(url) { window.open(url, '_blank', 'noopener,noreferrer'); }
function toggleTheme() { portfolioApp.toggleTheme(); }
function toggleMobileMenu() { portfolioApp.toggleMobileMenu(); }
function showSection(id) { portfolioApp.showSection(id); }
function scrollToAboutMe() { portfolioApp.smoothScrollTo('aboutme'); }
function scrollToSkills() { portfolioApp.smoothScrollTo('skills'); }
function scrollToExperience() { portfolioApp.smoothScrollTo('experience'); }
function scrollToAchievement() { portfolioApp.smoothScrollTo('achievement'); }
function scrollToJournal() { portfolioApp.smoothScrollTo('journal'); }
function scrollToProjects() { portfolioApp.smoothScrollTo('projects'); }
function scrollToContact() { portfolioApp.smoothScrollTo('contact'); }
function showExperienceTab(n) { portfolioApp.showExperienceTab(n); }
function showAchievementTab(n) { portfolioApp.showAchievementTab(n); }

// ─────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────
let portfolioApp;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { portfolioApp = new PortfolioApp(); });
} else {
    portfolioApp = new PortfolioApp();
}