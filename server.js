const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const app = express();
const { Pool } = require("pg");

//Configuring Body Parser MiddleWare
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//set a view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Configuring the database details
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "test0",
  user: "postgres",
  password: "postgres",
});

//Home Page
app.get("/", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM recipes");
    res.render("index", { recipes: result.rows });

    client.release();
    res.end();
  } catch (err) {
    console.error("Error Ececuting the query: ", err);
    res.status(500).send("Internal Server Error");
    res.end();
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await pool.query("DELETE FROM recipes WHERE id = $1;", [
      id,
    ]);
    res.status(200).json("Entry was deleted!");
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Internal Server Error");
  }
});

app.post("/edit", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "UPDATE recipes SET name = $1, required = $2, how = $3 WHERE id = $4",
      [req.body.name, req.body.required, req.body.how, req.body.id]
    );
    client.release();
    console.log("Request Made");
    res.redirect("/");
    res.end();
  } catch (err) {
    console.error(err.message);
    res.end();
  } finally {
    res.end();
  }
});

app.post("/add", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO recipes(name, required, how) VALUES($1, $2, $3)",
      [req.body.name, req.body.required, req.body.how]
    );
    client.release();
    res.redirect("/");
    res.end();
  } catch (err) {
    console.error("Error Ececuting the query: ", err);
    res.status(500).send("Internal Server Error");
    res.end();
  }
});
app.get("/layout", (req, res) => {
  res.render("layout");
  res.end();
});
//404 Page
app.use(function (req, res) {
  res.status(404).render("404");
});

//Set Public Foler
app.use(express.static(path.join(__dirname, "public")));

//Server
let port = 3003;
app.listen(port, () => console.log(`Succefully setup on port ${port}`));
