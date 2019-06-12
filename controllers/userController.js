const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant

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
    User.findByPk(req.params.id).then(user => {
      Comment.findAndCountAll({
        include: Restaurant,
        where: { UserId: user.id }
      }).then(result => {
        const data = result.rows.map(c => ({
          ...c.dataValues
        }))
        return res.render('profile', {
          comments: data,
          count: result.count
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
  }
}

module.exports = userController
