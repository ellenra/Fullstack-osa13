const ActiveSessions = require('./active_sessions')
const Blog = require('./blog')
const ReadingList = require('./reading_list')
const User = require('./user')


User.hasMany(Blog)
Blog.belongsTo(User)

User.belongsToMany(Blog, { through: ReadingList, as: 'saved_blogs' })
Blog.belongsToMany(User, { through: ReadingList, as: 'saved_users' })

User.hasOne(ActiveSessions)
ActiveSessions.belongsTo(User)

module.exports = {
  Blog, User, ReadingList, ActiveSessions
}