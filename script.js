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

    // Function to handle mobile clock
    function handleMobileClock() {
        if (window.innerWidth <= 768) {
            // On mobile: clone clock into nav-wrapper if not already there
            if (clockContainer && !navWrapper.querySelector('.clock-container')) {
                const clockClone = clockContainer.cloneNode(true);
                navWrapper.insertBefore(clockClone, navWrapper.firstChild);
            }
        } else {
            // On desktop: remove clock from nav-wrapper if it exists
            const clockInMenu = navWrapper.querySelector('.clock-container');
            if (clockInMenu) {
                clockInMenu.remove();
            }
        }
    }

    // Run on load
    handleMobileClock();

    // Run on resize
    window.addEventListener('resize', handleMobileClock);

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
