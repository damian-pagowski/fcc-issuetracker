/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'
const Issue = require('../models/Issue')

module.exports = function (app) {
  app
    .route('/api/issues/:project')
    .get(function (req, res) {
      const project = req.params.project
      const filter = { ...req.query, project }
      Issue.find(filter).then(result => res.json(result)).catch(error => {
        if (error) {
          res
            .status(400)
            .json({ error: 'Failed to query for issues', details: error })
        }
      })
    })
    .post(function (req, res) {
      const project = req.params.project
      if (!project) {
        return res.json({
          error: 'Failed to create Issue',
          details: 'Project id missing'
        })
      }
      const issue = new Issue({ ...req.body, project })
      issue
        .save()
        .then(data => {
          res.json(data)
        })
        .catch(error => {
          if (error) {
            console.log(
              'ERROR - Issue not saved to DB: ' + JSON.stringify(error)
            )
            return res.status(400).json({
              error: 'Failed to create Issue',
              details: error.errors
            })
          }
        })
    })
    .put(function (req, res) {
      const id = req.body._id
      if (!id) {
        return res.status(400).json({
          error: 'Failed to Update Issue',
          details: 'missing issue id'
        })
      }
      if (!req.body) {
        return res.status(400).json({
          error: 'Failed to Update Issue',
          details: 'missing request body'
        })
      }
      const update = prepareUpdate(req.body)
      Issue.findOneAndUpdate({ _id: id }, update)
        .then(result => {
          console.log('RESPONSE: ' + JSON.stringify(result))
          return res.json({ message: `successfully updated ${id}` })
        })
        .catch(error => {
          if (error) {
            return res
              .status(400)
              .json({ error: `could not update ${id}`, details: error })
          }
        })
    })
    .delete(function (req, res) {
      if (!req.body._id) {
        return res.status(400).json({ error: 'Missing Issue id' })
      }
      Issue.deleteOne({ _id: req.body._id })
        .then(result => res.json({ message: `deleted ${req.body._id}` }))
        .catch(error => {
          if (error) {
            res.status(400).json({ error: `could not delete ${req.body._id}` })
          }
        })
    })
 
}

function prepareUpdate (obj) {
  const update = Object.assign(obj)
  for (let key in update) {
    if (update.hasOwnProperty(key)) {
      if (key == '_id') {
        delete update._id
      }
      if (key != 'open' && !update[key]) {
        delete update[key]
      }
    }
  }
  return update
}
