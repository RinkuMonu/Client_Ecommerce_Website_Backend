import express from "express";
import fs from "fs";

const app = express();

app.get("/test", (req, res) => {
  const html = fs.readFileSync("./zaakpay_test.html", "utf8");
  res.send(html);
});

app.listen(5000, () => {
  console.log("✅ Server running — open http://localhost:5000/test in your browser");
});
