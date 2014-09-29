## For contributors

To run the tests, `npm install`, start a local server at root directory, then do `npm run test`.

The tests in `replay/simulate/__tests__/` are kind of special. They compare the generated test screenshots to ones pre-recorded on a MacBook Air 13 inch, on the latest version of Selenium Firefox & Chrome drivers. They won't reliably look the same if you use another dev environment. You can ignore those when submitting a pull request.
