import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    // Check if user needs to complete their profile
    if (!req.user.username) {
      return res.redirect("/complete-profile");
    }
    
    try {
      // Get random secret from secrets table with user info
      const result = await db.query(`
        SELECT s.secret_text, u.username 
        FROM secrets s 
        JOIN users u ON s.user_id = u.id 
        ORDER BY RANDOM() 
        LIMIT 1
      `);
      if (result.rows.length > 0) {
        res.render("home.ejs", { 
          secret: result.rows[0].secret_text,
          user: result.rows[0].username,
          authenticated: true 
        });
      } else {
        res.render("home.ejs", { 
          secret: "No secrets shared yet. Be the first to share one!",
          user: "Anonymous",
          authenticated: true 
        });
      }
    } catch (err) {
      console.log(err);
      res.render("home.ejs", { authenticated: true });
    }
  } else {
    res.render("login.ejs");
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs", { error: req.query.error });
});

app.get("/register", (req, res) => {
  res.render("register.ejs", { error: req.query.error });
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});



app.get("/complete-profile", (req, res) => {
  if (req.isAuthenticated() && !req.user.username) {
    res.render("complete-profile.ejs", { user: req.user });
  } else {
    res.redirect("/");
  }
});

app.post("/complete-profile", async (req, res) => {
  if (req.isAuthenticated() && !req.user.username) {
    const username = req.body.username;
    try {
      // Check if username already exists
      const checkResult = await db.query("SELECT * FROM users WHERE username = $1", [username]);
      
      if (checkResult.rows.length > 0) {
        return res.render("complete-profile.ejs", { 
          user: req.user, 
          username: username,
          error: "This username is already taken. Please choose a different one." 
        });
      }
      
      // Username is available, update the user
      await db.query("UPDATE users SET username = $1 WHERE id = $2", [username, req.user.id]);
      req.user.username = username; // Update session
      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.render("complete-profile.ejs", { 
        user: req.user, 
        username: username,
        error: "Failed to update username. Please try again." 
      });
    }
  } else {
    res.redirect("/");
  }
});

app.get("/submit", (req, res) => {
  if (req.isAuthenticated()) {
    if (!req.user.username) {
      res.redirect("/complete-profile");
    } else {
      res.render("submit.ejs");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/random", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.get("/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get("/auth/google/brainspill",
  passport.authenticate("google", {
    successRedirect: "/complete-profile",
    failureRedirect: "/login",
  })
);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      if (err === "User not found") {
        return res.redirect("/login?error=No account found with this email. Please register first.");
      } else if (err === "Invalid password") {
        return res.redirect("/login?error=Incorrect password. Please try again.");
      } else {
        return res.redirect("/login?error=Login failed. Please try again.");
      }
    }
    if (!user) {
      return res.redirect("/login?error=Invalid email or password. Please try again.");
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.redirect("/login?error=Login failed. Please try again.");
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const username = req.body.displayName;

  try {
    // Check if email already exists
    const checkEmailResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkEmailResult.rows.length > 0) {
      return res.redirect("/register?error=Email already exists. Please login instead.");
    }
    
    // Check if username already exists
    const checkUsernameResult = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (checkUsernameResult.rows.length > 0) {
      return res.redirect("/register?error=This username is already taken. Please choose a different one.");
    }

    // Both email and username are available, proceed with registration
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        res.redirect("/register?error=Registration failed. Please try again.");
      } else {
        const result = await db.query("INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *", [email, hash, username]);
        const user = result.rows[0];
        req.login(user, (err) => {
          console.log("success");
          res.redirect("/");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.redirect("/register?error=Registration failed. Please try again.");
  }
});

app.post("/submit", async (req, res) => {
  const submittedSecret = req.body.secret;

  try {
    // Insert new secret instead of updating existing one
    await db.query(
      "INSERT INTO secrets (user_id, secret_text) VALUES ($1, $2)", 
      [req.user.id, submittedSecret]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

passport.use("local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [username]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb("Invalid password");
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
      return cb(err);
    }
  })
);

passport.use("google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/brainspill",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);
        if (result.rows.length === 0) {
          // Create user without username - they'll be prompted to choose one
          const newUser = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [profile.email, "google"]);
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
