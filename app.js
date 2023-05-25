const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
mongoose.connect("mongodb+srv://bsardar980:TEST123@cluster1.0b9bbwv.mongodb.net/todolistDB");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
let itemData = [];

let today = new Date();
let options = {weekday: "long", day: "numeric", month: "long"};
let day = today.toLocaleDateString("en-US", options);

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Eating"
});

const item2 = new Item({
  name: "Playing"
});

const item3 = new Item({
  name: "Sleeping"
});

const toDoItems = [item1, item2, item3];

const listSchema = {
  name: String,
  item: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {



  Item.find({}).then((data) => {

    if (data.length === 0) {
      Item.insertMany(toDoItems);
      res.redirect("/");
    }
    // console.log(data.length);
    res.render("list", {kindOfDay: day, item: data});
  });


});

app.post("/", function(req, res){
  const itemName = req.body.items;
  const listName = req.body.button;
  // console.log(listName);
  const newItem = new Item({
    name: itemName
  });

  if (listName === day) {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then((data) => {
      data.item.push(newItem);
      data.save();
      res.redirect("/" + listName);
    });
  }


});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listCheckedItem = req.body.hiddenName;

  if (listCheckedItem === day) {
    Item.findByIdAndRemove(checkedItem).then(() => {
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listCheckedItem}, {$pull: {item: {_id: checkedItem}}}).then(() => {
      res.redirect("/" + listCheckedItem);
    });

  }

});


app.get("/:topic", function(req, res){
  const typedName = _.capitalize(req.params.topic);

  List.findOne({name: typedName}).then((data) => {
    if (!data) {
      const newList = new List({
        name: typedName,
        item: toDoItems
      })

      newList.save();
      // console.log("dosen't exists");
      res.redirect("/"+typedName);
    } else {
      res.render("list", {kindOfDay: data.name, item: data.item})
    }
  })




});


app.listen(process.env.PORT || 3000, function(){
  console.log("Server is connected to Port 3000");
});
