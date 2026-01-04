// ========================================
// INTERSECTION OBSERVERS & ANIMATIONS
// ========================================

// Fade-in animations for sections
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, {
    threshold: 0.1
});

// ========================================
// LOADING SCREEN ANIMATION
// ========================================
let loadingCounter = 0;
const percentageElement = document.getElementById('loading-percentage');
const circleProgress = document.getElementById('loading-circle-progress');
const loadingScreen = document.querySelector('.loading-screen');
const loadingDuration = 1500; // 1.5 seconds
const updateInterval = 20; // Update every 20ms for smooth animation
const increment = 100 / (loadingDuration / updateInterval);
const circumference = 2 * Math.PI * 54; // 2 * PI * radius

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

        // Fade out after reaching 100
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 300);
    }
}, updateInterval);

// Observe all sections and skill categories
document.querySelectorAll('section, .skill-category, .project-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Force dark mode always
document.documentElement.setAttribute('data-theme', 'dark');

// ========================================
// CLOCK FUNCTIONALITY
// ========================================
function updateClock() {
    const clockElement = document.getElementById('live-clock');
    if (!clockElement) return;

    // Create a date object for Central Time (US)
    const options = {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const timeString = formatter.format(new Date());

    // Display time without seconds
    clockElement.innerHTML = timeString;
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

// Update cursor position on mouse move
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Move dot instantly
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

// Animate ring with delay (smooth follow effect)
function animateRing() {
    // Lerp (linear interpolation) for smooth following
    ringX += (mouseX - ringX) * 0.3;
    ringY += (mouseY - ringY) * 0.3;
    
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
// SCROLL-TRIGGERED FADE-IN ANIMATIONS
// ========================================

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.02,
    rootMargin: '0px 0px 0px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Add animate class if not in view initially
        if (!entry.isIntersecting && !entry.target.classList.contains('fade-in-animate')) {
            entry.target.classList.add('fade-in-animate');
        }
        
        // Add visible class when scrolled into view
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
        }
    });
}, observerOptions);

// Observe all sections
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    scrollObserver.observe(section);
});

// Observe experience cards
const experienceCards = document.querySelectorAll('.experience-card');
experienceCards.forEach(card => {
    scrollObserver.observe(card);
});

// Observe project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    scrollObserver.observe(card);
});


// ========================================
// PARALLAX BLOBS
// ========================================

const blobContainer = document.querySelector('.blob-container');

let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            
            // Move the entire blob container for parallax effect
            if (blobContainer) {
                blobContainer.style.transform = 'translateY(' + scrolled * 0.15 + 'px)';
            }
            
            ticking = false;
        });
        
        ticking = true;
    }
});

// ========================================
// BACKGROUND COLOR SHIFT
// ========================================

const bodyElement = document.body;

const sectionColors = {
    'experience': '#1a1d23',
    'education': '#1c1f25',
    'skills': '#1a1e26',
    'projects': '#1b1d24',
    'photos': '#1a1c23',
    'contact': '#191c22'
};

const colorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionColors[sectionId]) {
                bodyElement.style.backgroundColor = sectionColors[sectionId];
            }
        }
    });
}, {
    threshold: 0.5
});

// Observe sections for color changes
Object.keys(sectionColors).forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
        colorObserver.observe(section);
    }
});


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

