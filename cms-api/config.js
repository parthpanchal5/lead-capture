module.exports = (_app)=>{
  require("./routes/organization")(_app)
  require("./routes/campaign")(_app)
  require("./routes/post")(_app)
  require("./routes/group")(_app)
  require("./routes/user")(_app)
  require("./routes/profile")(_app)
  require("./routes/user")(_app)
  require("./routes/userGroup")(_app)
  require("./routes/login")(_app)
  require("./routes/change-pass")(_app)

}