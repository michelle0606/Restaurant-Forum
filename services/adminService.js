const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User

const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '62019706c9916ea'

const adminController = {
  getRestaurants: (req, res, cb) => {
    return Restaurant.findAll({ include: [Category] }).then(restaurants => {
      cb({ restaurants: restaurants })
    })
  },
  getRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(
      restaurant => {
        cb({ restaurant: restaurant })
      }
    )
  },
  deleteRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.destroy().then(() => {
        cb({ status: 'success', message: '' })
      })
    })
  }
}

module.exports = adminController
