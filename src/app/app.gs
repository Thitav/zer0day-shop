import_code("/home/Thitav/build/BTC")

apt = include_lib("/lib/aptclient.so")

import_code("/home/Thitav/build/product")
import_code("/home/Thitav/build/user")
import_code("/home/Thitav/build/menu")
import_code("/home/Thitav/build/hash")
import_code("/home/Thitav/build/db")
import_code("/home/Thitav/build/io")

logo =        "<b><color=#fff> _____             <color=#00bbff>____</color>      __            </color></b>\n"
logo = logo + "<b><color=#fff>/__  /  ___  _____<color=#00bbff>/ __ \</color>____/ /___ ___  __ </color></b>\n"
logo = logo + "<b><color=#fff>  / /  / _ \/ ___<color=#00bbff>/ / / /</color> __  / __ `/ / / / </color></b>\n"
logo = logo + "<b><color=#fff> / /__/  __/ /  <color=#00bbff>/ /_/ /</color> /_/ / /_/ / /_/ /  </color></b>\n"
logo = logo + "<b><color=#fff>/____/\___/_/   <color=#00bbff>\____/</color>\__,_/\__,_/\__, /   </color></b>\n"
logo = logo + "<b><color=#fff>                                 /____/    </color></b>\n"

DB_IP = "34.51.110.137"
DB_PORT = 22
DB_USER = "root"
DB_PASSWORD = "RvCUmhn7hGED6EC"

shop_search = ""
shop_sort = ""

set_shop_search = function (command)
  command.pull()
  shop_search = command.join(" ")
  menu_product_shop()
end function

set_shop_sort = function (command)
  fields = ["title", "author", "price", "score", "purchases"]

  if command.len < 2 then
    print_error("Invalid sort field")
    wait(1)
  else if fields.indexOf(command[1].lower) == null then
    print_error("Invalid sort field")
    wait(1)
  else
    shop_sort = command[1].lower
  end if

  menu_product_shop()
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
    user = user_create(username, btc_username, password)
    if user then
      globals.logged_user = user
      break
    end if

    print_error("Error creating account")
  end while
end function

menu_user_delete = function ()
  delete = input_bool("Confirm account deletion [y/n] ", "y", "n")

  if delete then
    user_delete(logged_user.username)
    print_string("Account deleted")
  end if
end function

menu_user_account = function ()
  menu = new Menu
  menu = new Menu
  menu.header = "<color=#fff><color=#00bbff>Username:</color> " + logged_user.username + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Published products:</color> " + logged_user.products.len + "\n"
  menu.header = menu.header + "<color=#fff><color=#00bbff>Purchased products:</color> " + logged_user.owns.len + "\n"
  menu.options = [["Delete account", @menu_user_delete]]
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
    price = input_number("Product price ")
    while 1
      files = input_string("Product files (path1,path2...) ", 1).split(",")

      upload = 1
      for file in files
        files[files.indexOf(file)] = file.split("/").pop()

        if file[0] != "/" then
          file = current_path + "/" + file
        end if

        result = product_upload(title, file)
        if not result then
          upload = 0
          print_error("File could not be found: " + file)
          break
        end if
      end for

      if not upload then
        product_delete(title)
        continue
      end if

      break
    end while

    product = product_create(title, description, price, files)
    if product then
      print_string("Product published")
      break
    end if

    product_delete(title)
    print_error("Error creating product, please try again")
  end while
end function

menu_product_shop = function ()
  products = product_find_all()
  products_filtered = products
  products_options = []

  if shop_search then
    products_filtered = []
    for product in products
      if product.title.indexOf(shop_search) != null then
        products_filtered.push(product)
      end if
    end for
  end if

  if shop_sort then
    products_filtered.sort(shop_sort)
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

  menu = new Menu
  menu.fields = ["TITLE", "AUTHOR", "PRICE", "SCORE", "PURCHASES"]
  menu.options = products_options
  menu.commands["search"] = @set_shop_search
  menu.commands["sort"] = @set_shop_sort
  menu.paging = 10
  menu.call()
end function

menu_product_update = function (product)
  new_description = input_string("New description ", 0, 100)
  new_price = input_number("New price ", 0)
  while 1
    new_files = input_string("New files (path1,path2...) ")
    if not new_files.len then
      break
    end if
    new_files = new_files.split(",")

    upload = 1
    for file in new_files
      new_files[new_files.indexOf(file)] = file.split("/").pop()

      if file[0] != "/" then
        file = current_path + "/" + file
      end if

      result = product_upload(product.title, file)
      if not result then
        upload = 0
        print_error("File could not be found: " + file)
        break
      end if
    end for

    if not upload then
      for file in new_files
        product_rmfile(product.title, file)
      end for
      continue
    end if

    for file in product.files
      if new_files.indexOf(file) == null then
        product_rmfile(product.title, file)
      end if
    end for

    break
  end while

  if new_description then
    product.description = new_description
  end if
  if new_price != null then
    product.price = new_price
  end if
  if new_files then
    product.files = new_files
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
        menu.options = [["Remove vote", @product_rmvote, product.title]]
      else if logged_user.downvotes.indexOf(product.title) != null then
        menu.header = menu.header + "\n<color=#00bbff>[+] <color=#fff>You downvoted this product"
        menu.options = [["Remove vote", @product_rmvote, product.title]]
      else
        menu.options = [["Upvote", @product_upvote, product.title], ["Downvote", @product_downvote, product.title]]
      end if

      menu.options.push(["Download", @menu_product_download, product.title])
    else
      menu.options.push(["Purchase", @menu_product_buy, product.title])
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
    products_list.push([product.title, @menu_product_info, product])
  end for

  if not products_list.len then
    print_error("You dont have published any products yet")
    return
  end if

  menu = new Menu
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

//clear_screen()
//print_string("Checking repository...")
//while 1
//  result = apt.check_upgrade(program_path)
//  if typeof(result) == "string" then
//    print_string("Adding repository...")
//    apt.add_repo("214.108.200.135", 1542)
//    apt.update()
//    continue
//  else if result then
//    print_string("New version found, updating...")
//    apt.install("zer0day", current_path)
//  end if
//  break
//end while

clear_screen()
print_string("Connecting to servers...")
db_conn = db_connect(DB_IP, DB_PORT, DB_USER, DB_PASSWORD)

menu_auth = new Menu
menu_auth.header = logo
menu_auth.options = [["Login", @menu_user_login], ["Register", @menu_user_register]]
menu_auth.can_back = 0
menu_auth.call()

menu_main = new Menu
menu_main.options = [["Shop", @menu_product_shop], ["Publish", @menu_product_publish], ["My Products", @menu_product_manage], ["My Library", @menu_product_library], ["Account", @menu_user_account]]
while 1
  logged_user = user_load(logged_user.username)
  menu_main.header = logo + "<color=#00bbff>[+] <color=#fff>Logged as </color>" + logged_user.username + "\n"
  menu_main.call()
  wait(2)
end while
