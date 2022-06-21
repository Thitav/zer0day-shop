menu_list = []

Menu = {}
Menu.header = ""
Menu.fields = []
Menu.options = []
Menu.commands = {}
Menu.paging = 0
Menu.can_back = 1
Menu.call = function ()
  fields = ""
  if self.fields then
    fields = "ID " + self.fields.join(" ") + "\n"
  end if

  menu_options = []
  for i in range(0, self.options.len-1)
    if typeof(self.options[i][0]) == "list" then
      for j in range(0, self.options[i][0].len-1)
        self.options[i][0][j] = str(self.options[i][0][j]).replace(" ", char(160))
      end for
      option_text = self.options[i][0].join(" ")
    else
      option_text = str(self.options[i][0]).replace(" ", char(160))
    end if

    menu_options.push("[" + (i+1) + "] " + option_text)
  end for

  menu_pages = []
  if self.paging then
    pages_number = ceil(menu_options.len/self.paging)
    for i in range(0, pages_number-1)
      page = slice(menu_options, i*self.paging, (i+1)*self.paging)
      page = format_columns(fields + page.join("\n"))
      menu_pages.push(page)
    end for
  else
    menu_pages.push(format_columns(fields + menu_options.join("\n")))
  end if

  for i in range(0, menu_pages.len-1)
    menu_pages[i] = menu_pages[i].split("\n")
    for j in range(0, menu_pages[i].len-1)
      if j == 0 and fields then
        menu_pages[i][j] = "<color=#00bbff>" + menu_pages[i][j]
        continue
      end if

      line = menu_pages[i][j].split("]")
      line = "<color=#00bbff>" + line[0] + "]</color><color=#fff>" + line[1]
      menu_pages[i][j] = line
    end for

    if self.paging then
      menu_pages[i].push("<color=#00bbff>[<color=#fff>" + (i+1) + "</color>/<color=#fff>" + pages_number + "</color>]")
    end if

    menu_pages[i] = menu_pages[i].join("\n")
  end for

  current_page = 0
  while 1
    clear_screen()
    print(self.header)
    print(menu_pages[current_page])

    final_option = 0
    while 1
      option = input_string("").to_int()

      if typeof(option) == "string" then
        option = option.split(" ")

        if self.commands.hasIndex(option[0]) then
          final_option = 1
          break
        end if

        if option[0] == "back" or option[0] == "b" then
          if menu_list.len then
            last_menu = menu_list.pop()
            last_menu.call()
            return
          else
            print_error("No menu in history")
            continue
          end if
        else if option[0] == "exit" then
          exit("<color=#00bbff>[+]</color> <color=#fff>Goodbye :)")
        else if option[0] == "help" then
          help_text =             "<color=#00bbff> help</color>                <color=#fff>Displays this text\n"
          help_text = help_text + "<color=#00bbff> back, b</color>             <color=#fff>Go back to the last accessed menu\n"
          help_text = help_text + "<color=#00bbff> nextpage, np</color>        <color=#fff>Go to the next menu page\n"
          help_text = help_text + "<color=#00bbff> backpage, bp</color>        <color=#fff>Go to the previous menu page\n"
          help_text = help_text + "<color=#00bbff> search <keyword></color>    <color=#fff>Search for products\n"
          help_text = help_text + "                     <color=#fff>only works while browsing the shop\n"
          help_text = help_text + "<color=#00bbff> sort <field></color>        <color=#fff>Sort products\n"
          help_text = help_text + "                     <color=#fff>only works while browsing the shop\n"
          help_text = help_text + "<color=#00bbff> exit</color>                <color=#fff>Closes this app"
          print(help_text)
          continue
        end if

        if self.paging then
          if (option[0] == "nextpage" or option[0] == "np") and (current_page+1) < pages_number then
            current_page = current_page + 1
            break
          end if

          if (option[0] == "backpage" or option[0] == "bp") and current_page > 0 then
            current_page = current_page - 1
            break
          end if
        end if
      end if

      if typeof(option) == "number" then
        if option > 0 and option <= self.options.len then
          final_option = 1
          break
        end if
      end if

      print_error("Invalid option/command")
    end while

    if final_option then
      break
    end if
  end while

  if typeof(option) == "list" then
    self.commands[option[0]](option)
  else
    if self.can_back then
      menu_list.push(self)
    end if

    if self.options[option-1].len > 2 then
      self.options[option-1][1](self.options[option-1][2])
    else
      self.options[option-1][1]()
    end if
  end if
end function
