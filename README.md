# Mark Walhimer — Studio Archive

Static site generated from a local SQLite database.

## Daily workflow
1. Work in p5.js or Three.js
2. Press S to archive to studio_vault.db
3. Run http://localhost:8888/build.php
4. cd dist && git add . && git commit -m "update" && git push

## File structure
- studio_vault.db — master database (BACK THIS UP)
- build.php — static site generator
- sketch-three.html — Three.js sketch template
- sketch-p5.html — p5.js sketch template
- dist/ — generated site pushed to GitHub Pages
- ~/Desktop/studio/art/ — source files organized by series
- ~/Desktop/studio/consulting/ — consulting work (private)

## Series numbering
- Legacy minted pieces keep their original numbers (738, 899 etc)
- New pieces use series-based numbering (bloom-001, technical-001)

## Adding a new piece
1. Open sketch in MAMP
2. Press S when you see something you love
3. Run build.php
4. git push
