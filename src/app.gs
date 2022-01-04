import_code("/home/Thitav/store/product.src")
import_code("/home/Thitav/store/user.src")
import_code("/home/Thitav/store/menu.src")
import_code("/home/Thitav/store/db.src")

DB_IP = "113.226.78.106"
DB_PORT = 22
DB_USER = "root"
DB_PASSWORD = "dani2210"

menu_user_login = function ()
  for i in range(0, 3)
    username = user_input("Username > ")
    password = user_input("Password > ", 1)

    user = user_auth(username, password)
    if user then
      globals.logged_user = user
      break
    end if

    if i == 3 then
      exit("[-] Number of attempts exceeded")
    end if

    print("[-] Incorrect credentials, " + (i+1) + "/3 attempts")
  end for
end function

menu_user_register = function ()
  while 1
    username = user_input("Username > ")
    password = user_input("Password > ", 1)
    confirm_password = user_input("Confirm password > ", 1)

    if password != confirm_password then
      print("[-] Passwords dont match")
      continue
    end if

    user = new User
    user.username = username
    user.password = password
    result = user.save()
    if result then
      globals.logged_user = user
      break
    end if

    print("[-] Username already in use")
  end while
end function

menu_shop = function ()
  products = product_find_all()
  products_list = []

  for product in products
    products_list.push([[product.title, product.description, product.author.username], @exit])
  end for

  menu = new Menu
  menu.options = products_list
  menu.call()
end function

app = function ()
  clear_screen()
  print("[+] Connecting to servers...")
  globals.db_conn = db_connect(DB_IP, DB_PORT, DB_USER, DB_PASSWORD)

  clear_screen()
  print("Welcome to the zer0Day store!")
  menu = new Menu
  menu.options = [["Login", @menu_user_login], ["Register", @menu_user_register]]
  menu.call()

  clear_screen()
  print("[+] Logged as " + logged_user.username)
  menu = new Menu
  menu.options = [["Shop", @menu_shop], ["Announce", @exit], ["Options", @exit]]
  menu.call()
end function

app()
