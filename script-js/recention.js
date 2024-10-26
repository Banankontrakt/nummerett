const stars = document.querySelectorAll('.rating input');
stars.forEach(star => {
    star.addEventListener('change', () => {
        const ratingValue = star.id.replace('star', '');
        alert(`Du gav ${ratingValue} stjärnor`);
    });
});