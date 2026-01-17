const db = require("../db");

exports.repairItem = (req, res) => {
  const { id } = req.params;

  db.run(
    "UPDATE items SET health = 100, status = 'Available' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Item repaired successfully" });
    }
  );
};

