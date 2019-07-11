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
  }
}

module.exports = categoryController
