// ========================================
// LOADING SCREEN ANIMATION (first visit only - VC logo split)
// ========================================
let loadingCounter = 0;
const percentageElement = document.getElementById('loading-percentage');
const circleProgress = document.getElementById('loading-circle-progress');
const loadingScreen = document.querySelector('.loading-screen');
const loadingDuration = 1500; // 1.5 seconds
const updateInterval = 20; // Update every 20ms for smooth animation
const increment = 100 / (loadingDuration / updateInterval);
const circumference = 2 * Math.PI * 54; // 2 * PI * radius

// Check if user has already visited in this session
const hasVisited = sessionStorage.getItem('hasVisited');

if (hasVisited) {
    // Skip logo animation for subsequent page loads
    loadingScreen.remove();
    document.body.classList.add('loaded');
} else {
    // First visit - keep the black grid cover behind the VC logo animation,
    // and reveal it only once the logo animation finishes
    sessionStorage.setItem('hasVisited', 'true');

    // Start counting immediately
    const counterInterval = setInterval(() => {
        if (loadingCounter < 100) {
            loadingCounter += increment;
            if (loadingCounter > 100) loadingCounter = 100;

            const percent = Math.floor(loadingCounter);
            percentageElement.textContent = `${percent}%`;

            // Update circle progress
            const offset = circumference - (loadingCounter / 100) * circumference;
            circleProgress.style.strokeDashoffset = offset;
        } else {
            clearInterval(counterInterval);
            percentageElement.textContent = '100%';
            circleProgress.style.strokeDashoffset = 0;

            // Start animation immediately when reaching 100%
            loadingScreen.classList.add('fade-out');
            document.body.classList.add('loaded');
            setTimeout(() => {
                loadingScreen.remove();
            }, 600);
        }
    }, updateInterval);
}

// ========================================
// CLOCK FUNCTIONALITY
// ========================================
function setClockPart(el, value) {
    if (!el || el.textContent === value) return;
    el.textContent = value;
    el.classList.remove('clock-flip');
    // eslint-disable-next-line no-unused-expressions
    void el.offsetWidth; // restart animation
    el.classList.add('clock-flip');
}

function updateClock() {
    const hourEl = document.getElementById('clock-hour');
    const minuteEl = document.getElementById('clock-minute');
    const ampmEl = document.getElementById('clock-ampm');
    if (!hourEl || !minuteEl || !ampmEl) return;

    // Create a date object for Central Time (US)
    const options = {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(new Date());
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const ampm = parts.find(p => p.type === 'dayPeriod').value;

    setClockPart(hourEl, hour);
    setClockPart(minuteEl, minute);
    setClockPart(ampmEl, ampm);
}

// Update the clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

// DOM Content Loaded - Initialize interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Email protection
    const copyLinks = document.querySelectorAll(".copy-email");
    const user = "21vincentchu";
    const domain = "gmail.com";
    const email = `${user}@${domain}`;

    copyLinks.forEach(copyLink => {
        copyLink.addEventListener("click", function (e) {
            e.preventDefault();

            // Copy to clipboard
            if (!navigator.clipboard) {
                const temp = document.createElement("textarea");
                temp.value = email;
                document.body.appendChild(temp);
                temp.select();
                document.execCommand("copy");
                document.body.removeChild(temp);
            } else {
                navigator.clipboard.writeText(email);
            }

            // Show feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';

            setTimeout(() => {
                this.innerHTML = originalText;
            }, 10000);

            setTimeout(() => {
                window.location.href = `mailto:${email}`;
            }, 500);
        });
    });

    // Mobile Navigation
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navWrapper = document.querySelector('.nav-wrapper');
    const navLinks = document.querySelectorAll('.nav-links a');
    const clockContainer = document.querySelector('.nav-container > .clock-container');

    // No need to handle mobile clock anymore - it's hidden on mobile via CSS

    // Toggle menu when hamburger is clicked
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navWrapper.classList.toggle('active');
            document.body.classList.toggle('menu-open'); // Prevent scrolling when menu is open
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenuToggle.classList.remove('active');
            navWrapper.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-wrapper') &&
            !event.target.closest('.mobile-menu-toggle') &&
            navWrapper.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navWrapper.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Add some additional CSS for preventing scroll
    const style = document.createElement('style');
    style.textContent = `
        body.menu-open {
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navWrapper.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navWrapper.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
});

// ========================================
// SCROLL PROGRESS & ACTIVE SECTIONS
// ========================================
window.addEventListener('scroll', () => {
    // Add blur effect to navbar when scrolled
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }

    // Highlight active nav link and section heading based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    let current = '';
    const scrollPosition = window.scrollY + 600; // Adjust offset for earlier detection

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    // Special case: if we're near the bottom of the page, activate contact
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100) {
        current = 'contact';
    }

    // If no section is active or at the very top, activate Home (logo)
    const logoLink = document.querySelector('.logo a');
    if (!current || window.scrollY < 300) {
        current = 'top';
        logoLink.classList.add('active');
    } else {
        logoLink.classList.remove('active');
    }

    // Update nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
            link.classList.add('active');
        }
    });

    // Update section headings
    sections.forEach(section => {
        const heading = section.querySelector('h2');
        if (heading) {
            if (section.getAttribute('id') === current) {
                heading.classList.add('active');
            } else {
                heading.classList.remove('active');
            }
        }
    });
});

// ========================================
// SECTION DECORATOR ANIMATIONS
// ========================================
const decoratorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const decorator = entry.target.querySelector('.section-decorator');
            if (decorator) {
                decorator.classList.add('animate');
            }
        }
    });
}, { threshold: 0.1 });

// Observe all sections with decorators
const sectionsWithDecorators = document.querySelectorAll('section');
sectionsWithDecorators.forEach(section => {
    decoratorObserver.observe(section);
});

// ========================================
// SCROLL-LINKED STAGGER REVEAL
// ========================================
const revealItems = document.querySelectorAll(
    '.experience-card, .project-card, .skill-category, .gallery-item, .contact-option, .spotify-track-card'
);

revealItems.forEach(item => item.classList.add('reveal-item'));

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const siblings = Array.from(target.parentElement.children)
            .filter(el => el.classList.contains('reveal-item'));
        const index = siblings.indexOf(target);

        target.style.transitionDelay = `${Math.min(index, 8) * 0.08}s`;
        target.classList.add('in-view');
        revealObserver.unobserve(target);
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

revealItems.forEach(item => revealObserver.observe(item));

// ========================================
// TOGGLE EXPERIENCE DETAILS
// ========================================
function toggleDetails(button) {
    const detailsContent = button.nextElementSibling;
    const isActive = button.classList.contains('active');

    if (isActive) {
        button.classList.remove('active');
        detailsContent.classList.remove('show');
        button.innerHTML = '<i class="fas fa-chevron-down"></i> View details';
    } else {
        button.classList.add('active');
        detailsContent.classList.add('show');
        button.innerHTML = '<i class="fas fa-chevron-up"></i> Hide details';
    }
}

function togglePdfPages(button) {
    const pages = button.nextElementSibling;
    const isActive = button.classList.contains('active');

    if (isActive) {
        button.classList.remove('active');
        pages.classList.remove('show');
        button.innerHTML = '<i class="fas fa-chevron-down"></i> Expand to view paper';
    } else {
        button.classList.add('active');
        pages.classList.add('show');
        button.innerHTML = '<i class="fas fa-chevron-up"></i> Collapse paper';
    }
}


// ========================================
// SPOTIFY RECENTLY PLAYED
// ========================================

async function loadSpotifyTracks() {
    const container = document.getElementById('spotify-tracks');

    try {
        const response = await fetch('recently_played.json');
        const data = await response.json();

        if (!data.success || data.tracks.length === 0) {
            container.innerHTML = '<p class="no-tracks">No recent tracks available. Run update_spotify.py to populate.</p>';
            return;
        }

        // Create track cards
        const tracksHTML = data.tracks.map(track => `
            <a href="${track.url}" target="_blank" class="spotify-track-card">
                <img src="${track.image}" alt="${track.album}" class="track-image">
                <div class="track-info">
                    <div class="track-name">${track.name}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
            </a>
        `).join('');

        container.innerHTML = tracksHTML;

        // Wire up scroll-reveal for the newly injected track cards
        container.querySelectorAll('.spotify-track-card').forEach(item => {
            item.classList.add('reveal-item');
            revealObserver.observe(item);
        });

    } catch (error) {
        console.error('Error loading Spotify tracks:', error);
        container.innerHTML = '<p class="error-text">Failed to load tracks. Please try again later.</p>';
    }
}

// Load Spotify tracks when page loads
document.addEventListener('DOMContentLoaded', loadSpotifyTracks);

// ========================================
// CUSTOM CURSOR
// ========================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;
let cursorInitialized = false;

// Hide cursor initially
cursorDot.style.opacity = '0';
cursorRing.style.opacity = '0';

// Update cursor position on mouse move
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Initialize cursor position on first move
    if (!cursorInitialized) {
        ringX = mouseX;
        ringY = mouseY;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        cursorInitialized = true;
    }

    // Move dot instantly
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

// Animate ring with delay (smooth follow effect)
function animateRing() {
    // Lerp (linear interpolation) for smooth following
    ringX += (mouseX - ringX) * 0.5;
    ringY += (mouseY - ringY) * 0.5;
    
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    
    requestAnimationFrame(animateRing);
}

animateRing();

// Add hover effect for interactive elements
const interactiveElements = document.querySelectorAll('a, button, .btn, .nav-links a, .project-card, .experience-card, .gallery-item, input, textarea');

interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hover');
        cursorRing.classList.add('hover');
    });
    
    element.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover');
        cursorRing.classList.remove('hover');
    });
});

// ========================================
// MAGNETIC HOVER EFFECT
// ========================================
function initMagnetic(selector, strength, maxScale) {
    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * strength;
            const y = (e.clientY - rect.top - rect.height / 2) * strength;
            el.style.transform = `translate(${x}px, ${y}px) scale(${maxScale})`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initMagnetic('.btn', 0.25, 1.05);
}

// ========================================
// PARALLAX BLOBS - DISABLED
// ========================================
// Blobs now just float in place without scrolling


// ========================================
// BACK TO TOP BUTTON
// ========================================

const backToTopButton = document.getElementById('back-to-top');

// Show/hide button based on scroll position
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

// Smooth scroll to top on click
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ========================================
// IMAGE LIGHTBOX MODAL
// ========================================
function enlargeImage(button) {
    const img = button.parentElement.querySelector('img');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');

    modalImg.src = img.src;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on background click
const imageModalEl = document.getElementById('imageModal');
if (imageModalEl) {
    imageModalEl.addEventListener('click', function(e) {
        if (e.target === this) {
            closeImageModal();
        }
    });
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

// ========================================
// SMOOTH HORIZONTAL SCROLLER (Experience, Photos)
// Mouse wheel and click-and-drag (with momentum) ease the track toward a
// target position. Touch screens and trackpads keep their native swipe.
//   enabled()   - return false to switch it off (e.g. Photos grid view)
//   wheelTarget - element listening for the wheel (default: the track)
//   snap(x)     - optional: where to settle after a drag / wheel burst
// ========================================
function initSmoothScroller(track, { enabled = () => true, wheelTarget = track, snap = null } = {}) {
    let target = null;
    let frame = null;
    let wheelIdle = null;
    let drag = null;
    let suppressClick = false;

    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const settle = (x) => (snap ? snap(x) : x);

    function step() {
        const diff = target - track.scrollLeft;
        if (Math.abs(diff) < 0.5) {
            track.scrollLeft = target;
            target = null;
            frame = null;
            return;
        }
        track.scrollLeft += diff * 0.16;
        frame = requestAnimationFrame(step);
    }

    function glideTo(x) {
        target = Math.max(0, Math.min(x, maxScroll()));
        if (!frame) frame = requestAnimationFrame(step);
    }

    function stop() {
        if (frame) cancelAnimationFrame(frame);
        frame = null;
        target = null;
    }

    // Vertical wheel scrolls sideways; once the track hits an end, the page scrolls normally
    wheelTarget.addEventListener('wheel', function(e) {
        if (!enabled()) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // trackpad swipe already scrolls sideways
        const from = target ?? track.scrollLeft;
        if ((e.deltaY < 0 && from <= 0) || (e.deltaY > 0 && from >= maxScroll() - 1)) return;
        e.preventDefault();
        const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * track.clientWidth : e.deltaY;
        glideTo(from + delta * 1.5);
        if (snap) {
            clearTimeout(wheelIdle);
            wheelIdle = setTimeout(() => glideTo(settle(target ?? track.scrollLeft)), 180);
        }
    }, { passive: false });

    track.addEventListener('pointerdown', function(e) {
        if (!enabled() || e.pointerType !== 'mouse' || e.button !== 0) return;
        stop();
        drag = { startX: e.clientX, startScroll: track.scrollLeft, lastX: e.clientX, lastTime: performance.now(), velocity: 0, moved: false };
    });

    window.addEventListener('pointermove', function(e) {
        if (!drag) return;
        const dx = e.clientX - drag.startX;
        if (!drag.moved && Math.abs(dx) > 5) {
            drag.moved = true;
            document.body.classList.add('strip-dragging');
            window.getSelection().removeAllRanges();
        }
        if (!drag.moved) return;
        track.scrollLeft = drag.startScroll - dx;

        const now = performance.now();
        const dt = now - drag.lastTime;
        if (dt > 0) drag.velocity = 0.8 * ((e.clientX - drag.lastX) / dt) + 0.2 * drag.velocity;
        drag.lastX = e.clientX;
        drag.lastTime = now;
    });

    window.addEventListener('pointerup', function() {
        if (!drag) return;
        if (drag.moved) {
            // Swallow the click that follows this mouseup (cleared right after in case none comes)
            suppressClick = true;
            setTimeout(() => { suppressClick = false; }, 0);
            document.body.classList.remove('strip-dragging');
            // Ignore stale velocity if the mouse paused before letting go
            const velocity = performance.now() - drag.lastTime > 80 ? 0 : drag.velocity;
            glideTo(settle(track.scrollLeft - velocity * 250));
        }
        drag = null;
    });

    // A drag shouldn't count as a click on whatever is under the mouse
    track.addEventListener('click', function(e) {
        if (suppressClick) {
            e.stopPropagation();
            e.preventDefault();
            suppressClick = false;
        }
    }, true);

    // Stop the browser's own image/link dragging from taking over
    track.addEventListener('dragstart', (e) => { if (enabled()) e.preventDefault(); });

    return { glideTo, stop, get target() { return target; } };
}

// ========================================
// TIMELINE CAROUSEL (Experience)
// ========================================
function initTimelineCarousel(trackId, pointsContainerId, cardSelector, prevBtnId, nextBtnId, counterId) {
    const track = document.getElementById(trackId);
    const pointsContainer = document.getElementById(pointsContainerId);
    if (!track || !pointsContainer) return;

    const points = Array.from(pointsContainer.querySelectorAll('.timeline-point'));
    const cards = Array.from(track.querySelectorAll(cardSelector));
    if (points.length === 0 || cards.length === 0) return;

    const prevBtn = prevBtnId ? document.getElementById(prevBtnId) : null;
    const nextBtn = nextBtnId ? document.getElementById(nextBtnId) : null;
    const counter = counterId ? document.getElementById(counterId) : null;

    function getCardStep() {
        const style = getComputedStyle(track);
        const gap = parseFloat(style.columnGap || style.gap || 0);
        return cards[0].getBoundingClientRect().width + gap;
    }

    const scroller = initSmoothScroller(track, {
        snap: (x) => {
            const step = getCardStep();
            return step > 0 ? Math.round(x / step) * step : x;
        }
    });

    // Based on where the track is heading, so quick repeated arrow clicks keep advancing
    function getCurrentIndex() {
        const step = getCardStep();
        return step > 0 ? Math.round((scroller.target ?? track.scrollLeft) / step) : 0;
    }

    function setActiveIndex(index) {
        points.forEach((point, i) => {
            point.classList.toggle('active', i === index);
            point.classList.toggle('passed', i < index);
        });
        if (prevBtn) prevBtn.disabled = index <= 0;
        if (nextBtn) nextBtn.disabled = index >= points.length - 1;
        if (counter) counter.textContent = (index + 1) + ' / ' + points.length;
    }

    function updateFromScroll() {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll <= 0) {
            setActiveIndex(0);
            return;
        }
        if (track.scrollLeft >= maxScroll - 1) {
            setActiveIndex(points.length - 1);
            return;
        }
        const step = getCardStep();
        const index = step > 0 ? Math.round(track.scrollLeft / step) : 0;
        setActiveIndex(Math.max(0, Math.min(points.length - 1, index)));
    }

    function goToIndex(index) {
        const clamped = Math.max(0, Math.min(points.length - 1, index));
        scroller.glideTo(clamped * getCardStep());
    }

    points.forEach((point, i) => {
        point.addEventListener('click', () => goToIndex(i));
    });

    if (prevBtn) prevBtn.addEventListener('click', () => goToIndex(getCurrentIndex() - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToIndex(getCurrentIndex() + 1));

    let scrollFrame = null;
    track.addEventListener('scroll', () => {
        if (scrollFrame !== null) return;
        scrollFrame = requestAnimationFrame(() => {
            updateFromScroll();
            scrollFrame = null;
        });
    }, { passive: true });
    window.addEventListener('resize', updateFromScroll);
    updateFromScroll();
}

initTimelineCarousel('experience-track', 'experience-timeline-points', '.experience-card', 'experience-prev', 'experience-next', 'experience-counter');
