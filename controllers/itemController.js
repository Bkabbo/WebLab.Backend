const db = require("../db");

exports.addItem = (req, res) => {
  const { name } = req.body;

  db.run(
    "INSERT INTO items (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ message: "Item added", itemId: this.lastID });
    }
  );
};

exports.getAvailableItems = (req, res) => {
  db.all(
    "SELECT * FROM items WHERE status = 'Available'",
    [],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};
