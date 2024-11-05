document.getElementById("assignRolesBtn").addEventListener("click", () => {
    resetGame(); // Återställ spelet helt
    assignRoles(); // Tilldela nya roller och starta om
});

document.getElementById("moveSymbolBtn").addEventListener("click", () => {
    moveSymbol();
    resetVotes();
});

let players = [
    { id: "player1", role: "", hasSymbol: false, roleVisible: false },
    { id: "player2", role: "", hasSymbol: false, roleVisible: false },
    { id: "player3", role: "", hasSymbol: false, roleVisible: false },
    { id: "player4", role: "", hasSymbol: false, roleVisible: false },
    { id: "player5", role: "", hasSymbol: false, roleVisible: false }
];
let currentPlayerIndex = 0;
let currentQuestIndex = 1; // Spåra aktuell cirkel (omgång)
let votes = { yes: 0, no: 0 };
let finalVotes = { yes: 0, no: 0 };
let blueCount = 0; // Räknare för ljusblå cirklar (goda)
let redCount = 0;  // Räknare för mörkröda cirklar (onda)
let noVoteCount = 0; // Räknare för "Nej"-omröstningar


// Event listeners för "Ja" och "Nej" knappar
document.querySelectorAll(".vote-yes").forEach(button => {
    button.addEventListener("click", () => castVote("yes", button.getAttribute("data-player")));
});
document.querySelectorAll(".vote-no").forEach(button => {
    button.addEventListener("click", () => castVote("no", button.getAttribute("data-player")));
});

// Event listeners för "Klart" och "Inte Klart" knappar
document.querySelectorAll(".final-yes").forEach(button => {
    button.addEventListener("click", () => castFinalVote("yes", button.getAttribute("data-player")));
});
document.querySelectorAll(".final-no").forEach(button => {
    button.addEventListener("click", () => castFinalVote("no", button.getAttribute("data-player")));
});

function assignRoles() {
    resetRoles();

    let roles = ["ond", "ond", "god", "god", "god"];
    roles = shuffleArray(roles);

    players.forEach((player, index) => {
        player.role = roles[index];
        const playerDiv = document.getElementById(player.id);
        playerDiv.classList.add("hidden-role");
        playerDiv.innerText = `Spelare ${index + 1}`;
        playerDiv.onclick = () => toggleRoleVisibility(player);
    });

    assignSymbol();
    setActiveQuestCircle(); // Markera första cirkeln som aktiv
}

function moveSymbol() {
    assignSymbol();
    resetVotes(); // Återställ röstning efter symbolflytt
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function assignSymbol() {
    players.forEach(player => {
        player.hasSymbol = false;
        const symbol = document.querySelector(`#${player.id} .symbol`);
        if (symbol) {
            symbol.remove();
        }
    });

    const currentPlayer = players[currentPlayerIndex];
    currentPlayer.hasSymbol = true;

    const playerDiv = document.getElementById(currentPlayer.id);
    const symbolDiv = document.createElement("div");
    symbolDiv.classList.add("symbol");
    playerDiv.appendChild(symbolDiv);

    document.getElementById("message").innerText = `Spelare ${currentPlayer.id.slice(-1)} har nu symbolen och kan välja spelare.`;

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
}

// Växla synligheten för en spelares roll
function toggleRoleVisibility(player) {
    const playerDiv = document.getElementById(player.id);
    player.roleVisible = !player.roleVisible;

    if (player.roleVisible) {
        playerDiv.innerText = `Spelare ${player.id.slice(-1)} - ${player.role}`;
        playerDiv.classList.remove("hidden-role");
    } else {
        playerDiv.innerText = `Spelare ${player.id.slice(-1)}`;
        playerDiv.classList.add("hidden-role");
    }

    // Lägg tillbaka symbolen om spelaren har den
    if (player.hasSymbol) {
        const symbolDiv = document.createElement("div");
        symbolDiv.classList.add("symbol");
        playerDiv.appendChild(symbolDiv);
    }
}

// Hantera röstning (Ja/Nej)
function castVote(voteType, playerId) {
    votes[voteType]++;
    const totalVotes = votes.yes + votes.no;

    // Kontrollera om alla spelare har röstat
    if (totalVotes === players.length) {
        evaluateVotes();
    }
}

// Utvärdera resultatet av röstningen
function evaluateVotes() {
    const resultText = votes.no > votes.yes
        ? "Majoritet nej. Symbolen flyttas och kryssrutorna tas bort."
        : "Majoritet ja. Spelaren kan ta med de valda spelarna. Välj Klart eller Inte Klart.";

    document.getElementById("message").innerText = resultText;

    // Om majoritet är nej, flytta symbolen och ta bort kryssrutorna
    if (votes.no > votes.yes) {
        moveSymbol();
        resetFollowCheckboxes();
    } else {
        enableFinalDecisionButtons();
    }

    resetVotes(); // Återställ röster för nästa runda
}

/*         här och ned nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnyyyyyyyyyyyyyy    */
function evaluateVotes() {
    const resultText = votes.no > votes.yes
        ? "Majoritet nej. Symbolen flyttas och kryssrutorna tas bort."
        : "Majoritet ja. Spelaren kan ta med de valda spelarna. Välj Klart eller Inte Klart.";

    document.getElementById("message").innerText = resultText;

    if (votes.no > votes.yes) {
        // Öka och hantera "Nej"-rösträknaren
        noVoteCount++;
        updateVoteCounter(); // Uppdatera omröstningsräknaren visuellt

        // Kontrollera om spelet ska avslutas efter fem "Nej"-omröstningar
        if (noVoteCount >= 5) {
            displayWinnerMessage("De onda har vunnit! Spelet avslutades på grund av fem 'Nej'-omröstningar.");
            disableGame();
            return;
        }

        moveSymbol();
        resetFollowCheckboxes();
    } else {
        enableFinalDecisionButtons(); // Aktivera knapparna för "Klart" och "Inte Klart"
    }

    resetVotes(); // Återställ röster för nästa runda
}

function updateVoteCounter() {
    console.log(`Updating vote counter for 'Nej' count: ${noVoteCount}`); // Felsökningsutskrift
    const voteCircle = document.getElementById(`vote${noVoteCount}`);
    if (voteCircle) {
        console.log(`Marking vote circle: vote${noVoteCount}`); // Bekräftar vilken cirkel som markeras
        voteCircle.classList.add("filled");
        voteCircle.style.backgroundColor = "#8b0000"; // Mörkröd färg
    } else {
        console.error(`Could not find circle with id: vote${noVoteCount}`);
    }
}



/*         här och upp     */

// Aktivera knapparna "Klart" och "Inte Klart" endast för valda spelare
function enableFinalDecisionButtons() {
    document.querySelectorAll(".follow-checkbox").forEach((checkbox, index) => {
        if (checkbox.checked) {
            document.querySelector(`.final-yes[data-player="${index + 1}"]`).disabled = false;
            document.querySelector(`.final-no[data-player="${index + 1}"]`).disabled = false;
        } else {
            document.querySelector(`.final-yes[data-player="${index + 1}"]`).disabled = true;
            document.querySelector(`.final-no[data-player="${index + 1}"]`).disabled = true;
        }
    });
}

// Hantera slutgiltiga beslut (Klart/Inte Klart)
function castFinalVote(voteType, playerId) {
    finalVotes[voteType]++;
    const totalFinalVotes = finalVotes.yes + finalVotes.no;

    // Kontrollera om alla som är markerade har röstat
    const totalChecked = document.querySelectorAll(".follow-checkbox:checked").length;
    if (totalFinalVotes === totalChecked) {
        evaluateFinalVotes();
    }
}

// Utvärdera slutgiltiga röstresultat och ändra cirkelfärgen
function evaluateFinalVotes() {
    const resultText = finalVotes.no > 0
        ? "Majoritet Inte Klart. Spelet fortsätter utan att slutföras."
        : "Majoritet Klart. Spelet är nu klart.";
    document.getElementById("message").innerText = resultText;

    // Ändra färg på aktuell cirkel baserat på resultatet och flytta till nästa
    const currentCircle = document.getElementById(`circle${currentQuestIndex}`);
    currentCircle.classList.remove("active");

    // Kontrollera röstresultat och ändra färg
    if (finalVotes.no > 0) {
        currentCircle.classList.add("fail"); // Gör cirkeln mörkröd vid "Inte Klart"
        currentCircle.style.backgroundColor = "#8b0000"; // Mörkröd färg
        redCount++; // Öka mörkröd räknare
    } else {
        currentCircle.classList.add("success"); // Gör cirkeln ljusblå vid "Klart"
        currentCircle.style.backgroundColor = "#add8e6"; // Ljusblå färg
        blueCount++; // Öka ljusblå räknare
    }

    checkWinCondition(); // Kontrollera om något lag har vunnit

    // Flytta symbolen till nästa spelare och markera nästa cirkel som aktiv
    currentQuestIndex++;
    if (currentQuestIndex <= 5) {
        setActiveQuestCircle();
    }
    moveSymbol();
    resetFinalVotes();
    resetFollowCheckboxes();
}


// Funktion för att kontrollera om något lag har vunnit
function checkWinCondition() {
    if (redCount >= 3) {
        displayWinnerMessage("De onda har vunnit!");
        disableGame();
    } else if (blueCount >= 3) {
        displayWinnerMessage("De goda har vunnit!");
        disableGame();
    }
}

// Funktion för att visa vinnarmeddelandet
function displayWinnerMessage(message) {
    const messageElement = document.getElementById("winner-message");
    messageElement.innerText = message;
    messageElement.style.fontSize = "24px";    // Gör texten större
    messageElement.style.color = "green";      // Ge texten en distinkt färg
    messageElement.style.fontWeight = "bold";  // Gör texten fet
    messageElement.style.textAlign = "center"; // Centrera meddelandet
    messageElement.style.marginTop = "200px"; // Flyttar meddelandet nedåt
}

// Inaktivera spelet när ett lag har vunnit, men håll knappen "Tilldela Roller" aktiv
function disableGame() {
    document.querySelectorAll("button").forEach(button => {
        if (button.id !== "assignRolesBtn") {
            button.disabled = true; // Inaktivera alla knappar utom "Tilldela Roller"
        }
    });
}

// Återställ spelet helt när "Tilldela Roller" trycks
function resetGame() {
    blueCount = 0;
    redCount = 0;
    noVoteCount = 0; // Återställ "Nej"-omröstningsräknaren
    currentQuestIndex = 1;
    
    document.getElementById("winner-message").innerText = ""; // Rensa vinnarmeddelandet
    document.getElementById("message").innerText = ""; // Rensa meddelandefältet

    // Återställ alla quest-cirklar till startfärg och ta bort klasserna
    document.querySelectorAll(".quest-circle").forEach(circle => {
        circle.classList.remove("active", "fail", "success");
        circle.style.backgroundColor = "#999"; // Startfärg
    });

    // Återställ omröstningsräknaren
    document.querySelectorAll(".vote-circle").forEach(circle => {
        circle.classList.remove("filled");
        circle.style.backgroundColor = circle.id === "vote5" 
            ? "rgba(139, 0, 0, 0.5)"  // Röd-transparent för femte cirkeln
            : "#ccc";                 // Startfärg för övriga
    });

    setActiveQuestCircle(); // Markera första omgångscirkeln som aktiv

    // Aktivera alla knappar utom "Klart" och "Inte Klart"
    document.querySelectorAll("button").forEach(button => {
        if (!button.classList.contains("final-yes") && !button.classList.contains("final-no")) {
            button.disabled = false;
        }
    });

    resetFinalVotes();        // Inaktivera "Klart" och "Inte Klart" knappar
    resetRoles();             // Återställ roller och symboler
    resetVotes();             // Återställ omröstning
    resetFollowCheckboxes();  // Återställ "Följa med"-rutorna
}



// Återställ slutgiltiga röstningar och "Klart/Inte Klart" knappar
function resetFinalVotes() {
    finalVotes = { yes: 0, no: 0 };
    document.querySelectorAll(".final-yes, .final-no").forEach(button => {
        button.disabled = true;
    });
}

// Återställ "Följa med"-rutorna
function resetFollowCheckboxes() {
    document.querySelectorAll(".follow-checkbox").forEach(checkbox => {
        checkbox.checked = false;
        checkbox.disabled = false;
    });
}

// Återställ omröstningen för ny omgång
function resetVotes() {
    votes = { yes: 0, no: 0 };
}

// Återställ roller och symboler
function resetRoles() {
    players.forEach((player, index) => {
        player.role = "";
        player.hasSymbol = false;
        player.roleVisible = false;
        const playerDiv = document.getElementById(player.id);
        playerDiv.innerText = `Spelare ${index + 1}`;
        playerDiv.classList.remove("hidden-role");

        const symbol = document.querySelector(`#${player.id} .symbol`);
        if (symbol) {
            symbol.remove();
        }
        playerDiv.onclick = null;
    });

    currentPlayerIndex = 0;
    resetVotes();
    resetFollowCheckboxes();
}

// Markera aktuell cirkel som aktiv
function setActiveQuestCircle() {
    document.querySelectorAll(".quest-circle").forEach(circle => {
        circle.classList.remove("active");
    });
    const currentCircle = document.getElementById(`circle${currentQuestIndex}`);
    if (currentCircle) {
        currentCircle.classList.add("active");
    }
}
