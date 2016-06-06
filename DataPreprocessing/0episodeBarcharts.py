
import sys
import re

def main(argv):
    if len(sys.argv) == 1:
        f_subtitles = 'All-seasons.tsv'
        f_profanities = 'profanities.txt'
        f_characters = 'characters.txt'
    elif len(sys.argv) == 3:
        f_subtitles = sys.argv[1]
        f_profanities = sys.argv[2]
        f_characters = sys.argv[3]
    else:
        print 'usage: episodeBarcharts.py (<subtitles> <profanities> <characters>)'
        sys.exit(0)

    subtitles = open(f_subtitles, 'r')
    profanities = open(f_profanities, 'r')
    #characters = {"Cartman": 1, "Kyle": 2, "Stan": 3, "Kenny": 4, "Butters": 5, "Chef": 6, "Randy": 7, "Wendy": 8, "Mr. Garrison": 9, "Clyde": 10, "Craig":11}
    characters = open(f_characters, 'r')

    profanities = createList(profanities)
    characters = createHashTable(characters)

    output = [["character\tvalue"] for _ in range(0,257)]

    for line in subtitles:
        #print 'JA'
        parts = line.split('\t')
        season = int(parts[0])
        episode = int(seasonEpisodeToAbsoluteEpisode(season, int(parts[1])))-1
        character = parts[2]
        if character not in characters:
            character = 'Other'

        sentence = parts[3]
        words = re.sub("[^\w]", " ",  sentence).split()

        amount_of_words = 0
        amount_of_profanities = 0

        for word in words:
            if word.lower() in profanities:
                amount_of_profanities -= 1
                if amount_of_words > 0:
                    output[episode].append(character + '\t' + str(amount_of_words))
                    amount_of_words = 0
            else:
                amount_of_words += 1
                if amount_of_profanities < 0:
                    output[episode].append(character + '\t' + str(amount_of_profanities))
                    amount_of_profanities = 0
        # end-for

        if amount_of_words > 0:
            output[episode].append(character + '\t' + str(amount_of_words))
        elif amount_of_profanities < 0:
            output[episode].append(character + '\t' + str(amount_of_profanities))

    # end-for
    for i, episode in enumerate(output):
        fout = open('episode/' + str(i+1) + '_barcode.tsv', 'w')
        for item in episode:
            fout.write("%s\n" % item)

def createList(profanities):
    output = []
    for line in profanities:
        output.append(line.split( )[0].lower())
    return output

def createHashTable(characters):
    output = {}
    i = 1
    for i, line in enumerate(characters):
        output[line.strip()] = i
        i += 1
    return output

def seasonEpisodeToAbsoluteEpisode(season, episode):
    seasons = {1:13, 2:18, 3:17, 4:17, 5:14, 6:17, 7:15, 8:14, 9:14, 10:14, 11:14, 12:14, 13:14, 14:14, 15:14, 16:14, 17:10, 18:10}
    output = 0

    for x in range(1, season):
        output += seasons[x]

    output += episode

    return str(output)

if __name__ == "__main__":
   main(sys.argv[1:])
