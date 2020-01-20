var express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  passportlocalmongooose = require("passport-local-mongoose"),
  passport = require("passport"),
  localstrategy = require("passport-local"),
  user = require("./models/user"),
  bodyparser = require("body-parser");
app.use(express.static(__dirname + "/public"));
app.use(
  bodyparser.urlencoded({
    extended: true
  })
);
var path = require('path');
app.set("views", "./views")
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static("public"));
app.set("view engine", "ejs");
var admin = require("firebase-admin");

var serviceAccount = require("../website/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://policebuerau.firebaseio.com"
});

var ref = admin.database().ref();

//var storesRef = ref.child('State');0

// var newStoreRef = ref.child("City").push();
// var City = 0;
// newStoreRef.on("value", function(snapshot) {
//   console.log("There are " + snapshot.numChildren() + " messages");
//   City = snapshot.numChildren();
// });

// var PoliceStation = 0;
// ref
//   .child("PoliceStation")
//   .push()
//   .on("value", function(snapshot) {
//     console.log("There are " + snapshot.numChildren() + " messages");
//     City = snapshot.numChildren();
//   });

// var State = 0;
// ref.newStoreRef.on("value", function(snapshot) {
//   console.log("There are " + snapshot.numChildren() + " messages");
//   State = snapshot.numChildren();
// });

mongoose
  .connect(
    "mongodb+srv://sajalagrawal14:1999%40sajal@cluster0-urgf0.mongodb.net/test?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useCreateIndex: true
    }
  )
  .then(() => {
    console.log("Connected to Mongo DataBase!");
  })
  .catch(err => {
    console.log("ERROR:", err.message);
  });

app.use(
  require("express-session")({
    secret: "sajal is very good boy",
    saveUninitialized: false,
    resave: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
passport.use(new localstrategy(user.authenticate()));

app.use(function (req, res, next) {
  res.locals.currentuser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/policereg", (req, res) => {
  res.render("policereg.ejs");
});
app.post("/register", (req, res) => {
  var state = req.body.state;
  var cityy = req.body.city;
  var policestationname = req.body.policestation;
  var soname = req.body.nameofso;
  var phone = req.body.phone;
  var pid = req.body.pid;
  console.log(
    state +
    " " +
    cityy +
    " " +
    policestationname +
    " " +
    soname +
    " " +
    phone +
    " " +
    pid
  );
  //value = value + 1;

  //var newStoreRef = ref.child("State").push();

  ref
    .child("State")
    .orderByChild("state")
    .equalTo(state)
    .on("value", function (snapshot) {
      if (snapshot.val() == null) {
        var val = snapshot.numChildren();
        var vala = ref.child("State").child(val + 1);
        val = val + 1;
        /*vala.set({
          state: state,
          sid: val
        });*/
        //   res.redirect("/");
      } else {
        console.log("adf" + snapshot);
        snapshot.forEach(function (data) {
          if (data) {
            var storesRef = ref.child("City").child(data.val().sid);
            var City = 0;
            ref
              .child("City")
              .child(data.val().sid)
              .once("value", function (snapshot) {
                if (snapshot.exists()) {
                  console.log("snapshot value " + snapshot.val());
                  storesRef.on("value", function (snapshotb) {
                    City = snapshotb.numChildren();
                    console.log("here value " + City + " paste here");

                  });
                }
              });

            console.log("here valueb " + City + " paste here");


            // City = City;
            ref
              .child("City")
              .child(data.val().sid)
              .once("value", function (snapshot) {
                if (snapshot.exists()) {
                  console.log("snapshot value" + snapshot.val());

                  console.log(
                    "i am here " + City + " " + cityy + " " + data.val().sid
                  );


                  ref
                    .child("City")
                    .child(data.val().sid)
                    .orderByChild("city")
                    .equalTo(cityy)
                    .on("value", function (snap) {

                      if (snap == undefined) {

                        var val = ref
                          .child("City")
                          .child(data.val().sid)
                          .child(City + 1);
                        var set = data.val().sid - 1;
                        //var vala = val.push();
                        val.set({
                          city: cityy,
                          cid: City,
                          sid: set
                        });


                      } else {
                        console.log("it is already there ");

                      }



                    });


                  ref
                    .child("City")
                    .child(data.val().sid)
                    .orderByChild("city")
                    .equalTo(cityy)
                    .on("value", function (snap) {


                      snap.forEach(function (snap) {

                        var cid = snap.val().cid;
                        var sid = snap.val().sid;

                        var ans = String(cid) + String(sid);

                        var count = 0;

                        ref
                          .child("PoliceStation")
                          .child(ans).on("value", function (snapshotb) {
                            count = snapshotb.numChildren();
                          })
                        var ans2 = ans + String(count)

                        ref.child("PoliceStation")
                          .child(ans).child(ans2).set({
                            "cid": cid,
                            "pid": ans2,
                            "policestation": policestationname
                          })



                        //   var tt=ref.child("PoliceStation").child(ans);
                      })
                    });


                } else {
                  //create that sanpsjot
                  var val = ref
                    .child("City")
                    .child(data.val().sid)
                    .child("1");

                  var set = data.val().sid - 1;

                  //var vala = val.push();
                  val.set({
                    city: cityy,
                    cid: "0",
                    sid: set
                  });
                }
              });
          } else {
            //add database
          }
        });
      }
    });





  res.redirect("/policereg");
});
app.get("/login", function (req, res) {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: false
    //	successFlash:""
  }),
  function (req, res) {}
);

app.get("/signup", function (req, res) {
  res.render("signup.ejs");
});

app.post("/signup", function (req, res) {
  var name = req.body.name;
  name = name.toLowerCase();
  var email = req.body.email;
  var phone = req.body.phone;
  var username = req.body.username;
  var password = req.body.password;
  user.register(
    new user({
      username: req.body.username
    }),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, function () {
          console.log("congrats user registeres " + user);
        });
      }
    }
  );
  res.redirect("/login");
});

app.get("/fir", function (req, res) {
  res.render("fir.ejs");
});

app.post("/fir", function (req, res) {
  var state = req.body.state;
  var city = req.body.city;
  var ps = req.body.ps;

  console.log("sas " + state + " " + city + " " + ps);

  /****************************************************************** */


  ref
    .child("State")
    .orderByChild("state")
    .equalTo(state)
    .on("value", function (snapshot) {
      if (snapshot.val() == null) {
        console.log("Database not found");
        res.redirect("/fir");
      } else {
        snapshot.forEach(function (data) {
          if (data) {
            var storesRef = ref.child("City").child(data.val().sid);
            console.log(" val " + data.val().sid);

            ref
              .child("City").child(data.val().sid)
              .orderByChild("city")
              .equalTo(city)
              .on("value", function (snapshot2) {
                snapshot2.forEach(function (data2) {
                  if (data2) {
                    var storesRef = ref.child("City").child(data.val().sid);
                    console.log(data2.val().cid + " space " + data.val().sid);
                    var value = data.val().sid - 1;
                    var vala = "";
                    // var vala = toString(value + data2.val().cid);
                    var vala = vala.concat(value, data2.val().cid);
                    console.log(" ans " + vala + " " + ps);
                    //   console.log("police id is " + vala + " || " + value + " || " + data2.val().cid + " ans " + toString(value + data2.val().cid));

                    ref
                      .child("PoliceStation").child(vala)
                      .orderByChild("policestation")
                      .equalTo(ps)
                      .on("value", function (snap) {
                        snap.forEach(function (da) {
                          if (da) {
                            console.log(" sajal " + da.val().pid);

                            /* search police station from here*/



                            var count = 0;
                            ref
                              .child("Registered Fir")
                              .child(da.val().pid)
                              .once("value", function (snapshot) {
                                console.log("as dsg" + da.val().pid);
                                if (snapshot.exists()) {
                                  var storesRef = ref.child("Registered Fir")
                                    .child(da.val().pid);

                                  storesRef.on("value", function (snapshotb) {
                                    count = snapshotb.numChildren();
                                  })
                                }
                              })



                            var arr = [];
                            var allfir = ref.child("Registered Fir").child(da.val().pid);
                            allfir.on("value", function (snapshot) {
                              snapshot.forEach(function (snapshot) {
                                console.log(snapshot.val());
                                var obj = {};
                                obj["applicantAddress"] = snapshot.val().applicantAddress,
                                  obj["applicantGender"] = snapshot.val().applicantGender,
                                  obj["applicantMobileNo"] = snapshot.val().applicantMobileNo,
                                  obj["applicantName"] = snapshot.val().applicantName,
                                  obj["applicantPermanentAddress"] = snapshot.val().applicantPermanentAddress,
                                  obj["dob"] = snapshot.val().dob,
                                  obj["firDetails"] = snapshot.val().firDetails,
                                  obj["incindentDate"] = snapshot.val().incindentDate,
                                  obj["status"] = snapshot.val().status

                                arr.push(obj);
                                console.log("s :" + arr.length + " " + count);
                              });

                              console.log("size :" + arr.length)

                              res.render("firdetails.ejs", {
                                msg: arr,
                                pol: ps
                              });


                            })


                            /**********************************/


                          } else {
                            console.log("databases not found ");

                          }
                        })
                      });

                  }
                });
              });
            /****************************************************************** */
          }
        })
      }
    });
});

app.get("/ncrbentry", function (req, res) {
  res.render("ncrbentry.ejs", {
    msg: ""
  });
})

app.post("/ncrbentry", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  console.log("values " + username + " ans :" + password);
  var val = ref
    .child("Ncrb Official")
  var val = val.push();
  //var vala = val.push();
  val.set({
    "username": username,
    "password": password
  }, function (error) {
    if (error) {
      console.error(error)
      res.render("ncrbentry.ejs", {
        msg: "Succesfull"
      });
    }
    res.render("ncrbentry.ejs", {
      msg: "Succesfull"
    })
  });

  res.render("ncrbentry.ejs", {
    msg: "Succesfull"
  });


});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});
app.listen("5000", () => {
  console.log("server is started");
});