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
