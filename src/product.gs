PRODUCTS_PATH = "/root/store/products/"

Product = {}
Product.title = ""
Product.description = ""
Product.author = ""
Product.price = 0
Product.score = 0
Product.owners = []
Product.files = []
Product.save = function ()
  product_data = "title:" + self.title + char(10) + "description:" + self.description + char(10)
  product_data = product_data + "author:" + self.author + char(10) + "price:" + self.price + char(10)
  product_data = product_data + "score:" + self.score + char(10) + "owners:" + self.owners.join(",") + char(10)
  product_data = product_data + "files:" + self.files.join(",")

  db_conn.host_computer.create_folder(PRODUCTS_PATH, self.title)
  db_conn.host_computer.touch(PRODUCTS_PATH + self.title, self.title + ".def")
  file = db_conn.host_computer.File(PRODUCTS_PATH + self.title + "/" + self.title + ".def")
  file.set_content(product_data)
end function

product_load = function (title)
  product = db_load(Product, PRODUCTS_PATH + title + "/" + title + ".def")
  if not product then
    return 0
  end if

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

    for owner in product.owners
      owner = user_load(owner)
      owner.owns.remove(owner.owns.indexOf(title))
      owner.save()
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
  products = directory.get_folders()

  for i in range(0, products.len-1)
    product = product_load(products[i].name)
    if not product then
      product_delete(products[i].name)
      products.remove(i)
      continue
    end if

    products[i] = product
  end for

  return products
end function

product_upload = function (title, filepath)
  db_conn.host_computer.create_folder(PRODUCTS_PATH, title)
  result = get_shell().scp(filepath, PRODUCTS_PATH + title, db_conn)
  if result != 1 then
    return 0
  end if

  return 1
end function

product_download = function (product)
  for file in product.files
    result = db_conn.scp(PRODUCTS_PATH + product.title + "/" + file, current_path, get_shell())
    if result != 1 then
      return 0
    end if
  end for

  return 1
end function

product_buy = function (product)
  author = user_load(product.author)
  if not author then
    return 0
  end if

  if product.price > 0 then
    result = BTC.transfer(author.btc_username, product.price)
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

product_upvote = function (product)
  product.score = product.score + 1
  product.save()

  logged_user.upvotes.push(product.title)
  logged_user.save()
end function

product_downvote = function (product)
  product.score = product.score - 1
  product.save()

  logged_user.downvotes.push(product.title)
  logged_user.save()
end function
