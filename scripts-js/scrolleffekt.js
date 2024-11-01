// Intersection Observer for fade-in and fade-out
const sections = document.querySelectorAll('.text-content');
const images = document.querySelectorAll('.image-content');

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
    threshold: 0.7
});

// Observe each section and image
sections.forEach(section => {
    observer.observe(section);
});
images.forEach(image => {
    observer.observe(image);
});