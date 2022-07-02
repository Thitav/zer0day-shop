ALPHANUMERICS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

input_string = function (message, min=0, max=0, only_alpha=0, is_password=0, trim=1)
  while 1
    input = user_input("<color=#fff>" + message + "<color=#00bbff>> </color>", is_password)
    if trim and not is_password then
      input = input.trim
    end if

    if min and max then
      if not (input.len >= min and input.len <= max) then
        print_error("Input length must be inside range " + min + "-" + max)
        continue
      end if
    else if min and not max then
      if not input.len >= min then
        print_error("Input length must be greater than or equal to " + min)
        continue
      end if
    else if not min and max then
      if not input.len <= max then
        print_error("Input length must be less than or equal to " + max)
        continue
      end if
    end if

    if only_alpha then
      valid = 1

      for ch in input
        if ALPHANUMERICS.indexOf(ch) == null then
          valid = 0
          break
        end if
      end for

      if not valid then
        print_error("Only alphanumeric allowed as input")
        continue
      end if
    end if

    return input
  end while
end function

input_number = function (message, required=1, min=0, max=0, allow_float=0)
  while 1
    input = user_input("<color=#fff>" + message + "<color=#00bbff>> </color>")
    if not input.len and not required then
      return null
    end if

    if not allow_float and input.indexOf(".") then
      print_error("Input must be an integer")
      continue
    end if

    input = input.to_int()
    if typeof(input) == "string" then
      print_error("Input must be numeric")
      continue
    end if

    if min and max then
      if not (input >= min and input <= max) then
        print_error("Input must be inside range " + min + "-" + max)
        continue
      end if
    else if min and not max then
      if not input >= min then
        print_error("Input must be greater than or equal to " + min)
        continue
      end if
    else if not min and max then
      if not input <= max then
        print_error("Input must be less than or equal to " + max)
        continue
      end if
    end if

    return input
  end while
end function

input_bool = function (message, true_value, false_value, case_sensitive=0)
  while 1
    input = input_string(message)
    if not case_sensitive then
      input = input.lower
    end if

    if input != true_value and input != false_value then
      print_error("Input must be " + true_value + " or " + false_value)
      continue
    end if

    if input == true_value then
      return 1
    end if
    return 0
  end while
end function

print_string = function (message)
  print("<color=#00bbff>[+] <color=#fff>" + message)
end function

print_warning = function (message)
  print("<color=#ffbf00>[!] " + message)
end function

print_error = function (message, fatal=0)
  if fatal then
    exit("<color=#cc0000>[-] " + message)
  else
    print("<color=#cc0000>[-] " + message)
  end if
end function
