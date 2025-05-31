// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.1 });

// Observe all elements for scroll animations
document.querySelectorAll('section, .skill-category, .project-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Theme Toggle
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
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

window.addEventListener("load", () => {
  const wipe = document.getElementById("page-wipe");
  if (wipe) {
    setTimeout(() => {
      wipe.remove();
    }, 1300); // just after animation ends
  }
});

