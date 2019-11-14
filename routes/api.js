/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'
const Issue = require('../models/Issue')
const BadRequestError = require('http-errors').BadRequestError
module.exports = function (app) {
  app
    .route('/api/issues/:project')
    .get(function (req, res, next) {
      const project = req.params.project
      const filter = { ...req.query, project }
      Issue.find(filter)
        .then(result => res.json(result))
        .catch(error => next(error))
    })
    .post(function (req, res, next) {
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
        .catch(error => next(error))
    })
    .put(function (req, res, next) {
      const id = req.body._id
      if (!id) {
        throw new BadRequestError('Missing Id')
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
          return res.json({ message: `successfully updated ${id}` })
        })
        .catch(error => next(error))
    })
    .delete(function (req, res, next) {
      if (!req.body._id) {
        return res.status(400).json({ error: 'Missing Issue id' })
      }
      Issue.deleteOne({ _id: req.body._id })
        .then(result => res.json({ message: `deleted ${req.body._id}` }))
        .catch(error => next(error))
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
