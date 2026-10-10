# Avanon – fem spelare online

En enkel variant av social deduktion med tre goda och två onda. Spelarna
ansluter med spelarnamn och en sex tecken lång lobbykod. Ingen databas behövs.

## Render Free

1. Skapa en **Web Service** på https://dashboard.render.com/ och koppla GitHub.
2. Välj `Banankontrakt/nummerett` och grenen med multiplayerändringarna.
3. Välj **Node**, region **Frankfurt** och instanstyp **Free**.
4. Build Command: `npm ci`. Start Command: `npm start`.
5. Health Check Path: `/health`. Skapa tjänsten.
6. Öppna tjänstens `onrender.com`-adress och klicka på **Spela tillsammans**.

Alternativt kan `render.yaml` användas som en Render Blueprint. Kontrollera att
planen är Free innan du skapar tjänsten. Ingen betalad databas ska läggas till.

## Spela

En person skapar en lobby, fyra andra ansluter med egna namn och samma kod.
Värden startar när alla fem är anslutna. Ledaren väljer rätt antal deltagare,
alla röstar om laget, och deltagarna lämnar ett hemligt uppdragsbeslut.
Goda måste lyckas, onda får sabotera. De onda får veta vem deras medspelare är.
Tre lyckade uppdrag vinner för de goda. Tre misslyckade uppdrag eller fem
avvisade lag i följd vinner för de onda. Detta inkluderar inte specialroller
som Merlin eller en avslutande lönnmördarfunktion.

Vid omladdning återansluts spelaren i samma flik med en privat sessionsnyckel.
För att prova flera spelare i en webbläsare, använd separata flikar utan att
duplicera en redan ansluten flik, eller separata webbläsarprofiler.

## Begränsningar

Lobbyn sparas i serverns minne. En omstart, ny publicering eller nedstängning
hos Render raderar lobbyn och spelet. Render Free somnar efter 15 minuter utan
inkommande trafik och kan ta ungefär en minut att vakna. En frånkopplad spelares
plats reserveras så att de kan återansluta; ett pågående spel väntar på dem.
Helt frånkopplade lobbyer tas bort efter ungefär en timme när servern körs.
Sessionsnyckeln är spelarens åtkomst: dela inte den. Lobbykoden är bara för att
ansluta som en ny spelare. Diskutera via egen röstkanal eller på samma plats.

## Lokalt

Node.js 22 eller senare. Kör `npm ci`, `npm test`, sedan `npm start`.
Öppna http://localhost:3000. Render anger `PORT` automatiskt.
