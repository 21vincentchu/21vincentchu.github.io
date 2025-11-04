// Remove scroll-based animations - sections will appear immediately
// No Intersection Observer needed since we only want header/nav animations

// Auto-hide nav on scroll down, show on scroll up
let lastScrollTop = 0;
const nav = document.querySelector('nav');
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(scrollTop - lastScrollTop) < 5) return; // Ignore tiny scrolls

    if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
        // Scrolling down & past threshold
        nav.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up or at top
        nav.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;
});

// Theme Toggle
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSwitch.checked = savedTheme === 'light';
    updateButtonAppearance();
    
    // Handle theme changes
    themeSwitch.addEventListener('change', () => {
        const newTheme = themeSwitch.checked ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateButtonAppearance();
    });
    
    function updateButtonAppearance() {
        const isLight = themeSwitch.checked;
        themeSwitch.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        themeSwitch.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
});

// Force scroll to top on page unload (before refresh)
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

// Prevent browser from restoring scroll position
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Force scroll to top immediately when script loads
document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
});

// Page wipe animation
window.addEventListener("load", () => {
    // Ensure we're at the top
    window.scrollTo(0, 0);
    
    const wipe = document.getElementById("page-wipe");
    if (wipe) {
        setTimeout(() => {
            wipe.remove();
        }, 1000); // Remove after animation completes
    }
});

