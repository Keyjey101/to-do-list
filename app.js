//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const { forEach } = require("lodash");
const _ = require('lodash');
const { response } = require("express");
const app = express();
const db = mongoose.connection;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose.connect('mongodb://localhost:27017/todoListDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect('mongodb+srv://user:239907@cluster0.utenj.mongodb.net/todoListDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});




const itemsSchema = {
  name: {
    type: String,
    required: true
  }
};


const Item = mongoose.model('item', itemsSchema);

const item1 = new Item({
  name: 'This is todo List'
})


const item2 = new Item({
  name: 'you can hit plus to add'
})

const item3 = new Item({
  name: '<-- this shit to delete item'
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const NewList = mongoose.model('List', listSchema);
 






app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
const itemsList = foundItems
const day = date.getDate();

if(foundItems.length === 0) {
  Item.insertMany(defaultItems, function(err){
    if (err){
      console.log('default items already in list')
    }else {
      console.log('---Default items have been inserted')
    
    }
  })
  res.redirect('/')
} else{

res.render("list", {listTitle: day, newListItems: itemsList});
}
  })

});
app.post('/delete', (req, res)=>{

if (req.body.listName == date.getDate()){

  Item.find({_id:req.body.check}, function(err, i) {
    Item.deleteMany({_id:req.body.check }, function(err){
         if (err){ 
      console.log(err)
    }else{
      
      console.log(i[0].name +' has been removed from list')
    }
  })
  res.redirect('/')
})} 
else{
NewList.findOneAndUpdate({name: req.body.listName}, {$pull: {items: {_id: req.body.check}}},(err, result)=>{
   result.save()
  res.redirect('/'+req.body.listName)
})

}}



)



app.post("/", function(req, res){
const item = new Item({
  name: req.body.newItem
})
if (req.body.list == date.getDate()) {

  item.save()

  res.redirect("/");

} else {

NewList.findOneAndUpdate({name: req.body.list}, {$push: {items: {name: req.body.newItem}}}, {returnOriginal: false}, (err,found)=>{
   res.redirect('/'+req.body.list)
})





}







       
  
});






app.get("/:work", function(req,res){
 
NewList.find({name: req.params.work}, (err,result)=>{
 
 if (result == 0) {
   const list = new NewList({
     name: req.params.work,
     items: defaultItems
      })
      list.save()
      res.redirect("/"+list.name)
     // res.render("list", {listTitle: list.name, newListItems: list.items});
 } else {
 res.render("list", {listTitle: _.capitalize(result[0].name), newListItems: result[0].items})
 }})})





app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
