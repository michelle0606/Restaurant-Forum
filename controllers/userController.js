const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User

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
  editUser: (req, res) => {
    return User.findAll().then(user => {
      res.render('admin/editUser', { user: user })
    })
  },
  putUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (user.isAdmin) return user.update({ isAdmin: false })
        else return user.update({ isAdmin: true })
      })
      .then(() => {
        req.flash('success_messages', 'user was successfully to update')
        res.redirect('/admin/users')
      })
  }
}

module.exports = userController
