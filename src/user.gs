USERS_PATH = "/root/store/users/"

User = {}
User.username = ""
User.btc_username = ""
User.password = ""
User.products = []
User.owns = []
User.upvotes = []
User.downvotes = []
User.save = function ()
  user_data = "username:" + self.username + char(10) + "btc_username:" + self.btc_username + char(10)
  user_data = user_data + "password:" + self.password + char(10) + "products:" + self.products.join(",") + char(10)
  user_data = user_data + "owns:" + self.owns.join(",") + char(10) + "upvotes:" + self.upvotes.join(",") + char(10)
  user_data = user_data + "downvotes:" + self.downvotes.join(",")

  db_conn.host_computer.touch(USERS_PATH, self.username + ".def")
  file = db_conn.host_computer.File(USERS_PATH + self.username + ".def")
  file.set_content(user_data)
end function

user_load = function (username)
  user = db_load(User, USERS_PATH + username + ".def")
  if not user then
    return 0
  end if

  return user
end function

user_create = function (username, btc_username, password)
  file = db_conn.host_computer.File(USERS_PATH + username + ".def")
  if file then
    return 0
  end if

  user = new User
  user.username = username
  user.btc_username = btc_username
  user.password = md5(password)
  user.save()

  return user
end function

user_auth = function (username, password)
  user = user_load(username)
  if not user then
    return 0
  end if

  password = md5(password)
  if user.password != password then
    return 0
  end if

  return user
end function
