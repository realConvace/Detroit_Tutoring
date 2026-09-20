window.TUTORING_CONTENT = {
  fastStart: [
    "Pat-a-Cake",
    "Itsy Bitsy Spider",
    "Mary Had a Little Lamb",
    "Miss Mary Mack",
    "Hickory Dickory Dock",
    "Fingerplay",
    "Humpty Dumpty",
    "Little Bo Peep",
    "Little Miss Muffet",
    "I'm Me!",
    "What Do You Need?",
    "This Little Piggy",
    "The Lesson",
    "Apples Three",
    "Old Mother Hubbard",
    "The Old Woman Who Lived in a Shoe",
    "Hey Diddle Diddle",
    "1, 2, 3, 4, 5",
    "Flu",
    "Little Boy Blue",
    "Baa, Baa Black Sheep",
    "Old King Cole",
    "Hot Cross Buns",
    "Little Jack Horner",
    "Winter Snow",
    "Twinkle, Twinkle",
    "Bake a Cake",
    "Drip Drop",
    "The Crooked Man",
    "Traveling, Traveling",
    "Days of the Week",
    "Winter Night",
    "Sheep in a Jeep",
    "Bill and Jill",
    "First Book",
    "City Music",
    "My Nose",
    "A Song of Sixpence",
    "May on the Bay",
    "Rub-a-Dub Cubs",
    "Baby Chick",
    "Conversation",
    "Good-by and Hello",
    "I Talk",
    "Oh, What a Shame!",
    "That Marching Beat",
    "My New Red Bike",
    "The Shape of Things",
    "Away We Go",
    "Opposites",
    "Listen!",
    "My Dog",
    "Circle of We",
    "One Magical Midnight",
    "Watering a Rose",
    "Best Deal in Town",
    "Jump or Jiggle",
    "Maytime Magic",
    "My Neighborhood",
    "Wait for Me"
  ],

  fastStartSections: [
    "Read the Poem",
    "Looking at Words and Letters",
    "Playing With Sounds",
    "Beginning to Read"
  ],

  fastStartDetails: {
    "1": {
      displayTitle: "Pat-a-Cake",
      clipartPath: "assets/clipart/pat-a-cake-bread.svg",
      clipartAlt: "Child-friendly line drawing of a steaming baked bun.",
      poemHtml: `
        <div class="poem-lines" aria-label="Pat-a-Cake poem">
          <div>Pat-a-cake, pat-a-cake,</div>
          <div>Baker’s man,</div>
          <div>Bake me a cake</div>
          <div>As fast as you can.</div>
          <div>Pat it and prick it</div>
          <div>And mark it with a T.</div>
          <div>Put it in the oven</div>
          <div>For Tommy and me.</div>
        </div>
      `,
      sections: {
        "Looking at Words and Letters": `
          <ol class="instruction-list">
            <li>Ask your child how many lines are in the poem. Invite him or her to number the lines.</li>
            <li>Ask, <em>Which is the longest line? How many words does it have?</em></li>
            <li>Ask your child to find uppercase B. Say, <em>Which word is Baker? Circle it.<br>Which word is “Bake”? Underline it.</em></li>
            <li>Have your child point to the first and last word in the poem, and then count all the words.</li>
          </ol>
        `,
        "Playing With Sounds": `
          <ol class="instruction-list">
            <li>
              Say, <em>I’ll say two words. You tell me if they rhyme:</em>
              <div class="example-row three-up">
                <strong>man, can</strong>
                <strong>can, cake</strong>
                <strong>cake, bake</strong>
              </div>
            </li>
            <li>
              Say, <em>Listen while I stretch out the sounds in these words. You tell me the words:</em>
              <div class="sound-lines">
                <div>p . . . aaa . . . t (pat)</div>
                <div>m . . . aaa . . . nnn (man)</div>
                <div>b . . . aay . . . k (bake)</div>
              </div>
            </li>
            <li>
              Say, <em>I’ll say two words. You tell me if they start the same way:</em>
              <div class="example-row three-up">
                <strong>man, mark</strong>
                <strong>cake, bake</strong>
                <strong>pat, put</strong>
              </div>
            </li>
          </ol>
        `,
        "Beginning to Read": `
          <ol class="instruction-list">
            <li>
              Write the following words on index cards or small slips of paper. Ask your child to sort them into two groups: long “a” words and short “a” words.
              <div class="word-sort-grid">
                <div>pat, man, fast, and (short “a”)</div>
                <div>cake, bake, baker’s (long “a”)</div>
              </div>
            </li>
            <li>Ask your child to circle the words in the poem that start with the sound “b.” Repeat with “p.”</li>
            <li>Write the word <em>man</em> on a sheet of paper. Ask your child to name other words that rhyme with <em>man</em> (Ann, ban, can, Dan, fan, pan, ran, tan). Together, write these new words.</li>
            <li>Together, choose two or three words from the poem. Add them to your word wall and practice these words daily. Or, add them to your child’s word bank (a collection of words on cards, one word per card).</li>
          </ol>
        `
      }
    }
  },

  projectRead: [
    { id: "1", label: "Lesson 1" },
    { id: "2", label: "Lesson 2" },
    { id: "3", label: "Lesson 3" },
    { id: "4", label: "Lesson 4" },
    { id: "5", label: "Lesson 5" },
    { id: "6", label: "Lesson 6" },
    { id: "7", label: "Lesson 7" },
    { id: "8", label: "Lesson 8" },
    { id: "9", label: "Lesson 9" },
    { id: "10", label: "Lesson 10" },
    { id: "11", label: "Lesson 11" },
    { id: "12", label: "Lesson 12" },
    { id: "13A", label: "Lesson 13A" },
    { id: "13B", label: "Lesson 13B" },
    { id: "13C", label: "Lesson 13C" },
    { id: "14", label: "Lesson 14" }
  ],

  projectReadDetails: {
    "1": {
      unit: "UNIT 1",
      skill: "ă, t, s, m, b, c, f",
      bodyHtml: `
        <div class="project-read-sheet">
          <div class="project-read-intro">
            <p><strong>Introduce:</strong>&nbsp;&nbsp;/ă/</p>
            <p><strong>Introduce consonants:</strong>&nbsp;&nbsp;t. s. m. b. c. f</p>
          </div>

          <div class="consonant-list">
            <div><strong>t</strong> – tongue bounces</div>
            <div><strong>s</strong> – teeth together, snake</div>
            <div><strong>m</strong> – mouth closed</div>
            <div><strong>b</strong> – lips together, slight explosion</div>
            <div><strong>c</strong> – candy caught in throat</div>
            <div><strong>f</strong> – opening pop bottle, fizz</div>
          </div>

          <section class="project-read-block">
            <h3>WORD LIST</h3>
            <div class="word-list-grid" aria-label="Word list">
              <div><span>at</span><span>am</span><span>tab</span></div>
              <div><span>sat</span><span>tam</span><span>cab</span></div>
              <div><span>fat</span><span>Sam</span><span></span></div>
              <div><span>bat</span><span>bam</span><span></span></div>
              <div><span>cat</span><span></span><span></span></div>
              <div><span>mat</span><span></span><span></span></div>
            </div>
          </section>

          <section class="project-read-block">
            <h3>SENTENCES</h3>
            <div class="sentence-list">
              <div>Sam sat.</div>
              <div>Tam sat.</div>
              <div>Tab sat.</div>
              <div>A fat cat sat.</div>
            </div>
          </section>
        </div>
      `
    }
  }
};
