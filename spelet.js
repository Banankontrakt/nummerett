:root {
    --ff: 'Times New Roman', Times, serif;
    --p: 18px/22px var(--ff);
    --p1: 24px/30px var(--ff);
    --h1: bold 64px/72px var(--ff);
    --colorbody: #2a2a2b;
    --colora: #b4901e;
    --colora2: #7f3004;
    --colorp: #f7efd3;
    --colors: #666669;
    --shadow: #00000030 0px 0px 10px 0px;
    --transition: 0.3s ease-in-out;
}
body {
    font:var(--p);
    font-family: var(--ff);
    color: var(--colors);
    margin: 0;
    background-image: url(/public/bilderavalon/mysticriver.jpg);
    background-color: var(--colorbody);
    background-size: 100% 100%; /* Gör bilden lika stor som elementet */
    background-repeat: no-repeat; /* Förhindrar att bilden upprepas */
    background-size: cover;
    background-position: center;
}
#grid-container {
    display: grid;
    grid-template-rows: 1fr auto auto 2fr;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    width: 100vw;
    height: 100vh;
}

#header {
    grid-column: 1 / 5; /* Sträcker sig över alla fyra kolumner */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    background-color: var(--colorbody);
    border-radius: 10px;
    height: fit-content;
}
h1{
    font: var(--h1);
    color: var(--colora);
    margin: 0 auto;
    text-align: center;
    width: auto;
}



#quest-bar {
    grid-column: 1 / 5; /* Täcker hela raden */
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 10px;
}

#vote-bar {
    grid-column: 1 / 5; /* Täcker hela raden */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;

}

#player-grid {
    grid-column: 1 / 5;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 10px;
    
}

.player-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--colorbody);
    padding: 10px;
    box-shadow: var(--shadow);
    border-radius: 10px;
}

.player {
    border: 1px solid #333;
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ccc;
    cursor: pointer;
    text-align: center;
}

#assignRolesBtn {
    background: var(--colora);
    color: var(--colorbody);
    padding: 20px 40px;
    display: inline-block;
    font-weight: bold;
    font-size: var(--p);
    border-radius: 10px;
    min-width: 100px;
    display: inline-block;
    margin-top: 20px;

    margin-bottom: 10px;
    box-shadow: var(--shadow);
    border: none;
}

.vote-buttons {
    display: flex;
    gap: 5px;
    margin-top: 10px;
    
}



.vote-yes, .vote-no {
    font-size: 0.8em;
    background: var(--colora);
    color: var(--colorbody);
    padding: 10px 20px;
    text-decoration: none;
    font-weight: bold;
    border-radius: 10px;
    min-width: 100px;
    display: inline-block;
    box-shadow: var(--shadow);
    border: none;
}

.final-decision-buttons {
    display: flex;
    gap: 5px;
    margin-top: 5px;
}

.final-yes, .final-no {
    font-size: 0.8em;
    padding: 10px 20px;
    border-radius: 10px;
    min-width: 100px;
    display: inline-block;
    box-shadow: var(--shadow);
    border: none;
}

.symbol {
    width: 20px;
    height: 20px;
    background-color: #FF6347;
    border-radius: 50%;
    position: absolute;

    transition: 0.5s;
}

.hidden-role {
    color: #ccc;
    font-style: italic;
    background-image: url(/public/bilderavalon/backsidecard.jpg);
    background-size: 100% 100%; /* Gör bilden lika stor som elementet */
    background-repeat: no-repeat; /* Förhindrar att bilden upprepas */
}

#quest-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.quest-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 14px;
    color: #fff;
    background-color: #999; /* Startfärg */
    transition: background-color 0.3s;
}

.quest-title {
    font-size: 12px;
}

.quest-number {
    font-size: 24px;
}

.quest-circle.success {
    background-color: #add8e6; /* Ljusblå vid "Klart" */
}

.quest-circle.fail {
    background-color: #8b0000; /* Mörkröd vid "Inte Klart" */
}

/* Markera aktiv omgångscirkel */
.quest-circle.active {
    border: 3px solid #ff6347; /* Liknande stil som symbolen */
}

#vote-counter {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 350px;       /* Gör rektangeln bred */
    height: 75px;      /* Ökad höjd för rektangeln */
    background-color: #333; /* Bakgrundsfärg för omröstningsräknaren */
    border-radius: 10px; /* Gör hörnen lite rundade */
    padding: 10px;
    gap: 15px;          /* Mellanrum mellan cirklarna */
}

.vote-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #ccc; /* Startfärg */
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: black;
}
.vote-circle.filled {
    background-color: #8b0000; /* Mörkröd färg när omröstningen blir "Nej" */
}

#vote5 {
    background-color: rgba(139, 0, 0, 0.5); /* Röd-transparent färg för femte cirkeln */
}

.follow-checkbox {
    appearance: none;
    width: 30px;
    height: 30px;
    border: 2px solid var(--colora);
    border-radius: 6px;
    background-color: var(--colorbody);
    cursor: pointer;
    transition: transform 0.2s, background-color 0.3s;
}

.follow-checkbox:hover {
    transform: scale(1.1); /* Gör checkboxen större när du hovrar */
}

.follow-checkbox:checked {
    background-color: var(--colora);
    border-color: var(--colora2);
    box-shadow: 0 0 5px var(--colora); /* Lägg till en ljusglöd när kryssad */
}
