const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let orders = [];

app.get("/", async (req, res) => {
  res.send(`hello world`);
});

app.post("/order", async (req, res) => {
  const data = req.body;
  orders.push(data);
  console.log("get order id: ", data.id);
  res.end();
});

app.post("/settle", async (req, res) => {
  const data = req.body;
  const id = data.id;

  orders = orders.filter(order => {
    return order.id !== id;
  });

  res.end();
});

app.get("/order/:id", async (req, res) => {
  const id = req.params.id;

  const ordersFiltered = orders.filter(order => {
    return order.id == id;
  });

  if (ordersFiltered.length === 0) {
    res.end();
    return;
  }

  res.send(ordersFiltered[0]);
  res.end();
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
