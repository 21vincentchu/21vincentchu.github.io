// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, {
    threshold: 0.1
});

// Observe all sections and skill categories
document.querySelectorAll('section, .skill-category, .project-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});


// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Update button appearance based on current theme
    updateButtonAppearance();
    
    // Toggle theme when button is clicked
    themeSwitch.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateButtonAppearance();
    });
    
    // Update button icon based on current theme
    function updateButtonAppearance() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (currentTheme === 'light') {
            themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
            themeSwitch.title = 'Switch to Dark Mode';
        } else {
            themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
            themeSwitch.title = 'Switch to Light Mode';
        }
    }
    
});