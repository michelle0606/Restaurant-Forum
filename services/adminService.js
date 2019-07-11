const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User

const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

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

  postRestaurant: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then(() => {
          cb({
            status: 'success',
            message: 'restaurant was successfully created'
          })
        })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then(() => {
        cb({
          status: 'success',
          message: 'restaurant was successfully created'
        })
      })
    }
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
