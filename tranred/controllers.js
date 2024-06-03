const express = require("express");
const router = express.Router();
const {
  saveTokenToSQLite,
  deleteTokens,
  savePlansToSQLite,
} = require("../sqlite/db");
const sqlite3 = require("sqlite3").verbose();
const sql = `SELECT * FROM tranred_tokens ORDER BY rowid DESC LIMIT 1`;
const jwt = require("jsonwebtoken");
const pool = require("../db");

//Login to Tranred function
const tranredLogin = (success, callback) => {
  const body = {
    login: process.env.TRANRED_USER,
    password: process.env.TRANRED_PASSWORD,
  };

  console.log("calling tranred");
  /* const current = Date.now()
        const newTime = current + (1*60*1000)
        //console.log(newTime)
        const db = new sqlite3.Database('./db/tranred.db');
        db.run(`UPDATE tranred_tokens SET timestamp = ${newTime} WHERE rowid = 1`, function(err){
            if(err){
                return console.log(err.message)
            }
            console.log('new timestamp was set')
            callback()
        }) */

  fetch(`${process.env.TRANRED_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(async (result) => {
      if (result.ok) {
        const json = await result.json();
        //deleteTokens();
        saveTokenToSQLite(json.access_token, Date.now().toString(), callback);
      } else {
        success = false;
        return success;
      }
    })
    .catch(function (error) {
      console.log(error.message);
    });
};

//Check Tranred Token
const checkToken = (timestamp) => {
  console.log("check token");
  const current = Date.now();
  const tokenTime = Number(timestamp);
  const elapsed = (current - tokenTime) / (60 * 1000);
  console.log(elapsed);
  if (elapsed > 0) {
    return false;
  }
  return true;
};

//Simulate Tranred Connection
const createTranredCustomer = async (req, res) => {
  const bearerToken = req.header("Authorization");
  if (!bearerToken) {
    return res.status(401).json({
      error: "Unauthorized",
      statusCode: 401,
      message: "No token provided",
    });
  }
  try {
    const token = bearerToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    if (decoded) {
      return res
        .status(200)
        .json({ statusCode: 200, message: "Comercio creado con éxito" });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(401).json({
      error: "Unauthorized",
      statusCode: 401,
      message: "Invalid token",
    });
  }
};

// Update customer in DB
const updateCustomer = async (req, res) => {
  const { commerce } = req.body;
  const promisePool = pool.promise();
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const current = new Date(Date.now() - tzoffset);
  const timeString = current
    .toISOString()
    .slice(0, current.toISOString().indexOf("T"))
    .concat(
      " ",
      current
        .toISOString()
        .slice(
          current.toISOString().indexOf("T") + 1,
          current.toISOString().indexOf(".")
        )
    );
  const RIF = commerce.comerRif.substring(1);
  try {
    const dbResponse = await promisePool.query(
      "UPDATE t_customer SET cusm_tranred = ?, cusm_dupdate = ? WHERE cusm_ndoc = ?",
      [1, timeString, RIF]
    );
    if (dbResponse[0].affectedRows == 1) {
      return true;
    } else throw new Error("Ha ocurrido un error");
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

//Create Tranred Customer
const createCustomer = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  console.log("attempting to create customer");
  let success = true;
  const { commerce } = req.body;
  const body = {
    commerce: {
      comerRif: commerce.comerRif,
      comerTipoPer: commerce.comerTipoPer,
      idActivityXAfiliado: commerce.idActivityXAfiliado,
      comerDesc: commerce.comerDesc,
      comerCuentaBanco: commerce.comerCuentaBanco,
      locationCommerce: req.body.commerceAddress,
      locationContact: req.body.contactAddress,
      locationPos: req.body.POSAddress,
      daysOperacion: {
        Lun: true,
        Mar: true,
        Mie: true,
        Jue: true,
        Vie: true,
        Sab: true,
        Dom: true,
      },
    },
    contacto: req.body.contacto,
  };

  /* const token = jwt.sign({test: 'this is a test'}, process.env.PRIVATE_KEY, {expiresIn: '1 m'})
  console.log(token) */

  console.log(body);

  db.get(sql, function (err, row) {
    if (err) {
      return console.log(err.message);
    }

    fetch(`${process.env.TRANRED_URL}/commerce/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${row.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(async (result) => {
        const json = await result.json();
        if (result.ok) {
          if (updateCustomer(req, res)) {
            return res.status(200).json(json);
          } else {
            return res.status(500).json({
              message: "Ha ocurrido un error actualizando el registro.",
            });
          }
        } else if (json.statusCode == 401) {
          console.log("had to perform login");
          if (success) {
            tranredLogin(success, () => {
              return createCustomer(req, res);
            });
          } else
            return res
              .status(400)
              .json({ statusCode: 400, message: "Something happened" });
        } else {
          return res.status(400).json(json);
        }
      })
      .catch(function (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
      });
  });
  db.close();
};

//Get one Tranred Customer
const getOneCustomer = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  const { id } = req.params;
  let success = true;
  db.get(sql, function (err, row) {
    if (err) {
      return console.log(err.message);
    }

    fetch(`${process.env.TRANRED_URL}/commerce/rif/${id}`, {
      headers: {
        Authorization: `Bearer ${row.token}`,
      },
    })
      .then(async (response) => {
        const json = await response.json();
        if (response.ok) {
          res.status(200).json(json);
        } else if (json.statusCode == 401) {
          console.log("had to perform login");
          if (success) {
            tranredLogin(success, () => {
              return getOneCustomer(req, res);
            });
          } else
            return res
              .status(400)
              .json({ statusCode: 400, message: "Something happened" });
        } else {
          return res.status(400).json(json);
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
      });
  });
  db.close();
};

//Get All Tranred Customers
const getAllCustomers = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  let success = true;
  db.get(sql, function (err, row) {
    if (err) {
      return console.log(err.message);
    }
    fetch(`${process.env.TRANRED_URL}/commerce/all`, {
      headers: {
        Authorization: `Bearer ${row.token}`,
      },
    })
      .then(async (response) => {
        const json = await response.json();
        if (response.ok) {
          res.status(200).json(json);
        } else if (json.statusCode == 401) {
          console.log("had to perform login");
          if (success) {
            tranredLogin(success, () => {
              return getAllCustomers(req, res);
            });
          } else
            return res
              .status(400)
              .json({ statusCode: 400, message: "Something happened" });
        } else {
          return res.status(400).json(json);
        }
      })
      .catch(function (err) {
        console.log("catch");
        console.log(err);
        res.status(400).json({ error: err.message });
      });
  });
  db.close();
};

//Edit Tranred Customer
const editCustomer = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  let success = true;
  const { comerRif } = req.body;
  const { commerce } = req.body;

  const body = {
    comerRif: comerRif,
    commerce: commerce,
  };
  db.get(sql, function (err, row) {
    if (err) {
      return console.log(err.message);
    }

    fetch(`${process.env.TRANRED_URL}/commerce`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${row.token}`,
      },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        const json = await response.json();
        if (response.ok) {
          res.status(200).json(json);
        } else if (json.statusCode == 401) {
          console.log("had to perform login");
          if (success) {
            tranredLogin(success, () => {
              return editCustomer(req, res);
            });
          } else
            return res
              .status(400)
              .json({ statusCode: 400, message: "Something happened" });
        } else {
          return res.status(400).json(json);
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
      });
  });
  db.close();
};

// Create tranred terminal in mysql db
const createTerminalInDB = async (req, res, term_tranred) => {
  const promisePool = pool.promise();

  const { serial_id, plan_id } = req.body;

  try {
    const result = await promisePool.query(
      "INSERT INTO t_terminal (term_tranred, serial_id, plan_id) VALUES(?,?,?)",
      [term_tranred, serial_id, plan_id]
    );

    if (result[0].insertId) {
      return true;
    }
  } catch (error) {
    console.log(error, message);
    return false;
  }
};

// Create Terminal Function
const newTerminal = async(success, error, terminalArray, index, res, row, responseArray, promisePool)=>{
  if (error) {
    return res.status(400).json({ responseArray });
  } else if(responseArray.length == terminalArray.length){
    return res.status(200).json({responseArray})
  } else {

  const body = {
    comerRif: terminalArray[index].comerRif,
    comerCuentaBanco: terminalArray[index].comerCuentaBanco,
    prefijo: "62",
    comerCantPost: 1,
    modelo: terminalArray[index].modelo,
    serial: terminalArray[index].serial,
    plan: 1,
  };

  fetch(`${process.env.TRANRED_URL}/terminal/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${row.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(async (response) => {
      console.log('called tranred')
      const json = await response.json();
      responseArray.push({serial: terminalArray[index], response: json})
      await promisePool.query('CALL sp_new_terminalLog(?, ?, ?);', [terminalArray[index].serial, response.status, JSON.stringify(json)]);
      if (response.ok) {
        const term_tranred = json.terminal;
        if (createTerminalInDB(req, res, term_tranred)) {
          console.log("created in MySQL");
          console.log(json);
        } else {
          console.log(`error al registrar ${json}`);
        }
      } else if (json.statusCode == 401) {
        console.log("had to perform login");
        if (success) {
          tranredLogin(success, () => {
            return createTerminal(req, res);
          });
        } else {
          error = true;
          }
      } else {
        error = true;
      }
      newTerminal(success, error, terminalArray, index+1, res, row, responseArray, promisePool);
    })
    .catch(function (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    });
  }
  
}

//Create Tranred Terminal
const createTerminal = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  let success = true;
  let error = false;
  let responseArray = [];
  const promisePool = pool.promise();
  const query = `SELECT CONCAT(p_doc_type.doc_value, t_customer.cusm_ndoc) AS comerRif, t_account.acct_number AS comerCuentaBanco, t_product.prod_model_tr AS modelo, t_serials.serial_num AS serial
	FROM t_sales
	INNER JOIN t_customer ON t_sales.cusm_id = t_customer.cusm_id
	INNER JOIN p_doc_type ON t_customer.doc_typeid = p_doc_type.doc_typeid
	INNER JOIN t_serials ON t_sales.sale_id = t_serials.sale_id
	INNER JOIN t_product ON t_serials.prod_id = t_product.prod_id
	LEFT JOIN t_account ON t_serials.serial_id = t_account.serial_id
	WHERE t_sales.sale_id = ?;`;
  const { id } = req.params;

  try {
    const result = await promisePool.query(query, [id]);
    if (!result[0][0]) {
      res.status(200).json({ message: "No se encontraron terminales válidos" });
    } else {
      const terminalArray = result[0];

      db.get(sql, function (err, row) {
        if (err) {
          res.status(400).json({ message: err.message });
        } else {
          newTerminal(success, error, terminalArray, 0, res, row, responseArray, promisePool)
        }
      });
      db.close();
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
};

//Get one terminal
const getTerminal = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  let success = true;
  const { id } = req.params;

  db.get(sql, function (err, row) {
    if (err) {
      return console.log(err.message);
    }

    fetch(`${process.env.TRANRED_URL}/terminal/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${row.token}`,
      },
    })
      .then(async (response) => {
        const json = await response.json();
        if (response.ok) {
          res.status(200).json(json);
        } else if (json.statusCode == 401) {
          console.log("had to perform login");
          if (success) {
            tranredLogin(success, () => {
              return getOneCustomer(req, res);
            });
          } else
            return res
              .status(400)
              .json({ statusCode: 400, message: "Something happened" });
        } else {
          return res.status(400).json(json);
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
      });
  });
  db.close();
};

// Update Terminal
const updateTerminal = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  let success = true;
  const body = req.body;

  db.get(sql, function (err, row) {
    if (err) {
      return console.log(err.message);
    }

    fetch(`${process.env.TRANRED_URL}/terminal/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${row.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        const json = await response.json();
        if (response.ok) {
          res.status(200).json(json);
        } else if (json.statusCode == 401) {
          console.log("had to perform login");
          if (success) {
            tranredLogin(success, () => {
              return getOneCustomer(req, res);
            });
          } else
            return res
              .status(400)
              .json({ statusCode: 400, message: "Something happened" });
        } else {
          return res.status(400).json(json);
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
      });
  });
  db.close();
};

// Get Terminals' quota
const getCuotas = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  let success = true;
  const { terminal, planId, startDate, endDate } = req.params;

  db.get(sql, function (err, row) {
    if (err) {
      return console.log(err.message);
    }

    fetch(
      `${process.env.TRANRED_URL}/terminal/cuotasAnular/${terminal}/${planId}/${startDate}/${endDate}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${row.token}`,
        },
      }
    )
      .then(async (response) => {
        const json = await response.json();
        if (response.ok) {
          res.status(200).json(json);
        } else if (json.statusCode == 401) {
          console.log("had to perform login");
          if (success) {
            tranredLogin(success, () => {
              return getOneCustomer(req, res);
            });
          } else
            return res
              .status(400)
              .json({ statusCode: 400, message: "Something happened" });
        } else {
          return res.status(400).json(json);
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
      });
  });
  db.close();
};

// Cancel quota
const cancelCuota = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  let success = true;
  const { terminal, startDate, endDate, planId, personResponsible, comments } =
    req.body;
  const body = {
    terminal,
    fechaInicio: startDate,
    fechaFin: endDate,
    tipoPlan: planId,
    responsable: personResponsible,
    observaciones: comments,
  };

  db.get(sql, function (err, row) {
    if (err) {
      return console.log(err.message);
    }

    fetch(`${process.env.TRANRED_URL}/terminal/AnularCuotas}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${row.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        const json = await response.json();
        if (response.ok) {
          res.status(200).json(json);
        } else if (json.statusCode == 401) {
          console.log("had to perform login");
          if (success) {
            tranredLogin(success, () => {
              return getOneCustomer(req, res);
            });
          } else
            return res
              .status(400)
              .json({ statusCode: 400, message: "Something happened" });
        } else {
          return res.status(400).json(json);
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
      });
  });
  db.close();
};

// Insert plans into MySQL DB
const insertPlansInDB = (plans) => {
  const promisePool = pool.promise();
  if (!plans.length) {
    return false;
  }

  async function insert(i) {
    if (i === 0) {
      return true;
    } else {
      const result = await promisePool.query(
        "INSERT INTO t_plans (plan_id, plan_desc, plan_amount) VALUES(?,?,?)",
        [plans[i - 1].a_planId, plans[i - 1].a_planNombre, null]
      );
      if (result[0].insertId) {
        return insert(i - 1);
      }
    }
  }

  try {
    if (insert(plans.length)) return true;
  } catch (error) {
    console.log(error, message);
    return false;
  }
};

// Update plans
const updatePlans = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  let success = true;
  db.get(sql, function (err, row) {
    if (err) {
      res.status(400).json({ mstatusCode: 400, message: err.message });
    }

    fetch(`${process.env.TRANRED_URL}/terminal/planes/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${row.token}`,
      },
    })
      .then(async (response) => {
        const json = await response.json();
        if (response.ok) {
          savePlansToSQLite(json.terminales, () => {
            if (insertPlansInDB(json.terminales)) {
              res.status(200).json(json);
            } else {
              res.status(500).json({ message: "Falló al insertar en la BD" });
            }
          });
        } else if (json.statusCode == 401) {
          console.log("had to perform login");
          if (success) {
            tranredLogin(success, () => {
              return updatePlans(req, res);
            });
          } else
            return res
              .status(400)
              .json({ statusCode: 400, message: "Something happened" });
        } else {
          return res.status(400).json(json);
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
      });
  });
  db.close();
};

// Get plans
const getPlans = async (req, res) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  db.all("SELECT * FROM tranred_plans", function (err, rows) {
    if (err) {
      res.status(400).json({ statusCode: 400, message: err.message });
    } else {
      res.status(200).json({
        result: rows,
      });
    }
  });
  db.close();
};

//

module.exports = {
  createCustomer,
  getOneCustomer,
  getAllCustomers,
  editCustomer,
  createTerminal,
  getTerminal,
  createTranredCustomer,
  getPlans,
  updatePlans,
  cancelCuota,
  getCuotas,
  updateTerminal,
  createTerminalInDB,
};
