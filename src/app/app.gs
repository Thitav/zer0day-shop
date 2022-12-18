import_code("/root/zer0day/BTC")

apt = include_lib("/lib/aptclient.so")
if not apt then
  apt = include_lib(current_path + "/aptclient.so")
  if not apt then
    print_error("aptclient.so lib not found", 1)
  end if
end if

import_code("/root/zer0day/product")
import_code("/root/zer0day/utils")
import_code("/root/zer0day/user")
import_code("/root/zer0day/menu")
import_code("/root/zer0day/hash")
import_code("/root/zer0day/db")
import_code("/root/zer0day/io")

VERSION = "1.0.4"

// proxy = new Server
// proxy.ip = "14.207.242.245"
// proxy.port = 22
// proxy.user = "root"
// proxy.password = "SbyAgYcx2S5FQxy"

// db = new Server
// db.ip = "102.44.143.156"
// db.port = 22
// db.user = "root"
// db.password = "SPLF6UULZNg7ghg"

// Test server
db = new Server
db.ip = "81.124.50.63"
db.port = 22
db.user = "root"
db.password = "mantho"

logo =        "<b><color=#fff> _____             <color=#00bbff>____</color>      __            </color></b>\n"
logo = logo + "<b><color=#fff>/__  /  ___  _____<color=#00bbff>/ __ \</color>____/ /___ ___  __ </color></b>\n"
logo = logo + "<b><color=#fff>  / /  / _ \/ ___<color=#00bbff>/ / / /</color> __  / __ `/ / / / </color></b>\n"
logo = logo + "<b><color=#fff> / /__/  __/ /  <color=#00bbff>/ /_/ /</color> /_/ / /_/ / /_/ /  </color></b>\n"
logo = logo + "<b><color=#fff>/____/\___/_/   <color=#00bbff>\____/</color>\__,_/\__,_/\__, /   </color></b>\n"
logo = logo + "<color=#fff>      v" + VERSION + "                         <b>/____/</b>           </color>\n\n"

logged_user = null
shop_search = ""
shop_sort = ""

log_out = function ()
  globals.logged_user = null
  print_string("Logged out")
end function

set_shop_search = function (command)
  command.pull()
  globals.shop_search = command.join(" ")
  menu_product_shop(shop_search, shop_sort)
end function

set_shop_sort = function (command)
  fields = ["title", "author", "price", "score", "purchases"]

  if command.len < 2 or not command[1].len then
    globals.shop_sort = ""
  else if fields.indexOf(command[1].lower) == null then
    print_error("Invalid sort field")
    wait(1)
  else
    globals.shop_sort = command[1].lower
  end if

  menu_product_shop(shop_search, shop_sort)
end function

menu_user_login = function ()
  for i in range(0, 3)
    username = input_string("Username ", 3, 20, 1)
    password = input_string("Password ", 6, 20, 0, 1)

    user = user_auth(username, password)
    if user then
      globals.logged_user = user
      break
    end if

    if i == 3 then
      print_error("Number of attempts exceeded", 1)
    end if

    print_error("Incorrect credentials, " + (i+1) + "/3 attempts")
  end for
end function

menu_user_register = function ()
  while 1
    username = input_string("Username ", 3, 20, 1)
    if user_load(username) then
      print_error("Username already in use")
      continue
    end if

    btc_username = input_string("BTC username ")

    while 1
      password = input_string("Password ", 6, 20, 0, 1)
      confirm_password = input_string("Confirm password ", 6, 20, 0, 1)

      if password != confirm_password then
        print_error("Passwords dont match")
        continue
      end if

      break
    end while

    print_string("Redirecting to BTC for user verification")
    result = BTC.transfer(btc_username, 0, btc_username)
    if not result.bool then
      print_error("Error verifying BTC account, please try again")
      continue
    end if

    print_warning("Due to game limitations, data corruption may occur")
    print_warning("You shall not upload malware to this shop")
    print_warning("Products in this shop may contain viruses")

    create = input_bool("Confirm account creation [y/n] ", "y", "n")
    if not create then
      print_string("Goodbye :)")
      exit()
    end if

    user = user_create(username, btc_username, password)
    if user then
      globals.logged_user = user
      break
    end if

    print_error("Error creating account")
  end while
end function

menu_user_update_password = function ()
  while 1
    password = input_string("New password ", 6, 20, 0, 1)
    confirm_password = input_string("Confirm password ", 6, 20, 0, 1)

    if password != confirm_password then
      print_error("Passwords dont match")
      continue
    end if

    break
  end while

  logged_user.password = hash_password(logged_user.username, password)
  logged_user.save()
  print_string("Password changed")
end function

menu_user_update_btc = function ()
  btc_username = input_string("New BTC username ")

  print_string("Redirecting to BTC for user verification")
  result = BTC.transfer(btc_username, 0, btc_username)
  if result.bool then
    logged_user.btc_username = btc_username
    logged_user.save()
    print_string("BTC account changed")
  else
    print_error("Error verifying BTC account")
  end if
end function

menu_user_delete = function ()
  print_warning("This action is irreversible")
  print_warning("Deleting your account will delete all your products")

  delete = input_bool("Confirm account deletion [y/n] ", "y", "n")
  if delete then
    user_delete(logged_user.username)
    globals.logged_user = null
    print_string("Account deleted")
  end if
end function

menu_user_account = function ()
  menu = new Menu
  menu.header = "<color=#fff><color=#00bbff>Username:</color> " + logged_user.username + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>BTC username:</color> " + logged_user.btc_username + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Published products:</color> " + logged_user.products.len + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Purchased products:</color> " + logged_user.owns.len + "\n"
  menu.options = [["Change password", @menu_user_update_password], ["Change BTC account", @menu_user_update_btc], ["Log out", @log_out], ["Delete account", @menu_user_delete]]
  menu.call()
end function

menu_product_publish = function ()
  while 1
    title = input_string("Product title ", 3, 20, 1)
    if product_load(title) then
      print_error("Product title already in use")
      continue
    end if

    description = input_string("Product description ", 0, 100)
    price = input_number("Product price ", 1)

    while 1
      files = input_string("Product files (path1, path2...) ", 1).split(",")
      file_paths = []
      file_names = []

      check = 1
      for file in files
        file = file.trim
        if file[0] != "/" then
          file = current_path + "/" + file
        end if

        if not get_shell().host_computer.File(file) then
          print_error("File could not be found: " + file)
          check = 0
          break
        end if

        file_paths.push(file)
        file_names.push(file.split("/").pop)
      end for

      if check then
        upload = 1
        for path in file_paths
          result = product_upload(title, path)
          if not result then
            print_error("Error uploading file " + path)
            product_delete(title)
            upload = 0
            break
          end if
        end for

        if upload then
          break
        end if
      end if
    end while

    product = product_create(title, description, price, file_names)
    if product then
      print_string("Product published")
      break
    end if

    product_delete(title)
    print_error("Error creating product, please try again")
  end while
end function

menu_product_shop = function (search="", sort="")
  globals.shop_search = search
  globals.shop_sort = sort

  menu = new Menu
  menu.fields = ["TITLE", "AUTHOR", "PRICE", "SCORE", "PURCHASES"]
  menu.commands["search"] = @set_shop_search
  menu.commands["sort"] = @set_shop_sort
  menu.paging = 10

  products = product_find_all()
  products_filtered = products
  products_options = []

  if search then
    menu.header = "<color=#00bbff>[+] <color=#fff>Searching by " + search + "\n"
    products_filtered = []
    for product in products
      if product.title.indexOf(search) != null then
        products_filtered.push(product)
      end if
    end for
  end if

  if sort then
    menu.header = menu.header + "<color=#00bbff>[+] <color=#fff>Sorting by " + sort + "\n"
    products_filtered.sort(sort)
  else
    products_filtered.sort("purchases")
  end if

  for product in products_filtered
    if logged_user.username != product.author and logged_user.owns.indexOf(product.title) == null then
      products_options.push([[product.title, product.author, product.price, product.score, product.purchases], @menu_product_info, product])
    end if
  end for

  if not products_options.len then
    print_error("No products have been published yet")
    return
  end if

  menu.options = products_options
  menu.call()
end function

menu_product_update = function (product)
  print_warning("Press return to keep field unchanged")
  new_description = input_string("New description ", 0, 100)
  new_price = input_number("New price ", 0)
  while 1
    new_files = input_string("New files (path1, path2...) ")
    if not new_files.len then
      break
    end if
    new_files = new_files.split(",")
    file_paths = []
    file_names = []

    check = 1
    for file in new_files
      file = file.trim
      if file[0] != "/" then
        file = current_path + "/" + file
      end if

      if not get_shell().host_computer.File(file) then
        print_error("File could not be found: " + file)
        check = 0
        break
      end if

      file_paths.push(file)
      file_names.push(file.split("/").pop)
    end for

    if check then
      upload = 1
      for path in file_paths
        result = product_upload(product.title, path)
        if not result then
          print_error("Error uploading file " + path)
          upload = 0
          break
        end if
      end for

      if upload then
        for file in product.files
          if file_names.indexOf(file) == null then
            product_rmfile(product.title, file)
          end if
        end for

        break
      end if
    end if
  end while

  if new_description then
    product.description = new_description
  end if
  if new_price != null then
    product.price = new_price
  end if
  if new_files then
    product.files = file_names
  end if
  product.save()

  print_string("Product updated")
end function

menu_product_info = function (product)
  menu = new Menu
  menu.header = "<color=#fff><color=#00bbff>Title:</color> " + product.title + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Description:</color> " + product.description + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Author:</color> " + product.author + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Price:</color> " + product.price + " BTC\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Score:</color> " + product.score + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Purchases:</color> " + product.owners.len + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Files:</color> " + product.files.join(", ") + "\n"

  if product.author == logged_user.username then
    menu.options = [["Delete", @menu_product_delete, product], ["Update", @menu_product_update, product]]
  else
    if logged_user.owns.indexOf(product.title) != null then
      if logged_user.upvotes.indexOf(product.title) != null then
        menu.header = menu.header + "\n<color=#00bbff>[+] <color=#fff>You upvoted this product"
        menu.options = [["Remove vote", @product_rmvote, product.title], ["Download", @menu_product_download, product.title]]
      else if logged_user.downvotes.indexOf(product.title) != null then
        menu.header = menu.header + "\n<color=#00bbff>[+] <color=#fff>You downvoted this product"
        menu.options = [["Remove vote", @product_rmvote, product.title], ["Download", @menu_product_download, product.title]]
      else
        menu.options = [["Upvote", @product_upvote, product.title], ["Downvote", @product_downvote, product.title], ["Download", @menu_product_download, product.title]]
      end if
    else
      menu.options = [["Purchase", @menu_product_buy, product.title]]
    end if
  end if

  menu.can_back = 0
  menu.call()
end function

menu_product_download = function (product)
  result = product_download(product)
  if not result then
    print_error("Error downloading files")
    return
  end if

  print_string("Successfully downloaded files")
end function

menu_product_delete = function (product)
  print_warning("This action is irreversible")
  delete = input_bool("Confirm product deletion [y/n] ", "y", "n")

  if delete then
    result = product_delete(product.title)
    if not result then
      print_error("Error deleting product")
      return
    end if

    print_string("Successfully deleted product")
  end if
end function

menu_product_buy = function (product)
  purchase = input_bool("Confirm purchase [y/n] ", "y", "n")

  if purchase then
    result = product_buy(product)
    if not result then
      print_error("Purchase failed, reason: internal error")
    else if result == 1 then
      print_string("Product purchased")
    else
      print_error("Purchase failed, reason: " + result)
    end if
  end if
end function

menu_product_manage = function ()
  products_list = []

  for product in logged_user.products
    product = product_load(product)
    products_list.push([[product.title, product.score, product.purchases], @menu_product_info, product])
  end for

  if not products_list.len then
    print_error("You dont have published any products yet")
    return
  end if

  menu = new Menu
  menu.fields = ["TITLE", "SCORE", "PURCHASES"]
  menu.options = products_list
  menu.paging = 10
  menu.call()
end function

menu_product_library = function ()
  products_list = []

  for product in logged_user.owns
    product = product_load(product)
    products_list.push([product.title, @menu_product_info, product])
  end for

  if not products_list.len then
    print_error("You dont have purchased any products yet")
    return
  end if

  menu = new Menu
  menu.options = products_list
  menu.paging = 10
  menu.call()
end function

// clear_screen()
// print_string("Checking repository...")
// while 1
//   result = apt.check_upgrade(program_path)
//   if typeof(result) == "string" then
//     print_string("Adding repository...")
//     apt.add_repo("12.239.171.129", 1542)
//     apt.update()
//     continue
//   else if result then
//     print_string("New version found, updating...")
//     apt.install("zer0day", current_path)
//     print_string("Update installed, please restart the application")
//     exit()
//   end if
//   break
// end while

clear_screen()
print_string("Connecting to servers...")
// db_conn = db.connect(proxy.connect)
db_conn = db.connect

seed = 0
for i in get_shell.host_computer.public_ip.split(".")
  seed = seed + i.to_int
end for
seed = round(seed * pi)

color = "#" + md5(get_shell.host_computer.public_ip + rnd(seed))[:6]

menu_auth = new Menu
menu_auth.header = logo + "<color=#fff><color=#00bbff>[+]</color> This computer color is <b>[<color=" + color + ">########</color>]\n"
menu_auth.header = menu_auth.header + "<color=#ffbf00>[!] This is a fake client if this information is false\n"
menu_auth.options = [["Login", @menu_user_login], ["Register", @menu_user_register]]
menu_auth.can_back = 0
menu_auth.call()

menu_main = new Menu
menu_main.options = [["Shop", @menu_product_shop], ["Publish", @menu_product_publish], ["My Products", @menu_product_manage], ["My Library", @menu_product_library], ["Account", @menu_user_account]]
while 1
  if not logged_user then
    menu_auth.call()
  else
    globals.logged_user = user_load(logged_user.username)
    menu_main.header = logo + "<color=#fff><color=#00bbff>[+]</color> Welcome to Zer0day <color=#00bbff>" + logged_user.username + "</color>, use 'help' for command list\n"
    menu_main.call()
    wait(2)
  end if
end while
