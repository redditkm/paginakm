require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Habilitar CORS para frontend
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/api/zip", require("./routes/zip"));
app.use("/api", require("./routes/auth"));
app.use("/api/blogs", require("./routes/blogs"));
app.use("/api/leads", require("./routes/leads"));
app.use("/api/festividades", require("./routes/festividades"));


// Puerto
const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on port ${port}`);
});