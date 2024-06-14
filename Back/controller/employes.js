const { pool } = require("../database");

const addEmployes = async (req, res) => {
  const { contacts } = req.body; // Assuming the structure matches what React sends

  const insertQuery = `
      INSERT INTO employes (name, surname, designation, joining_date, last_date, status, DOB, personal_email)
      VALUES ?
    `;

  const values = contacts.map((contact) => {
    // Check and replace empty dates with null
    return [
      contact.name,
      contact.surname,
      contact.designation,
      contact.joining_date || null,
      contact.last_date || null,
      contact.status,
      contact.DOB || null,
      contact.personal_email,
    ];
  });

  try {
    await new Promise((resolve, reject) => {
      pool.query(insertQuery, [values], (error, results) => {
        if (error) {
          console.error("Error executing query:", error);
          reject(error);
        } else {
          resolve();
        }
      });
    });

    res.json({ message: "Employees added successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const allEmployes = async (req, res) => {
  const { name, surname } = req.query;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return connection.release();
      }

      let query = `SELECT * FROM employes`;

      let filterConditions = [];

      if (name && Array.isArray(name)) {
        const nameConditions = name.map((n) => connection.escape(`%${n}%`));
        if (nameConditions.length > 0) {
          filterConditions.push(
            `name LIKE ${nameConditions.join(" OR name LIKE ")}`
          );
        }
      } else if (name) {
        filterConditions.push(`name LIKE ${connection.escape(`%${name}%`)}`);
      }

      if (surname && Array.isArray(surname)) {
        const surnameConditions = surname.map((s) =>
          connection.escape(`%${s}%`)
        );
        if (surnameConditions.length > 0) {
          filterConditions.push(
            `surname LIKE ${surnameConditions.join(" OR surname LIKE ")}`
          );
        }
      } else if (surname) {
        filterConditions.push(
          `surname LIKE ${connection.escape(`%${surname}%`)}`
        );
      }

      if (filterConditions.length > 0) {
        query += ` WHERE ${filterConditions.join(" AND ")}`;
      }

      query += ` ORDER BY id`;

      connection.query(query, (error, results) => {
        if (error) {
          console.error("Error executing query:", error);
          return connection.rollback(() => {
            res.status(500).json({ error: "Internal Server Error" });
            connection.release();
          });
        }

        connection.commit((err) => {
          if (err) {
            console.error("Error committing transaction:", err);
            return connection.rollback(() => {
              res.status(500).json({ error: "Internal Server Error" });
              connection.release();
            });
          }
          connection.release();
          res.status(200).json({ products: results });
        });
      });
    });
  });
};

const editEmployes = async (req, res) => {
  const updateDealer = `
    UPDATE employes
    SET
    name = ?,
    surname = ?,
    designation = ?,
    joining_date = ?,
    last_date = ?,
    status = ?,
    DOB = ?,
    personal_email = ?
    WHERE
      id = ?;`;

  const values = [
    req.body.name,
    req.body.surname,
    req.body.designation,
    req.body.joining_date === "" ? null : req.body.joining_date,
    req.body.last_date === "" ? null : req.body.last_date,
    req.body.status,
    req.body.DOB === "" ? null : req.body.DOB,
    req.body.personal_email,
    req.params.id,
  ];

  pool.query(updateDealer, values, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.json(results);
  });
};

const viewEmployes = async (req, res) => {
  const dealerQuery = `
    SELECT  *
    FROM employes
    WHERE id = ?
  `;

  pool.query(dealerQuery, [req.params.id], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    //console.log("Dealer details:", results);
    res.status(200).json(results);
  });
};

const name = async (req, res) => {
  // Use the promisified pool.query function
  const dealerQuery = `
      SELECT distinct name FROM employes
    `;

  pool.query(dealerQuery, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.status(200).json(results);
  });
};

const surname = async (req, res) => {
  // Use the promisified pool.query function
  const dealerQuery = `
      SELECT distinct surname FROM employes
    `;

  pool.query(dealerQuery, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.status(200).json(results);
  });
};

const deleteEmployes = (req, res) => {
  const query = "DELETE FROM employes WHERE name = ? AND surname = ?";
  const debitorName = req.body.name;
  const debitorSurname = req.body.surname;

  pool.query(query, [debitorName, debitorSurname], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        error: "Not Found: No matching debitor found for deletion",
      });
    }

    res.json({ message: "Debitor deleted successfully" });
  });
};

const importExcel = async(req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert Excel data to JSON format
    const excelData = excelToJson({
      source: req.file.buffer, // Uploaded file buffer
      header: { rows: 1 }, // First row contains headers
      columnToKey: { A: "name", B: "surname", C: "designation", D: "joining_date", E: "last_date", F: "status", G: "DOB", H: "personal_email" }
    });

    // Process excelData as per your application's logic
    // Example: Save to database, update existing records, etc.

    res.json({ message: "File uploaded successfully", data: excelData });
  } catch (error) {
    console.error("Error uploading Excel file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  addEmployes,
  allEmployes,
  editEmployes,
  viewEmployes,
  name,
  surname,
  deleteEmployes,
  importExcel
};
