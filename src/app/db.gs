Server = {}
Server.ip = ""
Server.port = 0
Server.user = ""
Server.password = ""
Server.connect = function (shell=null)
  if not shell then
    shell = get_shell()
  end if
  return shell.connect_service(self.ip, self.port, self.user, self.password)
end function

db_load = function (entity, filepath)
  file = db_conn.host_computer.File(filepath)
  if not file then
    return 0
  end if

  instance = new entity
  data = file.get_content()
  data = data.split(char(10))

  for line in data
    line = line.split(":")

    if typeof(entity[line[0]]) == "list" then
      if line[1].len then
        instance[line[0]] = line[1].split(",")
      else
        instance[line[0]] = []
      end if
    else if typeof(entity[line[0]]) == "number" then
      if line[1].len then
        instance[line[0]] = line[1].to_int()
      else
        instance[line[0]] = 0
      end if
    else
      instance[line[0]] = line[1]
    end if
  end for

  return instance
end function
