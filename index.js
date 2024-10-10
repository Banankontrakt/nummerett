// Funktion för att ladda en extern HTML-sida och visa den i huvudinnehållet
function loadPage(page) {
    var xhttp = new XMLHttpRequest();
    
    // När vi får svar från servern
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Innehållet som hämtas sätts in i main-content-diven
            document.getElementById("main-content").innerHTML = this.responseText;
        }
    };
    
    // Hämta innehållet från den valda sidan
    xhttp.open("GET", page, true);
    xhttp.send();
}


