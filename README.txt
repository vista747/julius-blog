Minimal Monospace Blog
=======================

Files:
- index.html        -> homepage with a manual list of posts
- style.css         -> black text on white, monospaced
- posts/hello-world.html -> example post

How to make a new post:
1) Duplicate posts/hello-world.html and rename it to something like posts/2025-08-20-my-new-post.html
2) Open the new file and change:
   - <title>My New Post — My Blog</title>
   - <h1>My New Post</h1>
   - the date inside <small>...</small>
   - the body content
3) Open index.html and add a new list item under the <ul>, for example:
   <li><a href="posts/2025-08-20-my-new-post.html">My New Post</a> <small>— August 20, 2025</small></li>

That’s it. No JavaScript, no generators, just plain HTML and CSS.
Upload this folder to any static host (GitHub Pages, Netlify, or your web host via FTP).
