from __future__ import unicode_literals
import sys
import youtube_dl

url = sys.argv[1]
outFile = sys.argv[2]

ydl_opts = {}
with youtube_dl.YoutubeDL(ydl_opts) as ydl:
    ydl.download(['https://www.youtube.com/watch?v=BaW_jenozKc'])