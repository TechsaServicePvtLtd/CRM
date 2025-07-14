const { pool } = require("../database");

const showDeal = (req, res) => {
  const {
    customerEntities,
    licenseFrom,
    licenseTo,
    type,
    status,
    dateFilterType,
    fromDate,
    toDate,
  } = req.query;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        connection.release();
        return res.status(500).json({ error: "Internal Server Error" });
      }

      let query = `
        SELECT id, customer_entity, Creation_Date, End_date, Description, OEM, Status, created_at, update_at
        FROM dealregistration
      `;

      const filterConditions = [];

      // Filter: customerEntities
      if (customerEntities && customerEntities.length > 0) {
        const customerEntitiesList = customerEntities
          .map((entity) => `'${entity}'`)
          .join(",");
        filterConditions.push(`customer_entity IN (${customerEntitiesList})`);
      }

      // Filter: OEM
         if (type && Array.isArray(type)) {
        const TypeConditions = type.map(type => `OEM LIKE '%${type}%'`);
        if (TypeConditions.length > 0) {
          filterConditions.push(`(${TypeConditions.join(" OR ")})`);
        }
      } else if (type) {
        filterConditions.push(`OEM LIKE '${type}'`);
      }


      // Filter: status
      if (status && Array.isArray(status)) {
        const statusConditions = status.map(s => `Status LIKE '%${s}%'`);
        filterConditions.push(`(${statusConditions.join(" OR ")})`);
      } else if (status) {
        filterConditions.push(`Status LIKE '%${status}%'`);
      }

     if (licenseFrom && licenseTo) {
        filterConditions.push(`Creation_Date >= '${licenseFrom}' OR End_date <= '${licenseTo}'`);
      } else if (licenseFrom) {
        filterConditions.push(`Creation_Date >= '${licenseFrom}'`);
      } else if (licenseTo) {
        filterConditions.push(`End_date <= '${licenseTo}'`);
      }

      if (dateFilterType && fromDate && toDate) {
        if (dateFilterType === "equal") {
          filterConditions.push(
            `DATE(Creation_Date) = '${fromDate}' AND DATE(End_date) = '${toDate}'`
          );
        } else if (dateFilterType === "before") {
          filterConditions.push(
            `DATE(Creation_Date) < '${fromDate}' AND DATE(End_date) < '${toDate}'`
          );
        } else if (dateFilterType === "after") {
          filterConditions.push(
            `DATE(Creation_Date) > '${fromDate}' AND DATE(End_date) > '${toDate}'`
          );
        } else if (dateFilterType === "between") {
          filterConditions.push(
            `DATE(Creation_Date) BETWEEN '${fromDate}' AND '${toDate}'`
          );
        }
      }

      // Final WHERE clause
      if (filterConditions.length > 0) {
        query += ` WHERE ${filterConditions.join(" AND ")}`;
      }

      query += ` ORDER BY id`;

      connection.query(query, (error, results) => {
        if (error) {
          console.error("Error executing query:", error);
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: "Internal Server Error" });
          });
        }

        connection.commit((err) => {
          if (err) {
            console.error("Error committing transaction:", err);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Internal Server Error" });
            });
          }

          connection.release();
          res.status(200).json({ products: results });
        });
      });
    });
  });
};

const addDeal = async (req, res) => {
  const addDealer = `
    INSERT INTO dealregistration
    (customer_entity,	Creation_Date,	End_date,	Description,	OEM,	Status,	created_at)
    VALUES (?, ?, ?, ?, ?, ?,now())
  `;

  // Extract customer Entity from the request body
  const { 	customer_entity,	Creation_Date,	End_date,	Description,	OEM,	Status,	created_at } = req.body;


  try {

    const values = [	customer_entity,	Creation_Date,	End_date,	Description,	OEM,	Status,	created_at];

    await new Promise((resolve, reject) => {
      pool.query(addDealer, values, (error, results) => {
        if (error) {
          console.error("Error executing query:", error);
          reject(error);
        } else {
          //console.log("Contact added successfully:", results);
          resolve();
        }
      });
    });

    res.json({ message: "Customer added successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteDeal = (req, res) => {
  const { id } = req.body;

  const deleteQuery = `
    DELETE FROM dealregistration
    WHERE id = ?
  `;

//console.log("Deleting deal with ID:", id);

  pool.query(deleteQuery, [id], (error, results) => {
    if (error) {
      console.error("Error executing delete query:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Deal not found" });
    }

    res.status(200).json({ message: "Deal deleted successfully" });
  });
};

const editDeal = (req, res) => {
  const updateDealer = `
    UPDATE dealregistration
    SET
    customer_entity = ?,
    Creation_Date = ?,
    End_date = ?,
    Description = ?,
    OEM = ?,
    Status = ?,
    update_at = now()
    WHERE
      id = ?;`;

  const values = [
    req.body.customer_entity,
    req.body.Creation_Date,
    req.body.End_date,
    req.body.Description,
    req.body.OEM,
    req.body.Status,
    req.params.id,
  ];


    console.log("Updating dealer with values:", values);

  pool.query(updateDealer, values, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    //console.log("Updated dealer:", results);
    res.json(results);
  });
};

const showOneDeal = async (req, res) => {
  const dealerQuery = `
    SELECT 	customer_entity,	Creation_Date,	End_date,	Description,	OEM,	Status,	created_at,	update_at
      FROM dealregistration
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

const showCustomerDeal = (req, res) => {
  const { id } = req.body;


  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        connection.release();
        return res.status(500).json({ error: "Internal Server Error" });
      }

      let query = `
      SELECT customer_entity
      FROM customer 
      WHERE id = ?
    `;

      const query1 = `
        SELECT customer_entity,	Creation_Date,	End_date,	Description,	OEM,	Status
        FROM dealregistration 
        WHERE customer_entity = ?
      `;

      //console.log(customer_entity)
      connection.query(query, [id], (error, results) => {
        if (error) {
          console.error("Error executing first query:", error);
          return connection.rollback(() => {
            res.status(500).json({ error: "Internal Server Error" });
            connection.release();
          });
        }

        console.log(results)

        const customerEntity = results[0].customer_entity;

      connection.query(query1, [customerEntity], (error, results1) => {
        if (error) {
          console.error("Error executing first query:", error);
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
            res.status(200).json({ products: results1 });
          });
      });
    })
    });
  });
};

const showOpportunityDeal = (req, res) => {
  const { id } = req.body;

//console.log("ID from request body:", id);
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        connection.release();
        return res.status(500).json({ error: "Internal Server Error" });
      }

      let query = `
      SELECT customer_entity
      FROM opportunity 
      WHERE id = ?
    `;

      const query1 = `
        SELECT customer_entity,	Creation_Date,	End_date,	Description,	OEM,	Status
        FROM dealregistration 
        WHERE customer_entity = ?
      `;

      //console.log(customer_entity)
      connection.query(query, [id], (error, results) => {
        if (error) {
          console.error("Error executing first query:", error);
          return connection.rollback(() => {
            res.status(500).json({ error: "Internal Server Error" });
            connection.release();
          });
        }

       // console.log(results)

        const customerEntity = results[0].customer_entity;

      connection.query(query1, [customerEntity], (error, results1) => {
        if (error) {
          console.error("Error executing first query:", error);
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
            res.status(200).json({ products: results1 });
          });
      });
    })
    });
  });
};

const customerentity = async (req, res) => {
  // Use the promisified pool.query function
  const dealerQuery = `
    SELECT DISTINCT customer_entity FROM dealregistration
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

module.exports = {
  showDeal,
  addDeal,
  deleteDeal,
  editDeal,
  showOneDeal,
  showCustomerDeal,
  customerentity,
  showOpportunityDeal
};
