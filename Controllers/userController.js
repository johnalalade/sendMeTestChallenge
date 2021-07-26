const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const pg = require('pg');

const connectionString = process.env.POSTGRE_URL
var client = new pg.Client(connectionString);

// Welcome message
const running = (req, res, next) => {
    res.send("Server is up and running...")
}

// To be  ran only once to create table
const createDB = (req, res, next) => {
    // Connecting to database
    client.connect(function(err) {
        if(err) {
          return console.error('could not connect to postgres', err);
        }
        // Create Query
        client.query('CREATE TABLE USERS(id serial primary key, name text, email text, phone text, password text, balance integer, outgoingTrans integer, incomingTrans integer)', function(err, result) {
                if(err) {
                  return console.error('error running query', err);
                }
                console.table(result.rows[0]);
                
                client.end();
              });
        } )
 
}

// Register user
const register = (req, res, next) => {
    // Connecting to Database
    client.connect(function(err) {
        if(err) {
          return console.error('could not connect to postgres', err);
        }
        // Hashing password
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if(err) return console.log("Hashing password error: ", err)
            
            // Insertion Query
            client.query('INSERT INTO users(name, email, phone, password, balance, outgoingTrans, incomingTrans) VALUES($1, $2, $3, $4, $5, $6, $7)', [req.body.name, req.body.email, req.body.phone, hashedPassword, req.body.balance, req.body.outgoingTrans, req.body.incomingTrans], function(err, result) {
                if(err) {
                  return console.error('error running query', err);
                }

                // Fetching user from database
                client.query('SELECT FROM users WHERE email = $1',[req.body.email], function(err, result) {
                    if(err) {
                      return console.error('error running query', err);
                    }
                    res.json({
                        user: result.rows[0]
                    });
                })
                
                
                client.end();
              });
        } )
        
})
}

// Login
const login = (req, res, next) => {
    client.connect(function(err) {
        if(err) {
          return console.error('could not connect to postgres', err);
        }
            // Searching for user
            client.query('SELECT FROM users WHERE email = $1', [req.body.email], function(err, result) {
                if(err) {
                  return console.error('error running query', err);
                }
                
                // if user exists
                if(result){
                bcrypt.compare(req.body.password , result.rows[0].password, function(err, data){
                    if(err){
                        console.log({
                            message: err
                        })
                    }
                    if(data){
                        let token = jwt.sign({name: result.rows[0].name}, process.env.SECRET_WORD)
                        res.json({
                            message: "Login Successful",
                            token,
                            user: result.rows[0]
                        })
                        console.log({message: "Login Successful..."})
                    }else{
                        res.json({
                            message: "Password does not match..."
                        })
                        console.log({message: "Password does not match..."})
                    }

                } )
            }else{
                // If no user was found
                res.json({
                    message: "No user found..."
                })
                console.log({message: "No user found..."})
            }
                client.end();
              });
        } )
        
}

// adding money
const addMoney = (req, res, next) => {
    let balance
    client.connect(function(err) {

        client.query('SELECT FROM users WHERE email = $1', [req.body.email], function(err, data){
            if(err) {
                return console.error('error running query', err);
              }
            // adding incoming deposit to existing balance
            balance = parseInt(data.rows[0].balance) + req.body.deposit
        })

            client.query('UPDATE users SET balance=$1 WHERE id = $2', [balance, req.body.id], function(err, result) {
                if(err) {
                  return console.error('error running query', err);
                }
                res.json({
                    message: "Deposite added",
                    user: result.rows[0]
                })
                console.log(result.rows[0]);
                
                client.end();
              });
        
})
}

// sending Money
const sendMoney = (req, res, next) => {
    let balance
    client.connect(function(err) {

        client.query('SELECT FROM users WHERE email = $1', [req.body.email], function(err, data){
            if(err) {
                return console.error('error running query', err);
              }
            // Subtracting incoming deposit from existing balance
            balance = parseInt(data.rows[0].balance) - req.body.deposit
        })

            client.query('UPDATE users SET balance=$1 WHERE id = $2', [balance, req.body.id], function(err, result) {
                if(err) {
                  return console.error('error running query', err);
                }
                res.json({
                    message: "Transaction succesful",
                    user: result.rows[0]
                })
                console.log(result.rows[0]);
                
                client.end();
              });
        
})
}

// deleting user
const deleteUser = (req, res, next) => {
    client.connect(function(err) {
        if(err) {
          return console.error('could not connect to postgres', err);
        }
            // Insertion Query
            client.query('DELETE FROM users WHERE id = $1', [req.body.id], function(err, result) {
                if(err) {
                  return console.error('error running query', err);
                }
                res.json({
                    message: "User deleted..."
                })
                client.end();
              });
        } )

}

module.exports = {
   running, createDB, register, login, addMoney, sendMoney, deleteUser
}