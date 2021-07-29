const express = require("express"),
  app = express(),
  passport = require("passport"),
  port = process.env.PORT || 80,
  cors = require("cors"),
  cookie = require("cookie");

const bcrypt = require("bcrypt");

const db = require("./database.js");
let users = db.users;

require("./passport.js");

const router = require("express").Router(),
  jwt = require("jsonwebtoken");

app.use("/api", router);
router.use(cors({ origin: "http://localhost:3000", credentials: true }));
// router.use(cors())
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    console.log("Login: ", req.body, user, err, info);
    if (err) return next(err);
    if (user) {
        if (req.body.remember == true) {
          time_exp = "7d";
        } else time_exp = "1d";
        const token = jwt.sign(user, db.SECRET, {
          expiresIn: time_exp,
        });
        var decoded = jwt.decode(token);
        //let time = "" + new Date(decoded.exp * 1000);
        let time = new Date(decoded.exp * 1000);
        //let str = time.substring(0, 10);
        console.log(new Date(decoded.exp * 1000));
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV !== "development",
              maxAge: 60 * 60,
              sameSite: "strict",
              path: "/",
          })
      );
      res.statusCode = 200;
      return res.json({ user, token });
    } else return res.status(422).json(info);
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: -1,
      sameSite: "strict",
      path: "/",
    })
  );
  res.statusCode = 200;
  return res.json({ message: "Logout successful" });
});

/* GET user profile. */
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.send(req.user);
  }
);

router.post("/register", async (req, res) => {
  try {
    const SALT_ROUND = 10;
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.json({ message: "Cannot register with empty string" });
    if (db.checkExistingUser(username) !== db.NOT_FOUND)
      return res.json({ message: "Duplicated user" });

    let id = users.users.length
      ? users.users[users.users.length - 1].id + 1
      : 1;
    hash = await bcrypt.hash(password, SALT_ROUND);
    users.users.push({ id, username, password: hash, email });
    res.status(200).json({ message: "Register success" });
  } catch {
    res.status(422).json({ message: "Cannot register" });
  }
});

router.get("/alluser", (req, res) => res.json(db.users.users));

router.get("/", (req, res, next) => {
  res.send("Respond without authentication");
});

router.get(
    "/foo",
    passport.authenticate("jwt", { session: false }),
    (req, res, next) => {
        res.status(200).json({ message: "Foo" });
    }
  );

  let supermarkets = {
    list: [
      { id: 1, name: "Baby powder", amount: 1,  price: 25 },
      { id: 2, name: "Shower cream", amount: 1,  price: 80 },
      { id: 3, name: "Shampoo", amount: 1,  price: 59 },
      { id: 4, name: "Hair conditioner", amount: 1,  price: 59 }
    ],
  };
  
  let income = 0;
  
  router
    .route("/supermarkets")
    .get((req, res) => {
      res.send(supermarkets);
    })
    .post((req, res) => {
      console.log(req.body);
      let newpermarket = {};
      //console.log(todo.list.length ? todo.list[todo.list.length - 1].id + 1 : 1);
      newpermarket.id = supermarkets.list.length ? supermarkets.list[supermarkets.list.length - 1].id + 1 : 1;
      newpermarket.name = req.body.name;
      newpermarket.amount = req.body.amount;
      newpermarket.price = req.body.price;
      supermarkets = { list: [...supermarkets.list, newpermarket] };
      res.json(supermarkets);
    });
  
  router
    .route("/supermarkets/:supermarketid")
    .get((req, res) => {
      let id = supermarkets.list.findIndex((item) => +item.id == +req.params.supermarketid)
      //console.log("id",id)
      res.json(supermarkets.list[id]);
    })
    .put((req, res) => {
      let id = supermarkets.list.findIndex((item) => item.id == +req.params.supermarketid);
      supermarkets.list[id].type = req.body.type;
      supermarkets.list[id].age = req.body.age;
      supermarkets.list[id].weight = req.body.weight;
      supermarkets.list[id].price = req.body.price;
      res.json(supermarkets.list);
    })
    .delete((req, res) => {
      supermarkets.list = supermarkets.list.filter((item) => +item.id !== +req.params.supermarketid);
      res.json(supermarkets.list);
    });
  
  router.route("/income")
  .get((req,res) => {
    console.log("sss")
    res.json(income)
  });
  
  router.route("/purchase/:supermarketId")
  .post((req,res) => {
    let id = supermarkets.list.findIndex((item) => +item.id == +req.params.supermarketId)
    if (id == -1) {
      res.json({message: "Order not found"})
    }
    else {
      income = supermarkets.list[id].price;
      console.log(income)
      supermarkets.list = supermarkets.list.filter((item) => +item.id !== +req.params.supermarketId);
      res.json(supermarkets.list);
    }
  })

// Error Handler
app.use((err, req, res, next) => {
  let statusCode = err.status || 500;
  res.status(statusCode);
  res.json({
    error: {
      status: statusCode,
      message: err.message,
    },
  });
});

// Start Server
app.listen(port, () => console.log(`Server is running on port ${port}`));
