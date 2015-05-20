I used some of the functionality of SlackChat as a jumping off place for my own chat app, SmackChat. I used Node.js and Socket.io with the noSQL database, Redis.

I store users as Redis Hashes.
  - This has the benefit of automatically verifying uniqueness
  - It means that I need to JSON.stringify all of the other information passed in.
    - To be parsed deeper in the app when needed.

For Login:
  - The input pass is checked agains the JSON.parse(d) user object.
    - If inputPass === userPass then redirect.
  - At this point, a second Hash is created for loggedin users.
    - I used a hash again because of its uniqueness property.
    - I had used a list, but it lead to issues for duplicate logging in.
  - Additionally, a cookie is created on login.
    - The cookie is used to keep track of loggedin status and userName

Inside of GlobalChat
  - on login (and logout), a message indicating as much is emitted to the entire room.
  - all loggedin users are displayed on the right hand side
    - these are updated with AJAX, displayed with jQuery.
    - On click of the users name, the users information will be displayed on the left hand side
    - A second click will hide it.
  - every message has the user's name appended to the beginning.
  - on logout, users name is removed.


Streatch goals are:
  - implement private chatrooms.
  - support profile pictures
  - save chat history (to a reasonable extent)