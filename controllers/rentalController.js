const db = require("../db");

exports.checkoutItem = (req, res) => {
  const { user_name, item_id } = req.body;
  const checkoutDate = new Date().toISOString();

  db.run(
    `INSERT INTO rentals (user_name, item_id, checkout_date)
     VALUES (?, ?, ?)`,
    [user_name, item_id, checkoutDate],
    (err) => {
      if (err) return res.status(500).json(err);

      db.run(
        "UPDATE items SET status = 'Rented' WHERE id = ?",
        [item_id]
      );

      res.json({ message: "Item checked out successfully" });
    }
  );
};

exports.returnItem = (req, res) => {
  const { rental_id } = req.body;
  const returnDate = new Date();

  db.get(
    "SELECT * FROM rentals WHERE id = ?",
    [rental_id],
    (err, rental) => {
      if (!rental) return res.status(404).json({ error: "Rental not found" });

      const checkout = new Date(rental.checkout_date);
      const daysUsed = Math.floor(
        (returnDate - checkout) / (1000 * 60 * 60 * 24)
      );

      const lateDays = Math.max(0, daysUsed - 3);
      const fine = lateDays * 10;

      const healthLoss = Math.floor(Math.random() * 11) + 5;

      db.get(
        "SELECT * FROM items WHERE id = ?",
        [rental.item_id],
        (err, item) => {
          let newHealth = item.health - healthLoss;
          let newStatus = "Available";

          if (newHealth < 20) {
            newStatus = "Under Maintenance";
          }

          db.run(
            "UPDATE items SET health = ?, status = ? WHERE id = ?",
            [newHealth, newStatus, item.id]
          );

          db.run(
            `UPDATE rentals
             SET return_date = ?, fine = ?
             WHERE id = ?`,
            [returnDate.toISOString(), fine, rental_id]
          );

          res.json({
            message: "Item returned",
            fine,
            healthLoss,
            newHealth,
            status: newStatus
          });
        }
      );
    }
  );
};

exports.getHistory = (req, res) => {
  const { username } = req.params;

  db.all(
    `SELECT rentals.*, items.name
     FROM rentals
     JOIN items ON rentals.item_id = items.id
     WHERE user_name = ?`,
    [username],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};
