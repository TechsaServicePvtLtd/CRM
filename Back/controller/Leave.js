const { pool } = require("../database");
const nodemailer = require("nodemailer");

const showApplicationLeave = (req, res) => {
    const {
        fromDate,
        type,
        status,
        toDate,
        dateFilterType
    } = req.query;
    const { id, role } = req.user;
console.log(req.user)
    let query = `
        SELECT la.id, la.name,la.surname,la.status, la.fromDate, la.toDate,la.type, la.duration, 
        la.days, la.description, la.history,
        la.created_at, la.update_at
        FROM leaveapplication la
        JOIN user u ON u.name = la.name
        `;

        if (role === 'admin') {
          // If the user is an admin, fetch all leave applications
          query += `
              WHERE 1=1
          `;
      } else {
          // If the user is not an admin, fetch only their leave applications
          query += `
              WHERE u.id = ?
          `;
      }

    let filterConditions = [];

    if (status) {
        filterConditions.push(`status LIKE '%${status}%'`);
    }

    if (type) {
        filterConditions.push(`type LIKE '%${type}%'`);
    }

   

    if (dateFilterType && fromDate && toDate) {
        if (dateFilterType === "equal") {
            filterConditions.push(`fromDate = '${fromDate}' AND toDate = '${toDate}'`);
        } else if (dateFilterType === "before") {
            filterConditions.push(`fromDate < '${fromDate}' AND toDate < '${toDate}'`);
        } else if (dateFilterType === "after") {
            filterConditions.push(`fromDate > '${fromDate}' AND toDate > '${toDate}'`);
        } else if (dateFilterType === "between") {
            filterConditions.push(`fromDate BETWEEN '${fromDate}' AND '${toDate}'`);
        }
    }

    if (filterConditions.length > 0) {
        query += ` AND ${filterConditions.join(" AND ")}`;
    }

    // Start a transaction
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error getting connection from pool:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error("Error starting transaction:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }

            // Run the query with user ID and role
            connection.query(query, [id, role], (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error("Error executing query:", error);
                        res.status(500).json({ error: "Internal Server Error" });
                        connection.release();
                    });
                }

                // Commit the transaction if the query is successful
                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("Error committing transaction:", err);
                            res.status(500).json({ error: "Internal Server Error" });
                            connection.release();
                        });
                    }

                    res.status(200).json({ dealers: results });
                    //console.log(results)
                    // Release connection back to the pool
                    connection.release();
                });
            });
        });
    });
};

const showOneApplicationLeave = async (req, res) => {
  
  const dealerQuery = `
  SELECT id, name,surname, status, fromDate, toDate, type, duration, 
  days, description, history, created_at
  FROM leaveapplication
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

const addApplicationLeave = (req, res) => {
  // Begin a SQL transaction
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        connection.release();
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const addDealer = `
        INSERT INTO leaveapplication
        (name, surname, status, fromDate, toDate, type, duration, days, description,
        history, createdBy, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const value = [
        req.body.name,
        req.body.surname,
        req.body.status,
        req.body.fromDate,
        req.body.toDate,
        req.body.type,
        req.body.duration,
        req.body.days,
        req.body.description,
        req.body.history,
        req.body.name
      ];

      // Execute the first query
      connection.query(addDealer, value, (error, results) => {
        if (error) {
          console.error("Error executing query:", error);
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: "Internal Server Error" });
          });
        }

        console.log("Leave application added successfully:");

        const addDealer2 = `
          SELECT la.*, uu.email as sender
          FROM leaveapplication la
          JOIN user AS uu ON uu.name = la.name
          WHERE la.id = ?
        `;

        // Execute the second query
        connection.query(addDealer2, [results.insertId], (error, rows) => {
          if (error) {
            console.error("Error executing second query:", error);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Internal Server Error" });
            });
          }

          // Check if rows array is empty
          if (!rows || rows.length === 0) {
            console.error("No rows returned from second query");
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Internal Server Error" });
            });
          }

          console.log("Fetched user email:", rows[0].sender);

          // Nodemailer configuration
          const transporter = nodemailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            secure: true, // Use true for 465, false for other ports
            auth: {
              user: process.env.SMPT_MAIL,
              pass: process.env.SMPT_PASSWORD,
            },
          });
 
          const mailOptions = {
            from: `"TechSa CRM" <${process.env.SMPT_MAIL}>`,
            to: `${process.env.SMPT_MAIL}`,
            cc: "mihir.b@techsa.net",
            // replyTo: `${rows[0].sender}`, // Setting the actual sender's email in replyTo
            subject: `Leave Application Confirmation`,
            text: `Hi Sir,
            
            I am writing this mail to ask for ${rows[0].type} from ${rows[0].fromDate} to ${rows[0].toDate}.
            
            Regards,
            ${rows[0].name} ${rows[0].surname}
            `,
          };

          // Sending email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: "Internal Server Error" });
              });
            }
            console.log("Email sent:", info.response);

            // Commit the transaction if everything is successful
            connection.commit((err) => {
              if (err) {
                console.error("Error committing transaction:", err);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: "Internal Server Error" });
                });
              }

              // Release the connection
              connection.release();
              res.json(results);
            });
          });
        });
      });
    });
  });
};

const editApplicationAdmin = (req, res) => {
  const checkStatusQuery = `
    SELECT la.name, la.surname, u.email, la.status 
    FROM leaveapplication la
    JOIN user AS u ON u.name = la.name
    WHERE la.id = ?;
  `;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    connection.query(checkStatusQuery, [req.params.id], (error, rows) => {
      if (error) {
        console.error("Error executing query:", error);
        connection.release();
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (!rows || rows.length === 0) {
        console.error("No rows returned");
        connection.release();
        return res.status(404).json({ error: "Not Found" });
      }

      const currentStatus = rows[0].status;
      const userEmail = rows[0].email;
      const userName = rows[0].name;
      const userSurname = rows[0].surname;

      // Check if the new status is 'approved' or 'rejected'
      if (req.body.status === "approved" || req.body.status === "rejected") {
        // Nodemailer configuration
        const transporter = nodemailer.createTransport({
          host: process.env.SMPT_HOST,
          port: process.env.SMPT_PORT,
          secure: true, // Use true for 465, false for other ports
          auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
          },
        });

        const mailOptions = {
          from: `<${process.env.SMPT_MAIL}>`,
          to: userEmail,
          subject: "Leave Application Status Update",
          text: `Hi ${userName} ${userSurname},\n\nYour leave application has been ${req.body.status}.\n\nRegards,\nTechSa CRM`,
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            connection.release();
            return res.status(500).json({ error: "Internal Server Error" });
          }

          console.log("Email sent:", info.response);

          // Update the database after email is sent successfully
          const updateDealer = `
            UPDATE leaveapplication 
            SET
            name = ?,
            surname = ?,
            status = ?,
            fromDate = ?,
            toDate = ?, 
            type = ?,
            duration = ?,
            days = ?,
            description = ?,
            history = ?,	
            update_at = NOW()
            WHERE id = ?;
          `;

          const values = [
            req.body.name,
            req.body.surname,
            req.body.status,
            req.body.fromDate,
            req.body.toDate,
            req.body.type,
            req.body.duration,
            req.body.days,
            req.body.description,
            req.body.history,
            req.params.id,
          ];

          connection.query(updateDealer, values, (error, results) => {
            if (error) {
              console.error("Error executing update query:", error);
              connection.release();
              return res.status(500).json({ error: "Internal Server Error" });
            }

            console.log("Updated dealer:", results);
            connection.release();
            res.json(results);
          });
        });
      } else {
        // Update the database without sending email if status is not 'approved' or 'rejected'
        const updateDealer = `
          UPDATE leaveapplication 
          SET
          name = ?,
          surname = ?,
          status = ?,
          fromDate = ?,
          toDate = ?, 
          type = ?,
          duration = ?,
          days = ?,
          description = ?,
          history = ?,	
          update_at = NOW()
          WHERE id = ?;
        `;

        const values = [
          req.body.name,
          req.body.surname,
          req.body.status,
          req.body.fromDate,
          req.body.toDate,
          req.body.type,
          req.body.duration,
          req.body.days,
          req.body.description,
          req.body.history,
          req.params.id,
        ];

        connection.query(updateDealer, values, (error, results) => {
          if (error) {
            console.error("Error executing update query:", error);
            connection.release();
            return res.status(500).json({ error: "Internal Server Error" });
          }

          console.log("Updated dealer:", results);
          connection.release();
          res.json(results);
        });
      }
    });
  });
};

module.exports = {
  showApplicationLeave,
  addApplicationLeave,
  editApplicationAdmin,
  showOneApplicationLeave,
};