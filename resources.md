# Resources

## Regular Expressions

Regular Expression to extract parameters with converters:

 - `/((:(\w+))|(\{((\w+)(\((.*?)\))?:)?(\w+)\}))(/)?`

regex utilities:

 - http://gskinner.com/RegExr/
 - http://regexvisualizer.apphb.com/
 - http://www.regexper.com/

examples:

```
/home/:param/here/:another
/home/:param/here
/home/:param

/Book/:book/Chapter/:chapter
/Book/Chess/Chapter/10

/home/{param}/here/{another}
/home/{param}/here
/home/{param}

/home/{regex:param}/here/{another}
/home/{regex():param}/here
/home/{regex(aregularexpresion):param}/next/{regex(aregularexpresion):param}
/home/{regex('\w):p\}','g'):param}/next/{regex(aregularexpresion):param}

/home/{regex({ pattern: '\w):p\}', flags: 'g' }):param}/next/{regex(aregularexpresion):param}

$&
^\\/Book/([^\\/]*)/Chapter/([^\\/]*)/?$
/((:(\w+))|(\{((\w+)(\((.*?)\))?:)?(\w+)\}))(/)?
```

- http://gskinner.com/RegExr/?3427i

## Testing Resources

- http://net.tutsplus.com/tutorials/javascript-ajax/testing-your-javascript-with-jasmine/

## Promises

- https://gist.github.com/domenic/3889970

## Fiddles

- http://jsfiddle.net/sY9RB/3/

## Other stuff

- http://michaux.ca/articles/lazy-function-definition-pattern