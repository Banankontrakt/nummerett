let players = []; // Lista över spelare
let maxPlayers = 5; // Maximalt antal spelare, kan justeras

// Funktion för inloggning
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        alert(`Inloggad som ${username}`);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('lobby-creation').style.display = 'block';
    } else {
        alert("Vänligen fyll i användarnamn och lösenord.");
    }
}

// Funktion för att skapa en lobby
function createLobby() {
    maxPlayers = document.getElementById('playerCount').value;
    document.getElementById('lobby-creation').style.display = 'none';
    document.getElementById('waiting-section').style.display = 'block';

    // Initialisera räknare och visa startvärde
    updatePlayerCount();
}

// Funktion för att uppdatera spelarantalet
function updatePlayerCount() {
    const playerCounter = document.getElementById('playerCounter');
    playerCounter.innerHTML = `${players.length}/${maxPlayers}`;
}

// Simulera att spelare ansluter till lobbyn
function addPlayerToLobby(playerName) {
    if (players.length < maxPlayers) {
        players.push(playerName);
        const playerList = document.getElementById('playerList');
        const li = document.createElement('li');
        li.textContent = playerName;
        playerList.appendChild(li);

        // Uppdatera spelarantalet
        updatePlayerCount();

        if (players.length >= maxPlayers) {
            alert("Lobbyn är full. Spelet kan nu startas!");
            // Här kan du lägga till logik för att starta spelet när alla är anslutna
        }
    }
}

// Simulera att nya spelare ansluter med jämna mellanrum
setInterval(() => {
    const newPlayerName = `Spelare ${players.length + 1}`;
    if (players.length < maxPlayers) {
        addPlayerToLobby(newPlayerName);
    }
}, 5000); // Var 5:e sekund ansluter en ny spelare