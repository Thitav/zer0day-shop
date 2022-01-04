db_connect = function (db_ip, db_port, db_user, db_password)
  shell = get_shell()
  db_conn = shell.connect_service(db_ip, db_port, db_user, db_password)
  if not db_conn then
    return 0
  end if

  return db_conn
end function
