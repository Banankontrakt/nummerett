// Progress bar functionality
window.addEventListener('scroll', () => {
    const scrollWatcher = document.querySelector('.scroll-watcher');
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = window.pageYOffset;
    const scrollPercentage = scrollTop / scrollHeight;
    
    scrollWatcher.style.transform = `scaleX(${scrollPercentage})`;
});

// Intersection Observer for fade-in and fade-out
const sections = document.querySelectorAll('.content-section');
const images = document.querySelectorAll('.content-image');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.classList.remove('fade-out');
        } else {
            // Fade out when scrolling past
            entry.target.classList.remove('visible');
            entry.target.classList.add('fade-out');
        }
    });
}, {
    threshold: 0.1
});

// Observe each section and image
sections.forEach(section => {
    observer.observe(section);
});
images.forEach(image => {
    observer.observe(image);
});
