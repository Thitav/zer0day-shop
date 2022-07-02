to_hex = function (n)
  h = []

  while floor(n) != 0
    m = n % 16

    if m < 10 then
      h.push(char(m+48))
    else
      h.push(char(m+55))
    end if

    n = n / 16
  end while

  h.reverse
  return h.join("")
end function
