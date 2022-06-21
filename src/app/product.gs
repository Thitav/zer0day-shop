PRODUCTS_PATH = "/root/store/products/"

Product = {}
Product.title = ""
Product.description = ""
Product.author = ""
Product.price = 0
Product.score = 0
Product.purchases = 0
Product.upvoters = []
Product.downvoters = []
Product.owners = []
Product.files = []
Product.save = function ()
  product_data = "title:" + self.title + char(10) + "description:" + self.description + char(10)
  product_data = product_data + "author:" + self.author + char(10) + "price:" + self.price + char(10)
  product_data = product_data + "upvoters:" + self.upvoters.join(",") + char(10) + "downvoters:" + self.downvoters.join(",") + char(10)
  product_data = product_data + "owners:" + self.owners.join(",") + char(10) + "files:" + self.files.join(",")

  db_conn.host_computer.create_folder(PRODUCTS_PATH, self.title)
  db_conn.host_computer.create_folder(PRODUCTS_PATH + self.title, "files")
  result = db_conn.host_computer.touch(PRODUCTS_PATH + self.title, self.title + ".def")
  file = db_conn.host_computer.File(PRODUCTS_PATH + self.title + "/" + self.title + ".def")
  file.set_content(product_data)
end function

product_load = function (title)
  product = db_load(Product, PRODUCTS_PATH + title + "/" + title + ".def")
  if not product then
    return 0
  end if

  product.score = product.upvoters.len - product.downvoters.len
  product.purchases = product.owners.len

  return product
end function

product_create = function (title, description, price, files)
  file = db_conn.host_computer.File(PRODUCTS_PATH + title + "/" + title + ".def")
  if file then
    return 0
  end if

  product = new Product
  product.title = title
  product.description = description
  product.author = logged_user.username
  product.price = price
  product.files = files
  product.save()

  logged_user.products.push(title)
  logged_user.save()

  return product
end function

product_delete = function (title)
  file = db_conn.host_computer.File(PRODUCTS_PATH + title)
  if not file then
    return 0
  end if

  product = product_load(title)
  if product then
    author = user_load(product.author)
    author.products.remove(author.products.indexOf(title))
    author.save()

    for user in product.owners
      user = user_load(user)
      user.owns.remove(user.owns.indexOf(title))
      user.save()
    end for

    for user in product.upvoters
      user = user_load(user)
      user.upvotes.remove(user.upvotes.indexOf(title))
      user.save()
    end for

    for user in product.downvoters
      user = user_load(user)
      user.downvotes.remove(user.downvotes.indexOf(title))
      user.save()
    end for
  end if

  result = file.delete()
  if result then
    return 0
  end if

  return 1
end function

product_find_all = function ()
  directory = db_conn.host_computer.File(PRODUCTS_PATH)
  folders = directory.get_folders()
  products = []

  for folder in folders
    product = product_load(folder.name)
    if not product then
      product_delete(folder.name)
      continue
    end if
    products.push(product)
  end for

  return products
end function

product_upload = function (title, filepath)
  db_conn.host_computer.create_folder(PRODUCTS_PATH, title)
  db_conn.host_computer.create_folder(PRODUCTS_PATH + title, "files")
  result = get_shell().scp(filepath, PRODUCTS_PATH + title + "/files", db_conn)
  if result != 1 then
    return 0
  end if

  return 1
end function

product_download = function (title)
  product = product_load(title)
  if not product then
    return 0
  end if

  for file in product.files
    result = db_conn.scp(PRODUCTS_PATH + product.title + "/files/" + file, current_path, get_shell())
    if result != 1 then
      return 0
    end if
  end for

  return 1
end function

product_buy = function (title)
  product = product_load(title)
  if not product then
    return 0
  end if

  author = user_load(product.author)
  if not author then
    return 0
  end if

  if logged_user.btc_username == author.btc_username then
    return "same BTC username as seller"
  end if

  if product.price > 0 then
    result = BTC.transfer(author.btc_username, product.price, logged_user.btc_username)
    if not result.bool then
      return result.stderr
    end if
  end if

  logged_user.owns.push(product.title)
  logged_user.save()

  product.owners.push(logged_user.username)
  product.save()

  return 1
end function

product_upvote = function (title)
  product = product_load(title)
  if not product then
    return 0
  end if

  product.score = product.score + 1

  product.upvoters.push(logged_user.username)
  product.save()

  logged_user.upvotes.push(product.title)
  logged_user.save()
end function

product_downvote = function (title)
  product = product_load(title)
  if not product then
    return 0
  end if

  product.score = product.score - 1

  product.downvoters.push(logged_user.username)
  product.save()

  logged_user.downvotes.push(product.title)
  logged_user.save()
end function

product_rmvote = function (title)
  product = product_load(title)
  if not product then
    return 0
  end if

  if logged_user.upvotes.indexOf(product.title) != null then
    logged_user.upvotes.remove(logged_user.upvotes.indexOf(product.title))
    logged_user.save()

    product.upvoters.remove(product.upvoters.indexOf(logged_user.username))
    product.save()
  else if logged_user.downvotes.indexOf(product.title) != null then
    logged_user.downvotes.remove(logged_user.downvotes.indexOf(product.title))
    logged_user.save()

    product.downvoters.remove(product.downvoters.indexOf(logged_user.username))
    product.save()
  end if
end function

product_rmfile = function (title, file)
  product = product_load(title)
  if not product then
    return 0
  end if

  file = db_conn.host_computer.File(PRODUCTS_PATH + product.title + "/" + file)
  if not file then
    return 0
  end if

  result = file.delete()
  if not result then
    return 0
  end if

  return 1
end function
