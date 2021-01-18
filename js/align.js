/*
 * Uses dynamic programming to perform a pairwise alignment based on the needleman-wunsch global maxima scoring
 *
 * @param string1 {String} first string to align
 * @param string2 {String} second string to align
 * @param matchScore {int} score for matching
 * @param mismatchScore {int} score for mismatching without opening a gap
 * @param gapPenalty {int} Score for both opening and extending a gap
 * @returns {Array} two strings aligned with indels denoted by hyphens
 */
function needlemanWunsch(string1, string2, matchScore, mismatchScore, gapPenalty)
{
    //match string case
    string1 = string1.toUpperCase();
    string2 = string2.toUpperCase();
    
    var width = string1.length + 1;
    var height = string2.length + 1;
    
    var scoreMatrix = [];
    var directionMatrix = [];   //Track origin of scores
    
    //Fill in edges & init matrix
    for (var i = 0; i < width; i++)
    {
        scoreMatrix[i] = [];
        scoreMatrix[i][0] = i * gapPenalty;
        directionMatrix[i] = [];
        directionMatrix[i][0] = "t"; //top
    }
    for (var j = 0; j < height; j++)
    {
        scoreMatrix[0][j] = j * gapPenalty;
        directionMatrix[0][j] = "l"; //left
    }
        
   
    //Create score matrix
    for (var i = 1; i < width; i++)
    {
        for (var j = 1; j < height; j++)
        {
            //Calculate all scores and select max
            var diagPenalty = mismatchScore;
            if(string1[i-1] == string2[j-1])
                diagPenalty = matchScore;
            var diagScore = scoreMatrix[i-1][j-1] + diagPenalty;
            var insertScore = scoreMatrix[i-1][j] + gapPenalty;
            var deleteScore = scoreMatrix[i][j-1] + gapPenalty;
            
            //Set max value
            scoreMatrix[i][j] = Math.max(diagScore, insertScore, deleteScore);
            if(diagScore == scoreMatrix[i][j])
                directionMatrix[i][j] = "d";
            else if(insertScore == scoreMatrix[i][j])
                directionMatrix[i][j] = "t";
            if(deleteScore == scoreMatrix[i][j])
                directionMatrix[i][j] = "l";
            
        }
    }
    
    //Traceback to get alignment
    var i = width - 1;
    var j = height - 1;
    var alnString1 = "";
    var alnString2 = "";

    do { 
        //Get our three adjacent scores, and pick the lowest one, with preference in order of match, insert, delete
        var direction = directionMatrix[i][j];

        if(direction == "d")
        {
            alnString1 = string1[i - 1] + alnString1;
            alnString2 = string2[j - 1] + alnString2;
            i--;
            j--;
        }
        else if (direction == "l")
        {
            alnString1 = "-" + alnString1;
            alnString2 = string2[j - 1] + alnString2;
            j--;
        }
        else if (direction == "t")
        {
            alnString1 = string1[i - 1] + alnString1;
            alnString2 = "-" + alnString2;
            i--;
        }
    } while (i + j > 0);
    
    return [alnString1, alnString2];
}

/*
 * Return positions without indels. To be used in situations where hte indels are not beign used as informative sites.
 *
 * @param string1 {String} first aligned string
 * @param string2 {String} second aligned string
 * @returns {Array} The second string with indels removed, and the number of deletions
 */
function dropInsertions(alnBaseString, alnSubjugateString)
{
    var returnSubjugateString = "";
    var dels = 0;
    //Loop through string
    for (var i = 0; i < alnBaseString.length; i++)
    {
        if(alnBaseString[i] == "-")
        {
            dels++;
            continue;
        }
        returnSubjugateString += alnSubjugateString[i];
    }
    return [returnSubjugateString, dels];
}