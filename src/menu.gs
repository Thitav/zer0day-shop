menu_list = []

Menu = {}
Menu.header = ""
Menu.options = []
Menu.call = function ()
  menu_text = ""
  for i in range(0, self.options.len-1)
    if typeof(self.options[i][0]) == "list" then
      for j in range(0, self.options[i][0].len-1)
        self.options[i][0][j] = self.options[i][0][j].replace(" ", char(160))
      end for
      option_text = self.options[i][0].join(" ")
    else
      option_text = self.options[i][0].replace(" ", char(160))
    end if

    menu_text = menu_text + "[" + (i+1) + "] " + option_text + "\n"
  end for
  menu_text = format_columns(menu_text)

  clear_screen()
  print(self.header)
  print(menu_text)

  option = input_number("> ", 0, self.options.len)
  if option == 0 then
    last_menu = menu_list.pop()
    last_menu.call()
  else
    menu_list.push(self)
    if self.options[option-1].len > 2 then
      self.options[option-1][1](self.options[option-1][2])
    else
      self.options[option-1][1]()
    end if
  end if
end function
