const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 9

const restController = {
  getRestaurants: (req, res) => {
    let whereQuery = {}
    let categoryId = ''
    let offset = 0

    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }

    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1
      )

      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1

      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        isFavorited: req.user.FavoritedRestaurants.some(
          d => d.id === Number(r.id)
        ),
        isLiked: req.user.LikedRestaurants.some(d => d.id === Number(r.id))
      }))
      Category.findAll().then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      order: [['createdAt', 'DESC']],
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: User }
      ]
    }).then(restaurant => {
      restaurant.increment('viewCounts', { by: 1 })
      const isFavorited = restaurant.FavoritedUsers.some(
        d => d.id === Number(req.user.id)
      )
      const isLiked = restaurant.LikedUsers.some(
        d => d.id === Number(req.user.id)
      )
      console.log(restaurant.Comments)
      return res.render('restaurant', {
        restaurant: restaurant,
        isFavorited: isFavorited,
        isLiked: isLiked
      })
    })
  },

  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category, { model: User, as: 'FavoritedUsers' }]
    }).then(restaurant => {
      Comment.findAndCountAll({
        where: { RestaurantId: req.params.id }
      }).then(results => {
        res.render('dashboard', {
          restaurant: restaurant,
          commentCount: results.count,
          saveCount: restaurant.FavoritedUsers.length
        })
      })
    })
  },

  getFeeds: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      }).then(comments => {
        return res.render('feeds', {
          restaurants: restaurants,
          comments: comments
        })
      })
    })
  },

  getAllRest: (req, res) => {
    return Restaurant.findAll().then(results => {
      return res.send(results)
    })
  },

  getTopRest: (req, res) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    }).then(restaurants => {
      restaurants = restaurants
        .map(restaurant => ({
          ...restaurant.dataValues,
          description: restaurant.dataValues.description.substring(0, 50),
          FavoritedCount: restaurant.FavoritedUsers.length,
          isFavorited: restaurant.FavoritedUsers.map(d => d.id).includes(
            req.user.id
          )
        }))
        .sort((a, b) => b.FavoritedCount - a.FavoritedCount)
        .slice(0, 10)
      return res.render('topRest', { restaurants: restaurants })
    })
  }
}

module.exports = restController
