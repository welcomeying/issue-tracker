/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.MONGO_URI; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});


module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project).find(req.query).toArray((err, data) => {
          if (err) return;
          res.json(data);
        });
        db.close();
      })
    })
    
    .post(function (req, res){
      if( !req.body.issue_title || !req.body.issue_text || !req.body.created_by ) {
        return res.send("Required fields cannot be left empty");
      }
      let project = req.params.project;
      let newIssue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text || ''
      };
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project).insert(newIssue, (err, data) => {
          if (err) return;
          res.json(newIssue);
        });
        db.close();
      })
    })
    
    .put(function (req, res){
      let project = req.params.project;
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        // find existing issue by _id
        db.collection(project).find({_id: ObjectId(req.body._id)}).toArray((err, data) => {
          if (err) return;
          if (!data) {
            res.send("could not update " + req.body._id);;
          }
          else if (!req.body.issue_title && !req.body.issue_text 
                 && !req.body.created_by && !req.body.assigned_to
                 && !req.body.status_text && !req.body.open) {
            res.send("no updated field sent");
          }
          // if found, update this issue
          else {
            let updatedIssue = data[0];
            Object.keys(data[0]).forEach(key => {
              updatedIssue[key] = data[0][key];
            })
            updatedIssue.issue_title = req.body.issue_title || updatedIssue.issue_title;
            updatedIssue.issue_text = req.body.issue_text || updatedIssue.issue_text;
            updatedIssue.updated_on = new Date();
            updatedIssue.created_by = req.body.created_by || updatedIssue.created_by;
            updatedIssue.assigned_to = req.body.assigned_to || updatedIssue.assigned_to;
            updatedIssue.status_text = req.body.status_text || updatedIssue.status_text;
            updatedIssue.open = !req.body.open;
            db.collection(project).update({_id: ObjectId(req.body._id)}, updatedIssue);
            res.send("successfully updated");
          }
          db.close();
        });
        
      });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      if (!req.body._id || req.body._id.length != 24) {
        res.send("_id error");
      }
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project).remove({_id: ObjectId(req.body._id)}, (err, data) => {
          if (err || !data) {
            console.log(err);
            res.send("could not delete " + req.body._id);
          }
          else {
            res.send("deleted " + req.body._id);
          }
        });
        db.close();
      });
    });
    
};
