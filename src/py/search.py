from youtubesearchpython import VideosSearch

videosSearch = VideosSearch('NoCopyrightSounds', limit = 50)

for x in range(15):
    r = videosSearch.result()
    print(len(r['result']))
    videosSearch.next()