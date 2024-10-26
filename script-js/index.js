const boxes = document.querySelectorAll('.box');

window.addEventListener('scroll', checkBoxes); // När vi skrollar körs funktionen

checkBoxes(); // Kör funktionen direkt när sidan laddas

function checkBoxes() {
    const triggerBottom = window.innerHeight / 5 * 4; // Triggpunkt vid 80% av fönsterhöjden

    boxes.forEach((box) => {
        const boxTop = box.getBoundingClientRect().top; // Hämta boxens topposition i relation till visningsområdet
        if (boxTop < triggerBottom) {
            box.classList.add('show'); // Lägg till 'show'-klassen om boxen når triggpunkten
        } else {
            box.classList.remove('show'); // Ta bort 'show'-klassen om den inte längre är synlig
        }
    });
}
