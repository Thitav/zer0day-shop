import_code("/home/Thitav/store/user.src")

PRODUCTS_PATH = "/root/store/products/"

Product = {}
Product.title = ""
Product.description = ""
Product.author = null
Product.files = []
Product.save = function ()
  product_data = "description:" + self.description + char(10) + "author:" + self.author.username + char(10)
  product_data = product_data + "files:" + self.files.join(",")
  db_conn.host_computer.touch(PRODUCTS_PATH, self.title)
  file = db_conn.host_computer.File(PRODUCTS_PATH + self.title)
  file.set_content(product_data)
end function

product_load = function (title)
  file = db_conn.host_computer.File(PRODUCTS_PATH + title)
  if not file then
    return 0
  end if

  product = new Product
  product.title = title
  product_data = file.get_content()
  product_data = product_data.split(char(10))

  for line in product_data
    line = line.split(":")
    line[1] = line[1].split(",")
    if line[1].len == 1 then
      line[1] = line[1][0]
    end if

    product[line[0]] = line[1]
  end for

  product.author = user_load(product.author)
  if not product.author then
    return 0
  end if

  return product
end function

product_create = function (title, description, author, files)
  author = user_load(author)
  if not author then
    return 0
  end if

  file = db_conn.host_computer.File(PRODUCTS_PATH + title)
  if file then
    return 0
  end if

  product = new Product
  product.title = title
  product.description = description
  product.author = author
  product.files = files
  product.save()

  return product
end function

product_find_all = function ()
  directory = db_conn.host_computer.File(PRODUCTS_PATH)
  products = directory.get_files()

  for i in range(0, products.len-1)
    products[i] = product_load(products[i].name)
  end for

  return products
end function
