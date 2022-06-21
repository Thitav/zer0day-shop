db_connect = function (db_ip, db_port, db_user, db_password)
  shell = get_shell()
  db_conn = shell.connect_service(db_ip, db_port, db_user, db_password)
  if not db_conn then
    return 0
  end if

  return db_conn
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
