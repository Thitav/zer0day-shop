import_code("/home/Thitav/store/product")
import_code("/home/Thitav/store/user")
import_code("/home/Thitav/store/menu")
import_code("/home/Thitav/store/db")
import_code("/home/Thitav/store/io")
import_code("/home/Thitav/store/BTC")

DB_IP = "34.51.110.137"
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
    btc_username = user_input("BTC username > ")
    password = user_input("Password > ", 1)
    confirm_password = user_input("Confirm password > ", 1)

    if password != confirm_password then
      print("[-] Passwords dont match")
      continue
    end if

    user = user_create(username, btc_username, password)
    if user then
      globals.logged_user = user
      break
    end if

    print("[-] Username already in use")
  end while
end function

menu_product_publish = function ()
  while 1
    title = user_input("Product title > ")
    result = product_load(title)
    if result then
      print("[-] Title already in use")
      continue
    end if

    description = user_input("Product description > ")
    price = user_input("Product price > ")
    files = user_input("Product files (path1,path2...) > ").split(",")

    upload = 1
    for file in files
      if file[0] != "/" then
        file = current_path + "/" + file
      end if

      result = product_upload(title, file)
      if not result then
        upload = 0
        print("[-] File could not be found: " + file)
        break
      end if
    end for

    if not upload then
      product_delete(title)
      continue
    end if

    product = product_create(title, description, price, files)
    if product then
      break
    end if

    product_delete(title)
    print("[-] Error creating product, please try again")
  end while
end function

menu_product_shop = function ()
  products = product_find_all()
  products_list = []

  for product in products
    if logged_user.username != product.author and logged_user.owns.indexOf(product.title) == null then
      products_list.push([[product.title, product.price + " BTC", "By " + product.author], @menu_product_info, product])
    end if
  end for

  if not products_list.len then
    print("[-] No products have been published yet")
    return
  end if

  menu = new Menu
  menu.options = products_list
  menu.call()
end function

menu_product_info = function (product)
  menu = new Menu
  menu.header = "Title: " + product.title + "\n"
  menu.header = menu.header + "Description: " + product.description + "\n"
  menu.header = menu.header + "Author: " + product.author + "\n"
  menu.header = menu.header + "Price: " + product.price + " BTC\n"
  menu.header = menu.header + "Score: " + product.score + "\n"
  menu.header = menu.header + "Purchases: " + product.owners.len + "\n"
  menu.header = menu.header + "Files: " + product.files.join(", ")

  if product.author == logged_user.username then
    menu.options = [["Delete", @menu_product_delete, product]]
  else
    if logged_user.upvotes.indexOf(product.title) != null then
      menu.header = menu.header + "You upvoted this product"
      menu.options = [["Remove vote", @exit]]
    else if logged_user.downvotes.indexOf(product.title) != null then
      menu.header = menu.header + "You downvoted this product"
      menu.options = [["Remove vote", @exit]]
    else
      menu.options = [["Upvote", @product_upvote, product], ["Downvote", @product_downvote, product]]
    end if

    if logged_user.owns.indexOf(product.title) != null then
      menu.options.push(["Download", @menu_product_download, product])
    else
      menu.options.push(["Purchase", @menu_product_buy, product])
    end if
  end if

  menu.call()
end function

menu_product_download = function (product)
  result = product_download(product)
  if not result then
    print("[-] Error downloading files")
    return
  end if

  print("[+] Successfully downloaded files")
end function

menu_product_delete = function (product)
  delete = user_input("Confirm delete [y/n] > ")
  if delete == "n" then
    return
  end if

  result = product_delete(product.title)
  if not result then
    print("[-] Error deleting product")
    return
  end if

  print("[+] Successfully deleted product")
end function

menu_product_buy = function (product)
  purchase = user_input("Confirm purchase [y/n] > ")
  if purchase == "n" then
    return
  end if

  result = product_buy(product)
  if not result then
    print("[-] Purchase failed, reason: internal error")
  else if result == 1 then
    print("[+] Product purchased")
  else
    print("[-] Purchase failed, reason: " + result)
  end if
end function

menu_product_manage = function ()
  products_list = []

  for product in logged_user.products
    product = product_load(product)
    products_list.push([product.title, @menu_product_info, product])
  end for

  if not products_list.len then
    print("[-] You dont have published any products yet")
    return
  end if

  menu = new Menu
  menu.options = products_list
  menu.call()
end function

menu_product_library = function ()
  products_list = []

  for product in logged_user.owns
    product = product_load(product)
    products_list.push([product.title, @menu_product_info, product])
  end for

  if not products_list.len then
    print("[-] You dont have purchased any products yet")
    return
  end if

  menu = new Menu
  menu.options = products_list
  menu.call()
end function

clear_screen()
print("[+] Connecting to servers...")
db_conn = db_connect(DB_IP, DB_PORT, DB_USER, DB_PASSWORD)

menu_auth = new Menu
menu_auth.header = "Welcome to the zer0Day store!"
menu_auth.options = [["Login", @menu_user_login], ["Register", @menu_user_register]]
menu_auth.call()

menu_main = new Menu
menu_main.options = [["Shop", @menu_product_shop], ["Publish", @menu_product_publish], ["My Products", @menu_product_manage], ["My Library", @menu_product_library]]
while 1
  menu_main.header = "[+] Logged as " + logged_user.username
  menu_main.call()
  wait(2)
end while
