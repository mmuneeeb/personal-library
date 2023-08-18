/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const ObjectId = mongoose.Types.ObjectId;

const db = mongoose.connect(process.env.DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  book_comment: [String],
})
const book = mongoose.model("book", bookSchema);
const bookModel = book;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      book.find({}, (err, data) => {
        if (!data){
          res.json([]);
        }else{
          const formatData = data.map((book) => {
            return {
              _id: book._id,
              title: book.title,
              comments: book.book_comment,
              commentcount: book.book_comment.length,
            };
          });
          res.json(formatData);
        }
      });
    })
    
    .post(function (req, res){
      //response will contain new book object including atleast _id and title
      let title = req.body.title;

      if (!title){
        res.send("missing required field title");
        return;
      }

      let newBook = new book({
        title: title, 
        book_comment: req.body.comment
      });

      newBook.save((err, data) => {
        if (err || !data){
          res.send("there was an error saving")
        }else{
          res.json({_id: data._id, title: data.title});
        }
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      book.deleteMany({}, (err, data) => {
        if (err || !data){
          res.send("there was an error deleting")
        }else{
          res.send("complete delete successful")
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      book.findById(bookid, (err,data) => {
        if(!data){
          res.send("no book exists");
        }else{
          res.json({
            _id: data._id,
            title: data.title,
            comments: data.book_comment,
          })
        }
      })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      if(!comment){
        res.send("missing required field comment");
      }else{
        book.findById(bookid, (err,data) => {
          if(!data){
            res.send("no book exists")
          }else{
            data.book_comment.push(comment);
            data.save((err, data) => {
              res.json({
                _id: data._id,
                title: data.title,
                comments: data.book_comment,
              })
                
              })
            }
          })
      }
    
      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      book.findByIdAndDelete(bookid, (err, data) => {
        if (err || !data){
          res.send("no book exists")
        }else{
          res.send("delete successful")
        }
      })
    });
  
};
