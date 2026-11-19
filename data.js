'use strict';
// K's Academy of Excellence: course content. Standards tags are LDOE-style references; verify against current LDOE documents before using on a transcript.
const PARENT='jeanne';
const PEOPLE=[
  {id:'jeanne',name:'Mrs. K',e:'👩‍🏫',parent:true},
  {id:'jackson',name:'Jaxson',e:'🔧',career:'welding'},
  {id:'ryley',name:'Ryley',e:'🩺',career:'ultrasound'}];
const STUDENTS=['jackson','ryley'];
const LINKS={study:'https://study.com/',actReg:'https://www.act.org/content/act/en/products-and-services/the-act/registration.html',actDates:'https://www.act.org/content/act/en/products-and-services/the-act/registration/test-dates.html',actPrep:'https://www.act.org/content/act/en/products-and-services/the-act/test-preparation.html',actAccom:'https://www.act.org/content/act/en/products-and-services/the-act/registration/accommodations.html'};
const ACT_DATES=[['Dec 12, 2026','Nov 9 (passed)','Nov 29 (late fee)'],['Feb 27, 2027','Jan 22','Feb 9'],['Apr 10, 2027','Mar 5','Mar 23'],['Jun 12, 2027','May 7','May 25']];

const COURSES={
  eng:{name:'English IV: Worlds of Anne Rice',e:'📖',std:'RL.11-12.1–10, W.11-12.1–9, L.11-12.1–6'},
  econ:{name:'Economics (applied: chicken micro-economy)',e:'🐔',std:'LA Social Studies: Economics 1–5'},
  sci:{name:'Science Literacy & GED Prep',e:'🔬',std:'HS-PS, HS-LS, HS-ESS; SEP data & evidence'},
  med:{name:'Medical Terminology Foundations',e:'🩺',std:'LA CTE Health Sciences; HS Anatomy & Physiology'},
  weld:{name:'Welding Technology I (senior CTE)',e:'🔥',std:'NCCER Core / AWS SENSE Level 1; LA CTE Manufacturing'},
  act:{name:'ACT Prep & Writing Skills',e:'🎯',std:'ACT College & Career Readiness Standards; W.11-12'}};

const COURSE_WHO={eng:['jackson','ryley'],econ:['jackson','ryley'],act:['jackson','ryley'],sci:['jackson'],weld:['jackson'],med:['ryley']};

const OUTLINES={
  weld:['Unit 1: Shop & fire safety, PPE, ventilation, OSHA 10 basics (Weeks 1–3)','Unit 2: Blueprint reading & weld symbols (Weeks 4–6)','Unit 3: Metallurgy & shop math: fractions, angles, conversions (Weeks 7–9)','Unit 4: SMAW (stick) fundamentals: joints, positions, bead control (Weeks 10–15)','Unit 5: GMAW/MIG & GTAW/TIG overview, inspection & defects (Weeks 16–22)','Unit 6: Careers: votech application, AWS certification path, commercial/underwater diving welder requirements (Weeks 23–26)','Capstone: written weld procedure + safety presentation'],
  ultra:['Unit 1: Medical terminology word parts (in progress)','Unit 2: Anatomy for sonography: abdomen, OB/GYN, vascular','Unit 3: Ultrasound physics basics: sound waves, frequency, echoes','Unit 4: Patient care, communication, ethics, HIPAA','Unit 5: Program application plan & prerequisites for your online institution'],
  eng:['Unit 2 (now): Interview with the Vampire, compressed to 3 weeks of reading + 1 week of writing (Nov 17–Dec 10)','Then: The Vampire Lestat → Queen of the Damned → Witching Hour → Feast of All Saints per your syllabus'],
  econ:['Scaled core: scarcity & opportunity cost → supply/demand → business & entrepreneurship → costs & decisions → markets → government → money & trade','Each unit: 1 quiz + 1 chicken-economy application (eggs, feed costs, pricing)'],
  med:['Word parts → body systems → pathology → diagnostics → abbreviations → clinical scenarios'],
  sci:['Data interpretation → scientific method & error → photosynthesis → ecosystems → evolution → nutrition → Earth spheres → Newton → matter → reactions']};

// rubric: [criterion, max points]
const RUB={
  journal:[['Comprehension of events',5],['Insight / connection to theme',5],['Textual evidence (quote or detail)',5],['Mechanics & clarity',5]],
  essay:[['Thesis & argument',25],['Textual evidence',25],['Analysis depth',25],['Organization & clarity',15],['Mechanics',10]],
  creative:[['Voice & character consistency',10],['Use of details from the novel',10],['Craft: imagery, pacing',10],['Mechanics',5],['Originality',5]],
  compare:[['Accuracy of comparison',10],['Specific scenes/quotes cited',10],['Insight on choices',10],['Organization & mechanics',10]],
  econ:[['Correct use of concept',10],['Calculations accurate',10],['Real-world (chicken) application',10],['Clear explanation',10]],
  gen:[['Completeness',10],['Accuracy',10],['Depth of thinking',10],['Clarity & mechanics',10]]};

const BANK={
  strong:['Strong, specific evidence. This is senior-level work.','Clear voice and confident argument.','Great insight that goes beyond the obvious.'],
  grow:['Add one more specific quote or detail to support your point.','Tighten your thesis: make it arguable, not just a statement of fact.','Explain WHY the evidence matters, not just what happened.','Proofread aloud: read each sentence out loud to catch errors.','Add transitions between paragraphs.','Break long sentences into two for clarity.']};

const ASG=[
 // Interview with the Vampire: compressed unit
 {id:'iv1',course:'eng',title:'Interview w/ the Vampire: Part 1 reading journal',due:'2026-11-19',who:['jackson','ryley'],rub:'journal',min:150,
  desc:'Read the first third of the novel. Write a journal entry on the frame narrative (the boy with the tape recorder), Louis\u2019s grief, and the first hint of moral conflict. Include 1 quote.',
  steps:['Read the first third of the novel (about 20 pages a day for 3 days)','Mark 3 passages about Louis\u2019s guilt','Draft journal entry (150+ words)','Add one quote and explain it','Proofread, then submit'],std:'RL.11-12.1, RL.11-12.5'},
 {id:'gothic',course:'eng',title:'Gothic literature check: what makes it Gothic?',due:'2026-11-19',who:['jackson','ryley'],rub:'gen',min:120,
  desc:'List 3 Gothic elements found in Part 1 (setting, atmosphere, doubles, the supernatural, forbidden desire) and explain each in 2\u20133 sentences.',
  steps:['Review the list of Gothic elements','Find an example from the book for each','Write 2\u20133 sentences per element'],std:'RL.11-12.9'},
 {id:'iv2',course:'eng',title:'Claudia\u2019s diary entry (creative writing)',due:'2026-11-25',who:['jackson','ryley'],rub:'creative',min:250,
  desc:'Read the middle third. Write a diary entry in Claudia\u2019s voice about the night she learns what she is. Use her anger and her trapped childhood.',
  steps:['Read the middle third of the novel','Note 5 details about Claudia\u2019s perspective','Plan: what she feels, what she wants, what she hates','Write 250+ words in first person','Read aloud and revise'],std:'W.11-12.3'},
 {id:'iv3',course:'eng',title:'Film comparison: 1994 adaptation vs. the novel',due:'2026-12-03',who:['jackson','ryley'],rub:'compare',min:250,
  desc:'Finish the novel. Watch the 1994 film (parent-approved viewing). Compare how Claudia and the ending are handled. Cite 2 scenes.',
  steps:['Finish the final third of the novel','Watch the film and take notes','Pick 2 scenes to compare','Write 250+ words comparing them','Add your opinion: which version is more powerful?'],std:'RL.11-12.7'},
 {id:'iv4',course:'eng',title:'Literary analysis essay: Louis, Lestat, or Claudia',due:'2026-12-10',who:['jackson','ryley'],rub:'essay',min:600,
  desc:'3\u20134 page essay analyzing ONE character through trauma, morality, or identity. Use at least 4 quotes. This is the unit final.',
  steps:['Choose your character and lens (trauma, morality, or identity)','Write a one-sentence thesis','Outline 3 body paragraphs with a quote each','Draft the essay (600+ words)','Revise using the rubric self-check','Proofread and submit'],std:'RL.11-12.1–3, W.11-12.1, W.11-12.9'},
 // ACT & writing
 {id:'actreg',course:'act',title:'Create your ACT account & choose a test date',due:'2026-11-19',who:['jackson','ryley'],rub:'gen',min:20,
  desc:'Register at act.org. In the box, tell me: which date you picked, which test center, and anything that worries you. (Ryley: see the ACT tab for a quieter-setting plan.)',
  steps:['Open the ACT tab and click the registration link','Create an ACT account','Pick a test date and center (Slidell area)','Tell Mrs. K what you chose'],std:'College readiness'},
 {id:'q-act-eng',course:'act',title:'ACT English mini-quiz #1',due:'2026-11-19',who:['jackson','ryley'],quiz:'actEng',desc:'Instant results with explanations.',std:'ACT English'},
 {id:'q-act-math',course:'act',title:'ACT Math mini-quiz #1',due:'2026-11-25',who:['jackson','ryley'],quiz:'actMath',desc:'Instant results with explanations.',std:'ACT Math'},
 {id:'wr1',course:'act',title:'Practical writing: a professional email',due:'2026-12-03',who:['jackson','ryley'],rub:'gen',min:100,
  desc:'Jaxson: email a votech welding program asking about the application deadline. Ryley: email your ultrasound program\u2019s admissions office asking about prerequisites. Use a subject line, greeting, clear question, closing.',
  steps:['Find the program\u2019s name and contact','Draft subject line','Write 3 short paragraphs','Proofread tone and spelling'],std:'W.11-12.4, L.11-12.1'},
 // Economics (scaled down)
 {id:'q-econ1',course:'econ',title:'Economics quiz: scarcity & opportunity cost',due:'2026-11-25',who:['jackson','ryley'],quiz:'econ1',desc:'Instant results.',std:'Economics 1'},
 {id:'econ2',course:'econ',title:'Chicken economy: egg supply & demand',due:'2026-12-10',who:['jackson','ryley'],rub:'econ',min:120,
  desc:'Track egg count for 5 days. If eggs sell at $4/dozen vs $6/dozen, what happens to demand? What shifts supply? Draw or describe your graph.',
  steps:['Log eggs for 5 days','Price table: $3, $4, $5, $6 and guessed customers','Describe the curve','Explain one shift'],std:'Economics 2'},
 // Course-specific
 {id:'q-sci1',course:'sci',title:'Science: reading graphs & data',due:'2026-11-19',who:['jackson'],quiz:'sci1',desc:'Instant results.',std:'SEP data & evidence'},
 {id:'q-weld1',course:'weld',title:'Welding Unit 1 safety quiz',due:'2026-11-25',who:['jackson'],quiz:'weld1',desc:'Instant results. You must pass (80%+) before any hands-on work.',std:'NCCER Core safety'},
 {id:'wweld',course:'weld',title:'Welding safety walk-through of the garage/shop',due:'2026-12-03',who:['jackson'],rub:'gen',min:100,
  desc:'List 5 hazards you would address in a home shop (fire, fumes, flash, grounding, flammables). For each, give the fix.',
  steps:['Walk the shop with a clipboard','List 5 hazards','Write the fix for each','Photo optional'],std:'OSHA / PPE'},
 {id:'q-med1',course:'med',title:'Medical terminology: word parts quiz',due:'2026-11-19',who:['ryley'],quiz:'med1',desc:'Instant results.',std:'Health Sciences'},
 {id:'wmed',course:'med',title:'Break down 10 terms (prefix · root · suffix)',due:'2026-12-03',who:['ryley'],rub:'gen',min:80,
  desc:'Choose 10 terms from your study.com unit. For each: break it into parts and give the meaning.',
  steps:['Choose 10 terms','Write parts for each','Write the meaning','Quiz yourself with flashcards'],std:'Health Sciences'}];

const QUIZ={
 actEng:{name:'ACT English #1',qs:[
  ['Choose the correct sentence.',['Their going to the game tonight.','They\u2019re going to the game tonight.','There going to the game tonight.','Theyre going to the game tonight.'],1,'They\u2019re = they are.'],
  ['Which uses a comma correctly?',['I went to the store, and bought milk.','I went to the store and bought milk.','I went, to the store and bought milk.','I went to the store and, bought milk.'],1,'No comma before "and" joining two verbs sharing one subject.'],
  ['Choose the best word: "The new policy will ____ everyone."',['affect','effect','affet','effects'],0,'Affect is the verb; effect is the noun.'],
  ['Which is a complete sentence?',['Running down the hill.','Because the storm was strong.','The storm knocked out power.','When the lights went out.'],2,'It has a subject and a verb and is a complete thought.'],
  ['Choose the correct pronoun: "Jaxson and ____ finished the project."',['me','I','myself','us'],1,'Remove "Jaxson and": "I finished" is correct.'],
  ['Which is most concise?',['In my opinion, I think that it is good.','I think it is good.','It is my thought that it is good.','Personally I do think it is good.'],1,'ACT rewards concision.'],
  ['Pick the correctly punctuated sentence.',['The dog, wagged its tail.','The dog wagged, its tail.','The dog wagged its tail.','The, dog wagged its tail.'],2,'No comma between subject and verb.'],
  ['Choose: "Each of the students ____ a book."',['have','has','are having','were'],1,'"Each" is singular.']]},
 actMath:{name:'ACT Math #1',qs:[
  ['Solve: 3x + 7 = 25',['4','5','6','7'],2,'3x = 18, x = 6.'],
  ['What is 15% of 80?',['10','12','15','18'],1,'0.15 × 80 = 12.'],
  ['A rectangle is 8 by 5. What is its perimeter?',['13','26','40','30'],1,'2(8+5) = 26.'],
  ['The slope between (0,2) and (4,10)?',['1','2','4','8'],1,'(10−2)/(4−0) = 2.'],
  ['Simplify: 2(x + 3) − x',['x + 6','x + 3','3x + 6','x − 6'],0,'2x + 6 − x = x + 6.'],
  ['Mean of 4, 8, 10, 6?',['6','7','8','9'],1,'28 ÷ 4 = 7.'],
  ['If 5 pencils cost $2, how many cost $10?',['20','25','30','50'],1,'$10 is 5×$2, so 5×5 = 25.'],
  ['Area of a circle with radius 3?',['6π','9π','3π','12π'],1,'πr² = 9π.']]},
 econ1:{name:'Scarcity & Opportunity Cost',qs:[
  ['Scarcity means…',['Unlimited wants vs limited resources','Prices are high','There are few stores','Goods are broken'],0,'Wants exceed resources.'],
  ['Opportunity cost is…',['What you pay','The next best alternative given up','Total savings','A tax'],1,'The next best thing you give up.'],
  ['You spend Saturday feeding chickens instead of working for $60. The opportunity cost is…',['$0','$60','The feed cost','The eggs'],1,'The $60 you gave up.'],
  ['Micro vs macro: the price of eggs at one farm is…',['Microeconomics','Macroeconomics','Neither','Both'],0,'Micro studies individual markets.'],
  ['"The minimum wage should be raised" is…',['Positive','Normative','Both','Neither'],1,'Value judgment = normative.'],
  ['Which is a factor of production?',['Land','Candy','Coupons','Receipts'],0,'Land, labor, capital, entrepreneurship.']]},
 sci1:{name:'Reading graphs & data',qs:[
  ['The variable you change in an experiment is the…',['Dependent variable','Independent variable','Control','Result'],1,'You change the independent variable.'],
  ['A line graph shows plant height rising each week. The trend is…',['Decreasing','Increasing','Constant','Random'],1,'Rising = increasing.'],
  ['The control group is used to…',['Be ignored','Provide a comparison','Confuse results','Add variables'],1,'It provides a baseline.'],
  ['Which is a source of unavoidable error?',['Instrument precision limits','Cheating','Wrong hypothesis','Lost data'],0,'Instruments have limits.'],
  ['The fundamental counting principle: 3 shirts × 4 pants =',['7','12','24','1'],1,'3 × 4 = 12 outfits.'],
  ['Photosynthesis takes in…',['O₂ and sugar','CO₂ and water','N₂ and salt','Only light'],1,'CO₂ + H₂O + light → sugar + O₂.']]},
 weld1:{name:'Welding Safety #1',qs:[
  ['Which shade of eye protection is the minimum for arc welding?',['Clear glasses','Proper welding helmet lens (shade 9–13)','Sunglasses','None for short welds'],1,'Arc light burns eyes; use the correct shade.'],
  ['Welding on a container that held flammables is…',['Fine if rinsed','Never, until it is certified clean','OK outdoors only','OK with fans'],1,'Residual vapors can explode.'],
  ['Best clothing for welding?',['Shorts and a tee','Synthetic fleece','Flame-resistant cotton/leather, long sleeves','Anything dark'],2,'Synthetics melt to skin.'],
  ['Why ventilation or fume extraction?',['Cool the metal','Avoid breathing metal fumes','Speed the weld','Save gas'],1,'Fumes harm lungs.'],
  ['Where should a fire extinguisher be?',['In the house','Within reach of the work area','In the car','Not needed'],1,'Close and accessible.'],
  ['Before welding, remove…',['Your gloves','Combustibles within ~35 ft','The ground clamp','Nothing'],1,'Sparks travel; clear the area.'],
  ['"Flash burn" is…',['A tan','Arc-eye: corneal damage from UV','Hot metal burn','Electric shock'],1,'Painful; wear a hood.'],
  ['Ground clamp should attach to…',['The torch','Clean bare metal on the workpiece','The helmet','A pipe'],1,'A clean ground makes a stable arc.']]},
 med1:{name:'Medical Terminology: word parts',qs:[
  ['"-itis" means…',['Pain','Inflammation','Removal','Study of'],1,'Appendicitis = inflammation of the appendix.'],
  ['"Cardio-" refers to…',['Brain','Heart','Lung','Kidney'],1,'Cardiology = study of the heart.'],
  ['"-ectomy" means…',['Surgical removal','Incision','Repair','Hardening'],0,'Appendectomy.'],
  ['"Hypo-" means…',['Over','Under/below','Within','Around'],1,'Hypothermia = low temperature.'],
  ['"Gastro-" refers to…',['Stomach','Skin','Bone','Blood'],0,'Gastritis = stomach inflammation.'],
  ['"Hepat/o" is the root for…',['Liver','Kidney','Spleen','Lung'],0,'Hepatitis = liver inflammation.'],
  ['"-ology" means…',['Disease','Study of','Pain','Cutting'],1,'Cardiology.'],
  ['"Sono-" relates to…',['Sound','Heat','Light','Salt'],0,'Sonography = recording with sound.']]}};

const SIM_TEASER={weld:'🔥 Welding simulator (travel speed, arc length, work angle): coming in Phase 2.',ultrasound:'🩺 Ultrasound probe simulator (scan-plane & image identification): coming in Phase 2.'};
const EXPLAIN={
iv1:{why:'The novel is a frame narrative: Louis tells his life to a skeptical interviewer. Anne Rice uses this to make us judge Louis the way the boy does. Notice WHO is speaking, WHY he tells it now, and what he leaves out. Louis\u2019s guilt about killing is the book\u2019s central moral problem: he hates what he is yet cannot stop.',how:'Read in short chunks. After each, write one sentence: "Louis feels ___ because ___." Pick the quote that proves it. A strong journal connects ONE event to ONE theme (grief, guilt, or identity) instead of retelling the plot.',tip:'Plot summary earns a 2/5. Explaining why the detail matters earns a 5/5.'},
gothic:{why:'Gothic literature uses dark settings, the supernatural, and psychological fear to explore what people try to hide: guilt, desire, mortality. New Orleans itself (heat, decay, old houses, cemeteries) works as a Gothic setting here.',how:'For each element: name it, quote or point to the scene, then explain the EFFECT on the reader ("this creates dread because\u2026").',tip:'Use the three-part pattern: element, evidence, effect.'},
iv2:{why:'Claudia is turned into a vampire as a child and never grows up. Her rage comes from being trapped in a child\u2019s body with an adult\u2019s mind. A good diary entry shows that conflict through voice, not summary.',how:'Plan first: what she knows, what she feels, who she blames (Lestat? Louis?). Write in first person using sensory details (smell, light, hunger, mirrors). Her vocabulary should sound old and sharp, her emotion raw.',tip:'Include at least two specific details from the book so your reader knows you read it.'},
iv3:{why:'Adaptations change stories because film shows rather than tells. The novel lets us inside Louis\u2019s mind; the film must show it with actors, music and camera. Comparing the choices reveals what each medium does best.',how:'Choose two scenes. For each, say what the novel does, what the film does, and why the change might have been made. Then decide which is more powerful and defend it.',tip:'Always cite the specific scene (what happens, who is present).'},
iv4:{why:'A literary analysis makes an ARGUMENT about meaning. It is not a book report. Your claim must be debatable: someone could disagree and you must convince them with evidence.',how:'Thesis formula: "Through [character], Rice argues that [idea] by showing [method]." Body paragraph: claim, quote, explain, link back to thesis. Conclusion: what it means beyond the book.',tip:'Weak: "Claudia is angry." Strong: "Claudia\u2019s rage shows that immortality without growth is a form of imprisonment."'},
actreg:{why:'ACT scores open scholarships and many programs, and test dates fill up. Registering turns worry into a plan.',how:'Create the account, pick a date at least 6 weeks away so you can prepare, and choose the quietest center near Slidell. Save your confirmation email.',tip:'Write down your date here so Mrs. K can add study milestones before it.'},
'q-act-eng':{why:'ACT English tests a small set of rules over and over: punctuation, subject-verb agreement, pronouns, and concise wording.',how:'Read the sentence aloud in your head. If you cannot decide, pick the shorter, simpler option; the ACT rewards clarity.',tip:'After you finish, redo only the ones you missed.'},
'q-act-math':{why:'ACT Math mixes algebra, geometry and number sense, mostly with straightforward steps.',how:'Show your work on paper. Estimate first so you can reject silly answers.',tip:'Missing a question? Rewrite the steps in your own words.'},
wr1:{why:'Practical writing is how you get taken seriously: a clear email to an admissions office shows you are professional and organized.',how:'Subject line: say the purpose. Greeting by name. Paragraph 1: who you are. Paragraph 2: your specific question. Paragraph 3: thank them and give your contact. Close with your full name.',tip:'Short and polite beats long. Reread for tone and spelling before sending.'},
'q-econ1':{why:'Everything in economics starts with scarcity: we cannot have everything, so every choice has an opportunity cost.',how:'For each question, ask "what is the next best thing given up?"',tip:'Cost isn\u2019t only money; time counts too.'},
econ2:{why:'Demand says people buy less as price rises; supply says producers offer more as price rises. Where they meet is the market price.',how:'Record eggs daily. Build a price table. Plot price vs. quantity wanted. Then name one thing that would shift supply (feed cost, fewer hens in winter).',tip:'Mention "shift of the curve" versus "movement along the curve".'},
'q-sci1':{why:'Scientists trust evidence. Reading graphs correctly is the most tested science skill on the GED.',how:'Always read the title, axes and units first, then describe the trend in one sentence.',tip:'Independent variable on the x-axis, dependent on the y-axis.'},
'q-weld1':{why:'Welding hazards (arc flash, fumes, fire, shock) can injure instantly. Safety knowledge is the first thing employers and votech instructors check.',how:'Read each option. Ask "what could go wrong?" and pick the safest choice.',tip:'You need 80%+ before any hands-on work.'},
wweld:{why:'Spotting hazards before they happen is the core professional skill. A shop inspection is exactly what a safety officer does.',how:'Walk the garage with a clipboard. For each hazard write what it is, why it is dangerous, and the fix. Check flammables near the work area, ventilation, extinguisher, and cord condition.',tip:'Photos make your report stronger.'},
'q-med1':{why:'Medical words are built like Lego: prefix + root + suffix. Learn the parts and you can decode thousands of terms.',how:'Say the term, then split it. "Gastr/itis" = stomach + inflammation.',tip:'Make flashcards of every part you miss.'},
wmed:{why:'Breaking words apart is the skill that lets sonographers read orders and charts quickly.',how:'For each term write prefix, root, suffix, and the meaning in plain English. Check a medical dictionary for pronunciation.',tip:'Teach three of them aloud to someone at home.'}};

