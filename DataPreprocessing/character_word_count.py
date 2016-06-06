import sys
import re

def main(argv):
    if len(sys.argv) == 2:
        f_subtitles = 'All-seasons.tsv'
        f_profanities = 'profanities.txt'
        f_characters = 'characters.txt'
        season = int(sys.argv[1])
    elif len(sys.argv) == 4:
        season = int(sys.argv[1])
        f_subtitles = sys.argv[2]
        f_profanities = sys.argv[3]
        f_characters = sys.argv[4]
    else:
        print 'usage: character_word_count.py <season> (<subtitles> <profanities> <characters>)'
        sys.exit(0)
        
    subtitles = open(f_subtitles, 'r')
    profanities = open(f_profanities, 'r')
    #characters = {"Cartman": 1, "Kyle": 2, "Stan": 3, "Kenny": 4, "Butters": 5, "Chef": 6, "Randy": 7, "Wendy": 8, "Mr. Garrison": 9, "Clyde": 10, "Craig":11}
    characters = open(f_characters, 'r')
    
    profanities = createList(profanities)
    characters = createHashTable(characters)
    
    output = []
    
    for line in subtitles:
        #print 'JA'
        parts = line.split('\t')
        if parts[0] == str(season):
            episode = parts[1]
            episode = seasonEpisodeToAbsoluteEpisode(int(season), int(episode))
            
            character = parts[2]
            if character not in characters:
                character = 'Other'
            
            sentence = parts[3]
            words = re.sub("[^\w]", " ",  sentence).split()
 
            amount_of_words = 0
            amount_of_profanities = 0
            
            for word in words:
                if word.lower() in profanities:
                    amount_of_profanities += 1
                else:
                    amount_of_words += 1
            # end-for

            if amount_of_words > 0 or amount_of_profanities > 0:
                output.append(episode + '\t' + character + '\t' + str(amount_of_words) + '\t' + str(amount_of_profanities) + '\t' + sentence.strip())
    # end-for
    
    fout = open('season-' + str(season) + '.tsv', 'w')
    for item in output:
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