USERS_PATH = "/root/store/users/";

User = {}
User.username = ""
User.password = ""
User.save = function ()
  user_data = "password:" + md5(self.password)
  db_conn.host_computer.touch(USERS_PATH, self.username)
  file = db_conn.host_computer.File(USERS_PATH + self.username)
  file.set_content(user_data)
end function

user_load = function (username)
  file = db_conn.host_computer.File(USERS_PATH + username)
  if not file then
    return 0
  end if

  user = new User
  user.username = username
  user_data = file.get_content()
  user_data = user_data.split(char(10))

  for line in user_data
    line = line.split(":")
    line[1] = line[1].split(",")
    if line[1].len == 1 then
      line[1] = line[1][0]
    end if

    user[line[0]] = line[1]
  end for

  return user
end function

user_create = function (username, password)
  file = db_conn.host_computer.File(USERS_PATH + self.username)
  if file then
    return 0
  end if

  user = new User
  user.username = username
  user.password = password
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
