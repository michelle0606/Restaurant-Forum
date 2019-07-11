const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const categoryController = {
  getCategories: (req, res, cb) => {
    return Category.findAll().then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id).then(category => {
          cb({
            categories: categories,
            category: category
          })
        })
      } else {
        return cb({ categories: categories })
      }
    })
  },

  postCategory: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: "name didn't exist" })
    } else {
      return Category.create({
        name: req.body.name
      }).then(() => {
        cb({
          status: 'success',
          message: 'restaurant was successfully to update'
        })
      })
    }
  },

  putCategory: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: "name didn't exist" })
    } else {
      return Category.findByPk(req.params.id).then(category => {
        category.update(req.body).then(() => {
          cb({
            status: 'success',
            message: 'category was successfully to update'
          })
        })
      })
    }
  },

  deleteCategory: (req, res, cb) => {
    return Category.findByPk(req.params.id).then(category => {
      category.destroy().then(() => {
        cb({ status: 'success', message: '' })
      })
    })
  }
}

module.exports = categoryController
