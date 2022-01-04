Menu = {}
Menu.options = []
Menu.call = function ()
  menu_text = ""
  for i in range(1, self.options.len)
    option_text = self.options[i-1][0]
    if typeof(self.options[i-1][0]) == "list" then
      for j in range(0, self.options[i-1][0].len-1)
        self.options[i-1][0][j] = self.options[i-1][0][j].replace(" ", char(160))
      end for
      option_text = self.options[i-1][0].join(" ")
    end if

    menu_text = menu_text + "[" + i + "] " + option_text + char(10)
  end for
  menu_text = format_columns(menu_text)

  while 1
    print(menu_text)

    option = user_input("> ").to_int()
    if typeof(option) != "string" and (option > 0 and option <= self.options.len) then
      self.options[option-1][1]()
      break
    end if

    print("[-] Invalid option")
  end while
end function
