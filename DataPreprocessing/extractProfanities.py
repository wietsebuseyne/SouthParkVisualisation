# -*- coding: utf-8 -*-
import string, sys, os, operator

if len(sys.argv) == 1:
	inFile = 'All-seasons.tsv'
else:
	inFile = sys.argv[0]

f = open(inFile, 'r')

#TODO remove rape from general
#TODO itits profanity?
characters = {"Cartman": 1, "Kyle": 2, "Stan": 3, "Kenny": 4, "Butters": 5, "Chef": 6, "Randy": 7, "Wendy": 8,
 "Mr. Garrison": 9, "Clyde": 10, "Craig":11, "Mr. Mackey": 12, "Token": 13, "Ike": 14, "Bebe": 15, "Jesus": 16,
 "Towelie": 17, "Timmy": 18, "Jimmy": 19, "Sharon": 20, "Jimbo": 21, "Satan": 22, "Linda": 23, "Gerald": 24,
 "Sheila": 25, "Announcer": 26, "Narrator": 27, "Liane": 28, "Stephen": 29, "Principal Victoria": 30, 
 "Mayor": 31}
generalProfanities = ["fuck", "damn", "dammit", "cunt", "bitch", "vagina", "arse", "porn", "queer", "queef",
	"cripple", "ginger", "titties", "wiener",
	"aaass", "piiiss", "douche", "stinky",
	"dumbass", "asswipe", "punkass", "assmunch", "asscheek", "asspussy", "aass", "asshole",
	"smartass", "badass", "gassy", "asshoooles", "lazyass", "assburger", "aaasshole",
	"poserass", "bigass", "assmaster", "superfatass", "kickass", "fiveassed", "cheapass",
	"dombass", "freakass", "poorass", "hippoass", "assface", "sevenassed", "asssucker",
	"asslogger", "dopeyass", "jackass", "crackerass", "longass", "asssniffin", "fatasss",
	"looongass", "assfleck", "asspen", "asses", "greedyass", "lousyass", "lameass",
	"dick", "homo", "gay", "fart", "prick", "scum", "crotch", #"stupid", 
	"marijuwana", "marijawana",
	"drug", "marijuana", "cannabis", "hashish",
	"whore", "balls", "bastard", "pussy",  "slut",
	"penis", "boob", "sex", "dildo", "anal", "wank", "erection", "semen", 
	"shit", "crap", "jew", "retard", "deuce", 
	"beastial", "blowjob", "boner", "cock", "bollock", "bollok",
	"jackass", "balls", "sucker", "ejaculat", "fagg",
	"jiz", "sperm", "jackoff", "horny", "condom", "tampon",
	"masturbate", "nigger", "nigga", "tits", "vajayjay", "molest"]
profanities = ["ass", "assmmmuncher", "assed", "freak", "anus", 
"britch", "britches", 
"jackass", "fag", "fags", "ho", "hoe", "douche", "turd", "tit", "titty", "butt", 
"fat", "fatso", "fatty", "poo", "poop", "jerk", "dyke", "feck", "fellate", "fellatio", "felching",
"twat", "wtf", "molesteration", "mee krob", "cheesing", "jakovasaurs", "snuke", "mung",
"nuts", "cum", "scrotum", "smegma", "biatch", "bugger", "bum", "fudgepacker", "flange", "hell", "pube", "spunk",
"butt", "butts", "buttfucker", "buttfuckers", "buttfucking", "butthole", "buttcheecks" "buttholes", "buttcheeck", 
"buttmunch", "buttwipe", "buttcrack", "buttcheese", "buttlicker", "buttlickers", "scuzzlebutt", "scuzzlebutts",
"buttpipe", "buttpirate", "buttlord", "buttbaby", "buttforbrains", "buttload", "lardbutt", "buttock", "buttocks",
"penisbutt", "blubberbutt", "bbutthole", "gaybutts", "whatabutt", "hamburgers",
"rape", "raper", "raped", "rapes", "rapeist", "streisand", "rectal", "meecrob", "couric",
"hash", "weed", "crack", "heroin", "lsd", "cocaine", "opium",
"amphetamine", "methamphetamine", "mdma", "ketamine"]
noProfanities = [
"scrape", "banal",
"scrappy", "cockpit", "cocktail", "cocktails", "jewelry", "hapanuanalua", "rehearse", "rehearsed",
"suppornity", "peacock", "snowballs", "snowball", "assess", "molasses", "assessment", "passes", 
"harasses", "carcasses", "masses", "sunglasses", "glasses", "wasss", "analysis", "heartits", "bengay", 
"meatballs", "classes",  "scrap" , "gaybashing", "analyze", "ogaydmi", "ikimashita", "kimashita", 
"analogy", "condominium", "gafagga", "larsen", "prickly", "homogenized", "hancock" , "fagghecini", 
"cocka3", "jewels", "craponite", "poppycock"]
episodeStartCountPerSeason = [0, 1, 14, 32, 49, 66, 80, 97, 112, 126, 140, 154, 168, 182, 196, 210, 224, 238, 248, 258]
lastSeason = 18
lastEpisode = episodeStartCountPerSeason[lastSeason+1]

profanities_to_file = []
spoken = [[0]*(len(characters)+1) for _ in range(lastEpisode)]
spokenProfanities = [[0]*(len(characters)+1) for _ in range(lastEpisode)]
wordList = [{} for _ in range(lastEpisode)]
seasonWordList = [{} for _ in range(0, lastSeason+1)]
characterWordList = [{} for _ in range(len(characters)+1)]
profanitiesPerSeason = [[{} for _ in range(lastSeason+1)] for _ in range(len(characters)+1)]

for i, line in enumerate(f):
	split = line.split('\t')
	se = int(split[0])
	ep = int(split[1])+episodeStartCountPerSeason[se]-1
	character = split[2]
	#Save total in place 0
	lines = split[3].strip().lower().replace("_", " ")
	translator = lines.maketrans({key: None for key in string.punctuation})
	words = lines.translate(translator).split(" ")
	for word in words:
		if len(word) > 0:
			spoken[ep][0] = spoken[ep][0] + 1
			profanity = False
			if word in profanities:
				profanity = True
			if not word in noProfanities and not profanity:
				for p in generalProfanities:
					if p in word:
						profanity = True
			if profanity:
				spokenProfanities[ep][0] = spokenProfanities[ep][0]+1
				profanitiesPerSeason[0][se][word] = profanitiesPerSeason[0][se].get(word, 0) + 1
				wordList[ep][word] = wordList[ep].get(word, 0) + 1
				seasonWordList[se][word] = seasonWordList[se].get(word, 0) + 1
				characterWordList[0][word] = characterWordList[0].get(word, 0) + 1
				if word not in profanities_to_file:
					profanities_to_file.append(word)
                    
			if character in characters:
				characterNb = characters[character]
				spoken[ep][characterNb] = spoken[ep][characterNb] + 1
				if profanity:
					profanitiesPerSeason[characterNb][se][word] = profanitiesPerSeason[characterNb][se].get(word, 0) + 1
					spokenProfanities[ep][characterNb] = spokenProfanities[ep][characterNb]+1
					characterWordList[characterNb][word] = characterWordList[characterNb].get(word, 0) + 1

#Write to different output files

outputProfanities = "character	episode	value"
outputWords = outputProfanities
outputCombination = "character	episode	words	profanities"

for i in range(1,lastEpisode):
	outputProfanities += "\n" + str(len(characters)+1) + "\t" + str(i) + "\t" + str(round(spokenProfanities[i][0] * 1000 / spoken[i][0], 2))
	outputCombination += "\n" + str(len(characters)+1) + "\t" + str(i) + "\t30\t" + str(round(spokenProfanities[i][0] * 1000 / spoken[i][0], 2))
	for c in range(1,len(characters)+1):
		percentageProfanities = spokenProfanities[i][c]*1000
		if not percentageProfanities == 0:
			percentageProfanities = round(percentageProfanities / spoken[i][c], 2)
		wordsAppend = "\n" + str(c) + "\t" + str(i) + "\t" + str(round(spoken[i][c] *100 / spoken[i][0], 2))
		outputProfanities += "\n" + str(c) + "\t" + str(i) + "\t" + str(percentageProfanities)
		outputWords += wordsAppend
		outputCombination += wordsAppend + "\t" + str(percentageProfanities)
fout = open("profanities.txt", 'w')
fout.write("\n".join(profanities_to_file))
fout = open("profanities.tsv", 'w')
fout.write(outputProfanities)
fout = open("all_words.tsv", 'w')
fout.write(outputWords)
fout = open("combination.tsv", 'w')
fout.write(outputCombination)

if not os.path.exists(os.path.join("character")):
    os.makedirs(os.path.join("character"))
if not os.path.exists(os.path.join("episode")):
    os.makedirs(os.path.join("episode"))
if not os.path.exists(os.path.join("word")):
    os.makedirs(os.path.join("word"))
if not os.path.exists(os.path.join("season")):
    os.makedirs(os.path.join("season"))

characters['All'] = 0
spokenInSeason = [{} for _ in range(1, lastSeason+2)]

totalWordsInSP = 0
for ep in range(1, lastEpisode):
	totalWordsInSP += spoken[ep][0]

outputAvg = "character\twords\tprofanities\tprofanities2"
for character in characters:
	c = characters[character]
	outputPAbs = "season	words"
	outputP = "season	profanities"
	outputW = "season	words"
	outputW2 = "word\tcount"
	outputC = "season	words	profanities"
	totalProf = 0
	totalWords = 0
	for start in range(1, len(episodeStartCountPerSeason)-1):
		profanities = 0
		spokenWords = 0
		denom = 0
		for ep in range(episodeStartCountPerSeason[start], episodeStartCountPerSeason[start+1]):
			profanities += spokenProfanities[ep][c]
			spokenWords += spoken[ep][c]
			denom += spoken[ep][0]
		spokenInSeason[start][character] = spokenWords
		outputW += "\n" + str(start) + "\t" + str(round(spokenWords*100/denom, 2))
		outputP += "\n" + str(start) + "\t"
		outputC += "\n" + str(start) + "\t" + str(round(spokenWords*100/denom, 2)) + "\t"
		outputPAbs += "\n" + str(start) + "\t" + str(profanities)
		if spokenWords == 0:
			outputP += "0"
			outputC += "0"
			outputPAbs += "0"
		else:
			totalWords += spokenWords
			totalProf += profanities
			outputP += str(round(profanities*1000/spokenWords, 2))
			outputC += str(round(profanities*100/spokenWords, 2))
	p = 0
	if totalWords > 0:
		p = round(totalProf/totalWords*1000, 2)
	outputAvg += "\n" + character + "\t" + str(round(totalWords/totalWordsInSP*100, 2)) + "\t" + str(p) + "\t" + str(totalProf)
	fout = open(os.path.join("character/" + character + "_prof.tsv"), 'w')
	fout.write(outputP)
	fout = open(os.path.join("character/" + character + "_words.tsv"), 'w')
	fout.write(outputW)
	fout = open(os.path.join("character/" + character + "_linechart.tsv"), 'w')
	fout.write(outputC)
	fout = open(os.path.join("word/" + character + "_all.tsv"), 'w')
	fout.write(outputP.replace("season\tprofanities", "season\twords"))

	#print(spokenInSeason)
	words = sorted(characterWordList[c].items(), key=operator.itemgetter(1), reverse=True)
	for word in words:
		outputIndW = "season\twords"
		for season in range(1, len(episodeStartCountPerSeason)-1):
			total = spokenInSeason[season].get(character, 0)
			if total == 0:
				if profanitiesPerSeason[c][season].get(word[0], 0) != 0:
					print("Error in processing: total number of words 0 but non-zero total number of profanities")
				total = 1
			outputIndW += "\n" + str(season) + "\t" + str(round(1000 * profanitiesPerSeason[c][season].get(word[0], 0) / total, 2))
		fout = open(os.path.join("word/" + character + "_" + word[0] + ".tsv"), 'w')
		fout.write(outputIndW)

	words = sorted(characterWordList[c].items(), key=operator.itemgetter(1), reverse=True)
	for word in words:
		outputW2 += "\n" + word[0] + "\t" + str(word[1])
	fout = open(os.path.join("character/" + character + "_wordcloud.tsv"), 'w')
	fout.write(outputW2)


fout = open(os.path.join("profanities_average.tsv"), 'w')
fout.write(outputAvg)

for i in range(1,lastEpisode):
	words = sorted(wordList[i].items(), key=operator.itemgetter(1), reverse=True)
	outputE = "word\tcount"
	for word in words:
		outputE += "\n" + word[0] + "\t" + str(word[1])
	fout = open(os.path.join("episode/" + str(i) + "_profanities.tsv"), 'w')
	fout.write(outputE)

for season in range(1, lastSeason+1):
	words = sorted(seasonWordList[season].items(), key=operator.itemgetter(1), reverse=True)
	outputE = "word\tcount"
	for word in words:
		outputE += "\n" + word[0] + "\t" + str(word[1])
	fout = open(os.path.join("season/" + str(season) + "_wordcloud.tsv"), 'w')
	fout.write(outputE)

	totalProfanities = [0 for _ in range(episodeStartCountPerSeason[season], episodeStartCountPerSeason[season+1])]
	#totalWords = [0 for _ in range(episodeStartCountPerSeason[season], episodeStartCountPerSeason[season+1])]

	for word in words:
		outputIndW = "episode\twords"
		for ep in range(episodeStartCountPerSeason[season], episodeStartCountPerSeason[season+1]):
			outputIndW += "\n" + str(ep) + "\t" + str(round(1000 * wordList[ep].get(word[0], 0) / spoken[ep][0], 2))
			totalProfanities[ep-episodeStartCountPerSeason[season]] += wordList[ep].get(word[0], 0)
			#totalWords[ep-episodeStartCountPerSeason[season]] += spoken[ep][0]
		fout = open(os.path.join("season/" + str(season) + "_" + word[0] + ".tsv"), 'w')
		fout.write(outputIndW)

	outputSeasonAll = "episode\twords"
	for i in range(0,len(totalProfanities)):
		outputSeasonAll += "\n" + str(i+1) + "\t" + str(round(1000 * totalProfanities[i] / spoken[episodeStartCountPerSeason[season] + i][0], 2))
	fout = open(os.path.join("season/" + str(season) + "_all.tsv"), 'w')
	fout.write(outputSeasonAll)
