const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const date = require(__dirname + "/date.js");
require("dotenv").config();
app.use(express.urlencoded({ urlencoded: true }));
app.use(express.static("public"));
mongoose.connect(process.env.DB_HOST);
app.set("view engine", "ejs");
let newworkitems = [];

const itemScheme = {
  name: String,
};
const Item = mongoose.model("item", itemScheme);

const item1 = new Item({
  name: "Welcome to your to-do List",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<-- Check this box to delete the item",
});

const listSchema = {
  name: String,
  items: [itemScheme],
};
const List = mongoose.model("List", listSchema);

const items = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find({}, function (err, founditems) {
    if (founditems.length == 0) {
      Item.insertMany(items, function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      });
    } else {
      res.render("list", { todaysday: date, newiteminlist: founditems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customlistname = _.capitalize(req.params.customListName);
  List.findOne({ name: customlistname }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        const list = new List({
          name: customlistname,
          items: items,
        });
        list.save();
        res.redirect("/" + customlistname);
      } else {
        res.render("list", {
          todaysday: customlistname,
          newiteminlist: foundlist.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemname = req.body.newItem;
  const listname = req.body.button;
  const itemnew = new Item({
    name: itemname,
  });
  if (listname == date) {
    itemnew.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }, function (err, foundlist) {
      foundlist.items.push(itemnew);
      foundlist.save();
      res.redirect("/" + listname);
    });
  }
});

app.post("/delete", function (req, res) {
  var checkeditemid = req.body.checkbox;
  var listname = req.body.listname;
  if (listname == date) {
    if (checkeditemid) {
      checkeditemid = checkeditemid.trim();
    }
    Item.findByIdAndRemove(checkeditemid, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    if (checkeditemid) {
      checkeditemid = checkeditemid.trim();
    }
    List.findOneAndUpdate(
      { name: listname },
      { $pull: { items: { _id: checkeditemid } } },
      function (err, foundlist) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/" + listname);
        }
      }
    );
  }
});

app.post("/work", function (req, res) {
  res.redirect("/work");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server as Started Succesfully");
});
