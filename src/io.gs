input_number = function (message, min=0, max=0)
  while 1
    input = user_input(message).to_int()
    if typeof(input) == "string" then
      print("[-] Input must be number")
      continue
    end if

    if min and max then
      if not (input >= min and input <= max) then
        print("[-] Input must be inside range " + min + "-" + max)
        continue
      end if
    else if min and not max then
      if not input >= min then
        print("[-] Input must be greater than or equal to " + min)
        continue
      end if
    else if not min and max then
      if not input <= max then
        print("[-] Input must be less than or equal to " + max)
        continue
      end if
    end if

    return input
  end while
end function
