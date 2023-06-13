// ===============
const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const dbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running....!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(2);
  }
};

const convertDbObjectToResponseObject = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  };
};
dbServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
          SELECT
              *
          FROM
              cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const dbPostQuery = `
    INSERT INTO
        cricket_team (player_name, jersey_number, role)
    VALUES
        (
            '${playerName}',
            ${jerseyNumber},
            '${role}'
            );`;
  const dbResponse = await db.run(dbPostQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const dbPlayerQuery = `
          SELECT
              *
          FROM
              cricket_team
          WHERE
              player_id = ${playerId};`;
  const result = await db.get(dbPlayerQuery);
  response.send(convertDbObjectToResponseObject(result));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name = ${playerName},
      jersey_number = ${jerseyNumber},
      role = ${role},
    WHERE
      player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Book Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
          DELETE FROM
              cricket_team
          WHERE
              player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
