const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '62019706c9916ea'

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: async (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    }
    const user = await User.findOne({ where: { email: req.body.email } })
    if (user) {
      req.flash('error_messages', '信箱重複！')
      return res.redirect('/signup')
    }
    const done = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
    })
    if (done) {
      req.flash('success_messages', '成功註冊帳號！')
      return res.redirect('/signin')
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        {
          model: Comment,
          include: Restaurant
        },
        {
          model: Restaurant,
          as: 'FavoritedRestaurants'
        },
        {
          model: User,
          as: 'Followers'
        },
        {
          model: User,
          as: 'Followings'
        }
      ]
    }).then(user => {
      const followers = user.Followers
      const followings = user.Followings
      const favorites = user.FavoritedRestaurants
      const comments = user.Comments
      comments.map(c => ({
        ...c.dataValues,
        text: c.dataValues.text.substring(0, 20)
      }))

      let restaurants = comments.map(c => c.Restaurant.id)
      restaurants = Array.from(new Set(restaurants))

      Restaurant.findAll({ where: { id: restaurants } })
        .then(restaurant => {
          is_not_repeat = restaurant.map(restaurant => ({
            ...restaurant.dataValues
          }))
        })
        .then(() => {
          res.render('profile', {
            user: user,
            comments: comments,
            followers: followers,
            followings: followings,
            favorites: favorites,
            restaurants: is_not_repeat
          })
        })
    })
  },

  editUser: (req, res) => {
    return res.render('editProfile')
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) console.log('Error: ', err)
        return User.findByPk(req.params.id).then(user => {
          user
            .update({
              name: req.body.name,
              image: file ? img.data.link : user.image
            })
            .then(() => {
              req.flash(
                'success_messages',
                'Profile was successfully to update'
              )
              res.redirect(`/users/${req.params.id}`)
            })
        })
      })
    } else {
      return User.findByPk(req.params.id).then(user => {
        user
          .update({
            name: req.body.name,
            image: user.image
          })
          .then(() => {
            req.flash('success_messages', 'Profile was successfully to update')
            res.redirect(`/users/${req.params.id}`)
          })
      })
    }
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(() => {
      return res.redirect('back')
    })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      favorite.destroy().then(() => {
        return res.redirect('back')
      })
    })
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(() => {
      return res.redirect('back')
    })
  },

  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(like => {
      like.destroy().then(() => {
        return res.redirect('back')
      })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then(followship => {
      return res.redirect('back')
    })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy().then(followship => {
        return res.redirect('back')
      })
    })
  },

  getTopUser: (req, res) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  }
}

module.exports = userController
