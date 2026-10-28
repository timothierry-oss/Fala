import type { Level } from './types'

export type Block =
  | { t: 'p'; text: string }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'ex'; pt: string; fr: string }
  | { t: 'tip'; text: string }

export interface Exercise {
  id: string
  notion: string
  /** Phrase avec « ___ » à compléter. */
  q: string
  /** Réponse attendue ; alternatives acceptées séparées par « / ». */
  answer: string
  distractors: string[]
  fr: string
}

export interface Notion {
  id: string
  cat: 'conjugaison' | 'grammaire'
  level: Level
  title: string
  ptTitle: string
  summary: string
  lesson: Block[]
  exercises: Exercise[]
}

const p = (text: string): Block => ({ t: 'p', text })
const tip = (text: string): Block => ({ t: 'tip', text })
const ex = (pt: string, fr: string): Block => ({ t: 'ex', pt, fr })
const table = (head: string[], ...rows: string[][]): Block => ({ t: 'table', head, rows })

function exercises(notion: string, raw: string): Exercise[] {
  return raw
    .trim()
    .split('\n')
    .map((l, i) => {
      const [q, answer, d, fr] = l.trim().split('|')
      return { id: `${notion}-${i}`, notion, q, answer, distractors: d.split(','), fr }
    })
}

type Src = Omit<Notion, 'exercises'> & { raw: string }
const n = (s: Src): Notion => {
  const { raw, ...rest } = s
  return { ...rest, exercises: exercises(s.id, raw) }
}

export const notions: Notion[] = [
  // ---------------- Conjugaison ----------------
  n({
    id: 'presente-regulares',
    cat: 'conjugaison',
    level: 'A1',
    title: 'Présent des verbes réguliers',
    ptTitle: 'Presente: -ar, -er, -ir',
    summary: 'Conjuguer falar, comer, partir et tous les verbes réguliers.',
    lesson: [
      p('Les verbes se classent en **3 groupes** selon leur terminaison : **-ar**, **-er**, **-ir**. On retire la terminaison et on ajoute celle de la personne.'),
      table(['', 'falar (parler)', 'comer (manger)', 'partir (partir)'], ['eu', 'fal**o**', 'com**o**', 'part**o**'], ['você / ele / ela / a gente', 'fal**a**', 'com**e**', 'part**e**'], ['nós', 'fal**amos**', 'com**emos**', 'part**imos**'], ['vocês / eles / elas', 'fal**am**', 'com**em**', 'part**em**']),
      tip('Au Brésil, on dit **você** (et non « tu ») dans la plupart des régions : il se conjugue comme **ele**. De même, **a gente** (= on / nous) se conjugue à la 3ᵉ personne du singulier.'),
      ex('Eu falo português e ela fala inglês.', 'Je parle portugais et elle parle anglais.'),
      ex('A gente come arroz todo dia.', 'On mange du riz tous les jours.'),
      ex('Vocês partem amanhã?', 'Vous partez demain ?'),
    ],
    raw: `
Eu ___ português todos os dias. (falar)|falo|fala,falamos,falam|Je parle portugais tous les jours.
Ela ___ no centro da cidade. (morar)|mora|moro,moram,moramos|Elle habite dans le centre-ville.
Nós ___ arroz e feijão no almoço. (comer)|comemos|comem,come,como|Nous mangeons du riz et des haricots au déjeuner.
Vocês ___ muito rápido! (falar)|falam|fala,falamos,falo|Vous parlez très vite !
A gente ___ a loja às oito. (abrir)|abre|abrimos,abrem,abro|On ouvre le magasin à huit heures.
Eles ___ em São Paulo. (trabalhar)|trabalham|trabalha,trabalhamos,trabalho|Ils travaillent à São Paulo.
Você ___ café ou chá? (beber)|bebe|bebo,bebem,bebemos|Tu bois du café ou du thé ?
Eu ___ a janela. (abrir)|abro|abre,abrimos,abrem|J'ouvre la fenêtre.
Meu irmão ___ e-mails o dia todo. (escrever)|escreve|escrevo,escrevem,escrevemos|Mon frère écrit des e-mails toute la journée.
Nós ___ para o Rio amanhã. (partir)|partimos|partem,parte,parto|Nous partons pour Rio demain.
Eu ___ de música brasileira. (gostar)|gosto|gosta,gostamos,gostam|J'aime la musique brésilienne.
Ele ___ cedo todos os dias. (acordar)|acorda|acordo,acordamos,acordam|Il se réveille tôt tous les jours.
Você ___ muito bem português! (falar)|fala|falo,falamos,falam|Tu parles très bien portugais !
Nós ___ pizza no sábado. (comer)|comemos|come,comem,como|Nous mangeons de la pizza le samedi.
Eu ___ perto da praia. (morar)|moro|mora,moramos,moram|J'habite près de la plage.
Elas ___ no mesmo apartamento. (morar)|moram|mora,moro,moramos|Elles habitent dans le même appartement.
A gente ___ cedo no verão. (acordar)|acorda|acordamos,acordam,acordo|On se réveille tôt en été.
Vocês ___ a porta quando saem? (fechar)|fecham|fecha,fechamos,fecho|Vous fermez la porte quand vous partez ?
Ele ___ café todas as manhãs. (tomar)|toma|tomo,tomamos,tomam|Il boit du café tous les matins.`,
  }),
  n({
    id: 'ser-estar',
    cat: 'conjugaison',
    level: 'A1',
    title: 'Ser ou estar ?',
    ptTitle: 'Ser x Estar',
    summary: 'Les deux verbes « être » : nature permanente ou état temporaire.',
    lesson: [
      p('Le portugais a **deux verbes « être »**.'),
      p('**SER** : ce qui définit, ce qui est durable → identité, origine, profession, caractère, matière, heure, date, lieu d’un événement.'),
      p('**ESTAR** : ce qui est passager → état, humeur, santé, situation temporaire, localisation d’une personne ou d’un objet, météo.'),
      table(['', 'ser', 'estar'], ['eu', 'sou', 'estou'], ['você / ele / ela / a gente', 'é', 'está'], ['nós', 'somos', 'estamos'], ['vocês / eles / elas', 'são', 'estão']),
      ex('Eu sou francês, mas estou no Brasil.', 'Je suis français, mais je suis au Brésil.'),
      ex('Ela é simpática, mas hoje está de mau humor.', 'Elle est sympathique, mais aujourd’hui elle est de mauvaise humeur.'),
      ex('São três horas.', 'Il est trois heures.'),
      tip('À l’oral, **estou → tô**, **está → tá**, **estamos → tamo**. Pour situer un lieu fixe (une ville, un bâtiment), on utilise souvent **ficar** : « Onde fica o museu? ».'),
    ],
    raw: `
Eu ___ francês.|sou|estou,é,está|Je suis français.
Hoje eu ___ cansado.|estou|sou,é,está|Aujourd'hui je suis fatigué.
Ela ___ médica.|é|está,são,estão|Elle est médecin.
Nós ___ em casa agora.|estamos|somos,são,estão|Nous sommes à la maison maintenant.
O café ___ frio!|está|é,são,estou|Le café est froid !
Eles ___ do Brasil.|são|estão,é,está|Ils sont du Brésil.
___ três horas da tarde.|São|Estão,É,Está|Il est trois heures de l'après-midi.
Minha mãe ___ muito simpática.|é|está,são,sou|Ma mère est très sympathique.
Você ___ bem? Parece triste.|está|é,estão,são|Tu vas bien ? Tu as l'air triste.
A festa ___ no sábado.|é|está,são,estão|La fête est samedi.
As crianças ___ na escola.|estão|são,está,é|Les enfants sont à l'école.
Nós ___ muito cansados hoje. (estar)|estamos|somos,são,estão|Nous sommes très fatigués aujourd'hui.
Eles ___ sempre muito gentis. (ser)|são|estão,é,está|Ils sont toujours très gentils.
Vocês ___ prontos para sair? (estar)|estão|são,é,está|Vous êtes prêts à sortir ?
Eu ___ estudante de português. (ser)|sou|estou,é,está|Je suis étudiant de portugais.
A sopa ___ quente ainda. (estar)|está|é,são,estão|La soupe est encore chaude.
Nós ___ brasileiros. (ser)|somos|somo,são,estamos|Nous sommes brésiliens.`,
  }),
  n({
    id: 'presente-irregulares',
    cat: 'conjugaison',
    level: 'A1',
    title: 'Présent des verbes irréguliers',
    ptTitle: 'Presente: verbos irregulares',
    summary: 'Ter, ir, fazer, poder, querer, saber… les verbes indispensables.',
    lesson: [
      p('Les verbes les plus fréquents sont **irréguliers**, surtout à la 1ʳᵉ personne (**eu**). À apprendre par cœur !'),
      table(['', 'eu', 'você / ele', 'nós', 'vocês / eles'], ['ter (avoir)', 'tenho', 'tem', 'temos', 'têm'], ['ir (aller)', 'vou', 'vai', 'vamos', 'vão'], ['fazer (faire)', 'faço', 'faz', 'fazemos', 'fazem'], ['poder (pouvoir)', 'posso', 'pode', 'podemos', 'podem'], ['querer (vouloir)', 'quero', 'quer', 'queremos', 'querem'], ['saber (savoir)', 'sei', 'sabe', 'sabemos', 'sabem'], ['dizer (dire)', 'digo', 'diz', 'dizemos', 'dizem'], ['ver (voir)', 'vejo', 'vê', 'vemos', 'veem'], ['vir (venir)', 'venho', 'vem', 'vimos', 'vêm']),
      p('**Autres irréguliers fréquents** : la 1ʳᵉ personne (« eu ») change, le reste est souvent régulier.'),
      table(['', 'eu', 'você / ele', 'nós', 'vocês / eles'], ['pôr (mettre)', 'ponho', 'põe', 'pomos', 'põem'], ['trazer (apporter)', 'trago', 'traz', 'trazemos', 'trazem'], ['dar (donner)', 'dou', 'dá', 'damos', 'dão'], ['ouvir (entendre)', 'ouço', 'ouve', 'ouvimos', 'ouvem'], ['pedir (demander)', 'peço', 'pede', 'pedimos', 'pedem'], ['perder (perdre)', 'perco', 'perde', 'perdemos', 'perdem'], ['sair (sortir)', 'saio', 'sai', 'saímos', 'saem'], ['ler (lire)', 'leio', 'lê', 'lemos', 'leem'], ['crer (croire)', 'creio', 'crê', 'cremos', 'creem'], ['rir (rire)', 'rio', 'ri', 'rimos', 'riem'], ['valer (valoir)', 'valho', 'vale', 'valemos', 'valem'], ['caber (tenir dans)', 'caibo', 'cabe', 'cabemos', 'cabem']),
      p('**Changement de voyelle** à certaines personnes : **dormir** → durmo, dorme ; **sentir** → sinto, sente ; **seguir** → sigo, segue ; **conseguir** → consigo, consegue ; **subir** → subo, **sobe** ; **fugir** → fujo, **foge**.'),
      tip('**tem** (il a) et **têm** (ils ont) se prononcent presque pareil : l’accent circonflexe marque le pluriel.'),
      ex('Eu tenho dois irmãos e vou visitá-los amanhã.', 'J’ai deux frères et je vais leur rendre visite demain.'),
      ex('Não sei o que fazer.', 'Je ne sais pas quoi faire.'),
    ],
    raw: `
Eu ___ dois irmãos. (ter)|tenho|tem,temos,têm|J'ai deux frères.
Nós ___ à praia no domingo. (ir)|vamos|vão,vai,vou|Nous allons à la plage dimanche.
O que você ___ no fim de semana? (fazer)|faz|faço,fazem,fazemos|Qu'est-ce que tu fais le week-end ?
Eu não ___ a resposta. (saber)|sei|sabe,sabo,sabemos|Je ne connais pas la réponse.
Eu ___ ir com você? (poder)|posso|pode,podo,podemos|Je peux venir avec toi ?
Eles ___ comer pizza. (querer)|querem|quer,queremos,quero|Ils veulent manger une pizza.
Eu ___ o jantar hoje. (fazer)|faço|faz,fazo,fazemos|Je fais le dîner ce soir.
Ela ___ que está com fome. (dizer)|diz|digo,dize,dizem|Elle dit qu'elle a faim.
Eu ___ de Lyon de trem. (vir)|venho|vem,vimos,veno|Je viens de Lyon en train.
Você ___ o mar daqui? (ver)|vê|vejo,veem,vemos|Tu vois la mer d'ici ?
Eu ___ ao mercado agora. (ir)|vou|vai,vamos,vão|Je vais au marché maintenant.
Onde eu ___ as malas? (pôr)|ponho|põe,pono,pomos|Où est-ce que je mets les valises ?
Eu sempre ___ um vinho quando venho. (trazer)|trago|traz,trazo,trazemos|J'apporte toujours un vin quand je viens.
Eu não ___ nada, pode falar mais alto? (ouvir)|ouço|ouve,ouvo,ouvimos|Je n'entends rien, tu peux parler plus fort ?
Eu sempre ___ a mesma coisa no restaurante. (pedir)|peço|pede,pedo,pedimos|Je commande toujours la même chose au restaurant.
Eu ___ oito horas por noite. (dormir)|durmo|dorme,dormo,dormimos|Je dors huit heures par nuit.
Eu sempre ___ minhas chaves! (perder)|perco|perde,perdo,perdemos|Je perds toujours mes clés !
A que horas vocês ___ do trabalho? (sair)|saem|saiem,saímos,sai|À quelle heure vous sortez du travail ?
Ela ___ um livro por semana. (ler)|lê|leia,lei,leem|Elle lit un livre par semaine.
Eu ___ muita saudade da minha família. (sentir)|sinto|sente,sento,sentimos|Ma famille me manque beaucoup.
Ele ___ a escada correndo. (subir)|sobe|sube,subo,sobem|Il monte l'escalier en courant.
Eu não ___ abrir essa porta. (conseguir)|consigo|consegue,conseguo,conseguimos|Je n'arrive pas à ouvrir cette porte.
Quanto ___ esse carro? (valer)|vale|valho,valem,valhe|Combien vaut cette voiture ?
Nós ___ sair agora. (poder)|podemos|pode,posso,podem|Nous pouvons sortir maintenant.
Vocês ___ o que fazer? (saber)|sabem|sabe,sei,sabemos|Vous savez quoi faire ?
Nós ___ ver o show juntos. (querer)|queremos|quer,quero,querem|Nous voulons voir le spectacle ensemble.
Vocês ___ cedo amanhã? (vir)|vêm|vem,venho,vimos|Vous venez tôt demain ?`,
  }),
  n({
    id: 'futuro-proximo',
    cat: 'conjugaison',
    level: 'A1',
    title: 'Le futur proche',
    ptTitle: 'Ir + infinitivo',
    summary: 'Le futur de tous les jours : vou viajar, vai chover…',
    lesson: [
      p('À l’oral, le futur se forme presque toujours avec **ir au présent + infinitif**, comme « aller + infinitif » en français.'),
      table(['', 'ir', '+ infinitif'], ['eu', 'vou', 'viajar'], ['você / ele / a gente', 'vai', 'comer'], ['nós', 'vamos', 'sair'], ['vocês / eles', 'vão', 'chegar']),
      ex('Amanhã eu vou trabalhar de casa.', 'Demain je vais travailler depuis la maison.'),
      ex('Vai chover à tarde.', 'Il va pleuvoir l’après-midi.'),
      tip('Le futur simple (« falarei ») existe mais sonne formel ou écrit. Pour « je vais aller », on dit simplement **vou** : « Vou à praia » (et rarement « vou ir »).'),
    ],
    raw: `
Amanhã eu ___ viajar.|vou|vai,vamos,vão|Demain je vais voyager.
Ela ___ comprar pão.|vai|vou,vamos,vão|Elle va acheter du pain.
Nós ___ jantar fora hoje.|vamos|vão,vai,vou|Nous allons dîner dehors ce soir.
Eles ___ chegar tarde.|vão|vai,vamos,vou|Ils vont arriver tard.
Vai chover? — Acho que ___ chover sim.|vai|vou,vão,vamos|Il va pleuvoir ? — Je crois que oui.
Eu vou ___ português no Brasil. (estudar)|estudar|estudo,estuda,estudando|Je vais étudier le portugais au Brésil.
A gente ___ ver um filme.|vai|vamos,vão,vou|On va regarder un film.
Você vai ___ o quê? (fazer)|fazer|faz,faço,feito|Tu vas faire quoi ?
Vocês ___ gostar da festa!|vão|vai,vamos,vou|Vous allez adorer la fête !
Eu não ___ trabalhar amanhã.|vou|vai,vamos,vão|Je ne vais pas travailler demain.
Nós ___ visitar meus pais no fim de semana.|vamos|vai,vão,vou|Nous allons visiter mes parents ce week-end.
Vocês vão ___ no aniversário? (dançar)|dançar|dança,dançam,dançando|Vous allez danser à l'anniversaire ?
Eles ___ chegar daqui a uma hora.|vão|vai,vamos,vou|Ils vont arriver dans une heure.`,
  }),
  n({
    id: 'gerundio',
    cat: 'conjugaison',
    level: 'A2',
    title: 'Être en train de (gérondif)',
    ptTitle: 'Estar + gerúndio',
    summary: 'Décrire une action en cours : estou falando, está chovendo.',
    lesson: [
      p('Pour une action **en cours**, on utilise **estar + gérondif**. Le gérondif se forme en remplaçant le **-r** de l’infinitif par **-ndo**.'),
      table(['infinitif', 'gérondif'], ['falar', 'fala**ndo**'], ['comer', 'come**ndo**'], ['partir', 'parti**ndo**'], ['fazer', 'faze**ndo**'], ['ir', 'i**ndo**']),
      ex('Estou estudando agora, te ligo depois.', 'Je suis en train d’étudier, je t’appelle après.'),
      ex('Está chovendo muito!', 'Il pleut beaucoup !'),
      tip('C’est une forme typiquement **brésilienne** (au Portugal on dit « estou a falar »). Le gérondif n’a **aucune exception** : même les verbes irréguliers sont réguliers ici.'),
    ],
    raw: `
Eu estou ___ agora. (trabalhar)|trabalhando|trabalhar,trabalhado,trabalho|Je suis en train de travailler.
Ela está ___ o almoço. (fazer)|fazendo|fazer,feito,faz|Elle est en train de préparer le déjeuner.
O que você está ___? (comer)|comendo|comer,comido,come|Qu'est-ce que tu manges ?
Nós ___ assistindo um filme.|estamos|somos,estão,está|Nous sommes en train de regarder un film.
Está ___ muito! (chover)|chovendo|chover,chovido,chove|Il pleut beaucoup !
Eles estão ___ para casa. (ir)|indo|ido,vão,ir|Ils sont en train de rentrer à la maison.
Tô ___ você! (ouvir)|ouvindo|ouvido,ouvir,ouço|Je t'entends !
Vocês estão ___ português? (estudar)|estudando|estudado,estudar,estuda|Vous étudiez le portugais ?
A criança está ___. (dormir)|dormindo|dormido,dorme,dormir|L'enfant est en train de dormir.
Eu ___ lendo um livro ótimo.|estou|sou,está,estamos|Je suis en train de lire un super livre.`,
  }),
  n({
    id: 'preterito-regulares',
    cat: 'conjugaison',
    level: 'A2',
    title: 'Passé (prétérit) des verbes réguliers',
    ptTitle: 'Pretérito perfeito: regulares',
    summary: 'Raconter une action terminée : falei, comeu, partimos.',
    lesson: [
      p('Le **pretérito perfeito** exprime une action **terminée** dans le passé. Il correspond au passé composé (et au passé simple) français.'),
      table(['', 'falar', 'comer', 'partir'], ['eu', 'fal**ei**', 'com**i**', 'part**i**'], ['você / ele / a gente', 'fal**ou**', 'com**eu**', 'part**iu**'], ['nós', 'fal**amos**', 'com**emos**', 'part**imos**'], ['vocês / eles', 'fal**aram**', 'com**eram**', 'part**iram**']),
      tip('À la forme **nós**, le passé des verbes en -ar et -ir est identique au présent : c’est le contexte qui fait la différence (« ontem falamos »).'),
      tip('Changements d’orthographe à **eu** : pegar → **peguei**, chegar → **cheguei**, ficar → **fiquei**, começar → **comecei**.'),
      ex('Ontem eu acordei cedo e corri na praia.', 'Hier je me suis réveillé tôt et j’ai couru sur la plage.'),
    ],
    raw: `
Ontem eu ___ com a minha mãe. (falar)|falei|falou,falo,falaram|Hier j'ai parlé avec ma mère.
Ela ___ muito no jantar. (comer)|comeu|comi,comeram,come|Elle a beaucoup mangé au dîner.
Eles ___ para Salvador. (viajar)|viajaram|viajou,viajei,viajamos|Ils sont partis en voyage à Salvador.
Você ___ o filme? (assistir)|assistiu|assisti,assistiram,assiste|Tu as regardé le film ?
Eu ___ às sete hoje. (acordar)|acordei|acordou,acordo,acordaram|Je me suis réveillé à sept heures aujourd'hui.
Nós ___ uma pizza ontem à noite. (pedir)|pedimos|pediram,pediu,pedi|Nous avons commandé une pizza hier soir.
Eu ___ um e-mail para o chefe. (escrever)|escrevi|escreveu,escrevo,escreveram|J'ai écrit un e-mail au chef.
A gente ___ muito na festa! (dançar)|dançou|dançaram,dancei,dança|On a beaucoup dansé à la fête !
Vocês ___ o metrô? (pegar)|pegaram|pegou,peguei,pegam|Vous avez pris le métro ?
Eu ___ a janela porque estava calor. (abrir)|abri|abriu,abro,abriram|J'ai ouvert la fenêtre parce qu'il faisait chaud.
Eu ___ atrasado. (chegar)|cheguei|chegei,chegou,chego|Je suis arrivé en retard.
Nós ___ muito ontem na festa. (dançar)|dançamos|dançaram,dancei,dança|Nous avons beaucoup dansé hier à la fête.
Vocês ___ o relatório a tempo? (terminar)|terminaram|terminou,terminei,terminamos|Vous avez fini le rapport à temps ?
Eles ___ cedo demais. (chegar)|chegaram|chegou,cheguei,chegamos|Ils sont arrivés trop tôt.
Ela ___ uma carta para o avô. (escrever)|escreveu|escrevi,escreveram,escreve|Elle a écrit une lettre à son grand-père.
Nós ___ o filme duas vezes. (assistir)|assistimos|assistiram,assisti,assiste|Nous avons regardé le film deux fois.
Eu ___ o aniversário dela. (esquecer)|esqueci|esqueceu,esquecemos,esqueceram|J'ai oublié son anniversaire.`,
  }),
  n({
    id: 'preterito-irregulares',
    cat: 'conjugaison',
    level: 'A2',
    title: 'Passé des verbes irréguliers',
    ptTitle: 'Pretérito perfeito: irregulares',
    summary: 'Fui, tive, fiz, estive, disse… les passés à connaître.',
    lesson: [
      p('Les verbes fréquents ont un prétérit **irrégulier**. Bonne nouvelle : **ser** et **ir** ont exactement la même forme au passé !'),
      table(['', 'eu', 'você / ele', 'nós', 'vocês / eles'], ['ser / ir', 'fui', 'foi', 'fomos', 'foram'], ['ter', 'tive', 'teve', 'tivemos', 'tiveram'], ['estar', 'estive', 'esteve', 'estivemos', 'estiveram'], ['fazer', 'fiz', 'fez', 'fizemos', 'fizeram'], ['dizer', 'disse', 'disse', 'dissemos', 'disseram'], ['poder', 'pude', 'pôde', 'pudemos', 'puderam'], ['querer', 'quis', 'quis', 'quisemos', 'quiseram'], ['ver', 'vi', 'viu', 'vimos', 'viram'], ['vir', 'vim', 'veio', 'viemos', 'vieram'], ['dar', 'dei', 'deu', 'demos', 'deram']),
      table(['', 'eu', 'você / ele', 'nós', 'vocês / eles'], ['trazer', 'trouxe', 'trouxe', 'trouxemos', 'trouxeram'], ['pôr', 'pus', 'pôs', 'pusemos', 'puseram'], ['saber', 'soube', 'soube', 'soubemos', 'souberam'], ['caber', 'coube', 'coube', 'coubemos', 'couberam'], ['haver', '—', 'houve', '—', '—'], ['ler', 'li', 'leu', 'lemos', 'leram'], ['ouvir', 'ouvi', 'ouviu', 'ouvimos', 'ouviram'], ['pedir', 'pedi', 'pediu', 'pedimos', 'pediram']),
      tip('**Saber** au passé signifie souvent « apprendre une nouvelle » : « Soube da notícia ontem » (j’ai appris la nouvelle hier).'),
      ex('Fui ao Rio e foi incrível!', 'Je suis allé à Rio et c’était incroyable !'),
      ex('O que você fez ontem?', 'Qu’est-ce que tu as fait hier ?'),
    ],
    raw: `
Ontem eu ___ ao cinema. (ir)|fui|foi,fomos,ia|Hier je suis allé au cinéma.
Ela ___ muito simpática comigo. (ser)|foi|fui,era,foram|Elle a été très sympathique avec moi.
Eu ___ um problema no trabalho. (ter)|tive|teve,tinha,tenho|J'ai eu un problème au travail.
O que você ___ no fim de semana? (fazer)|fez|fiz,fazeu,fizeram|Qu'est-ce que tu as fait le week-end ?
Nós ___ em Recife no ano passado. (estar)|estivemos|estamos,estiveram,estive|Nous avons été à Recife l'année dernière.
Eu ___ o jantar ontem. (fazer)|fiz|fez,fazi,fizemos|J'ai fait le dîner hier.
Ele me ___ a verdade. (dizer)|disse|dizeu,disseram,diz|Il m'a dit la vérité.
Eles ___ de carro. (vir)|vieram|viram,veio,vim|Ils sont venus en voiture.
Você ___ o jogo ontem? (ver)|viu|vi,viram,veu|Tu as vu le match hier ?
Eu ___ um presente para ela. (dar)|dei|deu,dou,dava|Je lui ai offert un cadeau.
Eu ___ um presente para você. (trazer)|trouxe|trazi,trouxei,trazeu|Je t'ai apporté un cadeau.
Onde você ___ meu celular? (pôr)|pôs|pus,pôr,ponhou|Où as-tu mis mon portable ?
Eu só ___ da notícia hoje. (saber)|soube|sabi,sabeu,soubi|Je n'ai appris la nouvelle qu'aujourd'hui.
___ um acidente na estrada. (haver)|Houve|Haveu,Houveram,Hove|Il y a eu un accident sur la route.
Nós ___ todas as instruções. (ler)|lemos|leemos,lêmos,leram|Nous avons lu toutes les instructions.
Eles ___ a música e começaram a dançar. (ouvir)|ouviram|ouveram,ouçaram,ouviu|Ils ont entendu la musique et ont commencé à danser.
Eu ___ um café e fui embora. (pedir)|pedi|peci,pedei,pediu|J'ai commandé un café et je suis parti.
Vocês ___ fazer tudo a tempo? (poder)|puderam|poderam,pôde,podiam|Vous avez pu tout faire à temps ?
Vocês ___ tempo de almoçar? (ter)|tiveram|teve,tive,tivemos|Vous avez eu le temps de déjeuner ?
Nós ___ ao museu no sábado. (ir)|fomos|foram,fui,foi|Nous sommes allés au musée samedi.
Vocês ___ aqui ontem à noite? (estar)|estiveram|esteve,estive,estivemos|Vous avez été ici hier soir ?
Nós ___ a verdade afinal. (saber)|soubemos|soube,souberam,sabia|Nous avons appris la vérité finalement.`,
  }),
  n({
    id: 'imperfeito',
    cat: 'conjugaison',
    level: 'A2',
    title: 'L’imparfait',
    ptTitle: 'Pretérito imperfeito',
    summary: 'Habitudes et descriptions au passé : eu morava, era, tinha.',
    lesson: [
      p('L’**imperfeito** s’utilise comme l’imparfait français : **habitudes** passées, **descriptions**, actions **en cours** interrompues.'),
      table(['', 'falar', 'comer / partir'], ['eu', 'fal**ava**', 'com**ia**'], ['você / ele / a gente', 'fal**ava**', 'com**ia**'], ['nós', 'fal**ávamos**', 'com**íamos**'], ['vocês / eles', 'fal**avam**', 'com**iam**']),
      p('Seulement **4 irréguliers** : **ser** (era, éramos, eram), **ter** (tinha), **vir** (vinha), **pôr** (punha).'),
      ex('Quando eu era criança, morava perto do mar.', 'Quand j’étais enfant, j’habitais près de la mer.'),
      ex('Eu estava dormindo quando você ligou.', 'Je dormais quand tu as appelé.'),
      tip('À l’oral brésilien, l’imparfait sert aussi de politesse : « Eu **queria** um café » (je voudrais un café).'),
    ],
    raw: `
Quando eu era criança, eu ___ na praia. (morar)|morava|morei,moro,moravam|Quand j'étais enfant, j'habitais à la plage.
Antigamente nós ___ muito arroz. (comer)|comíamos|comemos,comiam,comia|Autrefois nous mangions beaucoup de riz.
Ela ___ muito bonita. (ser)|era|foi,eram,é|Elle était très belle.
Eu ___ cansado, então dormi cedo. (estar)|estava|estive,estou,estavam|J'étais fatigué, alors je me suis couché tôt.
Eles ___ três cachorros. (ter)|tinham|tiveram,tinha,têm|Ils avaient trois chiens.
Todo verão a gente ___ para a casa da avó. (ir)|ia|foi,vai,iam|Chaque été on allait chez la grand-mère.
Enquanto eu ___, ela ligou. (cozinhar)|cozinhava|cozinhei,cozinho,cozinhavam|Pendant que je cuisinais, elle a appelé.
___ sol quando saímos. (fazer)|Fazia|Fez,Faz,Faziam|Il faisait beau quand nous sommes sortis.
Vocês ___ futebol na escola? (jogar)|jogavam|jogaram,jogava,jogam|Vous jouiez au foot à l'école ?
Eu ___ ler antes de dormir. (costumar)|costumava|costumei,costumo,costumavam|J'avais l'habitude de lire avant de dormir.
Vocês ___ muito juntos na escola. (brincar)|brincavam|brincava,brincávamos,brincaram|Vous jouiez beaucoup ensemble à l'école.
Eles ___ sempre tarde para o trabalho. (chegar)|chegavam|chegava,chegou,chegaram|Ils arrivaient toujours en retard au travail.
Nós ___ muito quando éramos crianças. (viajar)|viajávamos|viajava,viajaram,viajavam|Nous voyagions beaucoup quand nous étions enfants.`,
  }),
  n({
    id: 'imperativo',
    cat: 'conjugaison',
    level: 'A2',
    title: 'L’impératif',
    ptTitle: 'Imperativo',
    summary: 'Donner un ordre ou un conseil, familier ou poli.',
    lesson: [
      p('Au Brésil, il existe **deux impératifs** pour « você » :'),
      p('**Familier (oral)** = forme du présent de « ele » : **fala!**, **come!**, **abre!**, **vem!**'),
      p('**Poli / standard** = forme du subjonctif : **fale**, **coma**, **abra**, **venha**. On l’entend dans les magasins, les consignes, les médecins…'),
      table(['verbe', 'familier', 'poli'], ['falar', 'fala', 'fale'], ['comer', 'come', 'coma'], ['abrir', 'abre', 'abra'], ['virar', 'vira', 'vire'], ['ir', 'vai', 'vá'], ['fazer', 'faz', 'faça'], ['vir', 'vem', 'venha'], ['ter', 'tem', 'tenha'], ['pôr', 'põe', 'ponha']),
      ex('Olha isso! / Olhe aqui, por favor.', 'Regarde ça ! / Regardez ici, s’il vous plaît.'),
      tip('Le poli se forme à partir du « eu » du présent : fal**o** → fal**e**, com**o** → com**a**, faç**o** → faç**a**, tenh**o** → tenh**a**.'),
    ],
    raw: `
Por favor, ___ mais devagar. (falar, poli)|fale|fala,falo,falar|Parlez plus lentement, s'il vous plaît.
___ aqui, rapidinho! (vir, familier)|Vem|Venha,Vir,Veio|Viens ici, deux secondes !
___ a porta, por favor. (abrir, poli)|Abra|Abre,Abro,Abrir|Ouvrez la porte, s'il vous plaît.
Não ___ medo! (ter, poli)|tenha|tem,ter,tenho|N'ayez pas peur !
___ à direita na próxima rua. (virar, poli)|Vire|Vira,Virar,Viro|Tournez à droite à la prochaine rue.
___ isso! Que lindo! (olhar, familier)|Olha|Olhe,Olhar,Olho|Regarde ça ! Que c'est beau !
___ o que eu falei. (fazer, poli)|Faça|Faz,Fazer,Faço|Faites ce que j'ai dit.
___ com Deus! (ir, poli)|Vá|Vai,Ir,Vou|Va avec Dieu ! (au revoir affectueux)
___ um pouco, já volto! (esperar, familier)|Espera|Espere,Esperar,Espero|Attends un peu, je reviens !
___ a mesa, por favor. (pôr, poli)|Ponha|Põe,Pôr,Ponho|Mettez la table, s'il vous plaît.
___ embora, está tarde! (ir, « vamos »)|Vamos|Vai,Vão,Vou|Allons-y, il est tard !
___ a mesa com cuidado, por favor. (pôr, poli pluriel)|Ponham|Põe,Ponha,Põem|Mettez la table avec soin, s'il vous plaît.
___ mais baixo, por favor! (falar, poli pluriel)|Falem|Fala,Fale,Falam|Parlez plus bas, s'il vous plaît !`,
  }),

  n({
    id: 'subjuntivo-presente',
    cat: 'conjugaison',
    level: 'B1',
    title: 'Le subjonctif présent',
    ptTitle: 'Presente do subjuntivo',
    summary: 'Il faut que tu manges, j’espère que tu viens… : souhait, obligation, doute.',
    lesson: [
      p('Le **subjonctif présent** s’emploie après les expressions de **souhait**, de **volonté**, d’**obligation**, de **doute** et après certaines conjonctions. On l’utilise un peu plus qu’en français.'),
      p('**Formation** : on part du « eu » au présent, on enlève le **-o**, et on ajoute les terminaisons **inversées** : -ar → **-e**, -er / -ir → **-a**.'),
      table(['', 'falar (falo)', 'comer (como)', 'fazer (faço)'], ['eu', 'fal**e**', 'com**a**', 'faç**a**'], ['você / ele / a gente', 'fal**e**', 'com**a**', 'faç**a**'], ['nós', 'fal**emos**', 'com**amos**', 'faç**amos**'], ['vocês / eles', 'fal**em**', 'com**am**', 'faç**am**']),
      p('Grâce au « eu », beaucoup d’irréguliers deviennent réguliers : ter → **tenha**, dizer → **diga**, poder → **possa**, ver → **veja**, vir → **venha**.'),
      p('Vrais irréguliers à connaître : **ser → seja**, **estar → esteja**, **ir → vá**, **saber → saiba**, **querer → queira**, **dar → dê**.'),
      table(['déclencheur', 'exemple'], ['é preciso que / é importante que', 'É preciso que você **coma**.'], ['espero que / tomara que', 'Tomara que não **chova**!'], ['quero que / peço que', 'Quero que você **venha**.'], ['talvez', 'Talvez ela **tenha** razão.'], ['para que / embora / antes que / caso', 'Fala devagar para que eu **entenda**.'], ['não acho que / duvido que', 'Não acho que ele **saiba**.']),
      tip('Attention aux changements d’orthographe pour garder le son : chegar → **chegue**, ficar → **fique**, começar → **comece**.'),
      ex('É preciso que você coma mais legumes.', 'Il faut que tu manges plus de légumes.'),
      ex('Espero que você seja muito feliz.', 'J’espère que tu seras très heureux.'),
    ],
    raw: `
É preciso que você ___ mais. (comer)|coma|come,comer,comeu|Il faut que tu manges plus.
Espero que você ___ feliz. (ser)|seja|é,esteja,for|J'espère que tu seras heureux.
Quero que você ___ comigo. (vir)|venha|vem,vier,vinha|Je veux que tu viennes avec moi.
Talvez ela ___ razão. (ter)|tenha|tem,tinha,tiver|Elle a peut-être raison.
Tomara que não ___! (chover)|chova|chove,chover,choveu|Pourvu qu'il ne pleuve pas !
É importante que vocês ___ cedo. (chegar)|cheguem|chegam,chegarem,chegue|Il est important que vous arriviez tôt.
Embora eu ___ cansado, vou sair. (estar)|esteja|estou,está,estivesse|Bien que je sois fatigué, je vais sortir.
Fala devagar para que eu ___. (entender)|entenda|entendo,entende,entender|Parle lentement pour que je comprenne.
Não acho que ele ___ a verdade. (saber)|saiba|sabe,sabia,souber|Je ne pense pas qu'il sache la vérité.
Meus pais querem que eu ___ medicina. (estudar)|estude|estudo,estuda,estudar|Mes parents veulent que j'étudie la médecine.
Duvido que ela ___ hoje. (ir)|vá|vai,vou,for|Je doute qu'elle y aille aujourd'hui.
É importante que nós ___ a verdade. (dizer)|digamos|diga,dizemos,disser|Il est important que nous disions la vérité.
Espero que vocês ___ bem na viagem. (estar)|estejam|está,estamos,estiverem|J'espère que vous allez bien pendant le voyage.
Talvez eles ___ razão. (ter)|tenham|tem,temos,tiver|Ils ont peut-être raison.`,
  }),
  n({
    id: 'subjuntivo-imperfeito',
    cat: 'conjugaison',
    level: 'B1',
    title: 'Subjonctif imparfait et hypothèses',
    ptTitle: 'Imperfeito do subjuntivo + condicional',
    summary: 'J’aimerais que tu sois, si j’avais… je ferais… : souhaits et hypothèses.',
    lesson: [
      p('Pour dire « **j’aimerais que tu sois** » ou « **si j’avais…, je ferais…** », le portugais utilise le **subjonctif imparfait**, souvent avec le **conditionnel**.'),
      p('**Formation** : on part du prétérit à la 3ᵉ personne du pluriel (eles fala**ram**), on enlève **-ram** et on ajoute **-sse**.'),
      table(['', 'falar (falaram)', 'comer (comeram)', 'ser / ir (foram)', 'ter (tiveram)'], ['eu', 'fala**sse**', 'come**sse**', 'fo**sse**', 'tive**sse**'], ['você / ele / a gente', 'fala**sse**', 'come**sse**', 'fo**sse**', 'tive**sse**'], ['nós', 'falá**ssemos**', 'comê**ssemos**', 'fô**ssemos**', 'tivé**ssemos**'], ['vocês / eles', 'fala**ssem**', 'come**ssem**', 'fo**ssem**', 'tive**ssem**']),
      p('Autres formes utiles : estar → **estivesse**, fazer → **fizesse**, poder → **pudesse**, querer → **quisesse**, dizer → **dissesse**, vir → **viesse**, saber → **soubesse**, dar → **desse**.'),
      table(['emploi', 'exemple'], ['souhait au conditionnel', 'Eu **gostaria** que você **fosse** comigo.'], ['hypothèse : se + subj. imparfait → conditionnel', 'Se eu **tivesse** tempo, **viajaria** mais.'], ['volonté au passé', 'Ela **queria** que eu **ficasse**.'], ['como se (comme si)', 'Ele fala como se **soubesse** tudo.']),
      tip('À l’oral brésilien, le conditionnel est souvent remplacé par l’imparfait : « Se eu tivesse dinheiro, eu **comprava** um carro ». Le subjonctif imparfait, lui, reste obligatoire après « se ».'),
      ex('Eu gostaria que você fosse feliz.', 'J’aimerais que tu sois heureux.'),
      ex('Se eu fosse você, não faria isso.', 'Si j’étais toi, je ne ferais pas ça.'),
    ],
    raw: `
Eu gostaria que você ___ comigo. (vir)|viesse|venha,vinha,vier|J'aimerais que tu viennes avec moi.
Eu gostaria que você ___ feliz. (ser)|fosse|seja,era,for|J'aimerais que tu sois heureux.
Se eu ___ dinheiro, viajaria pelo mundo. (ter)|tivesse|tenha,tinha,tiver|Si j'avais de l'argent, je voyagerais dans le monde entier.
Se você ___ mais, falaria melhor. (estudar)|estudasse|estude,estudava,estudar|Si tu étudiais plus, tu parlerais mieux.
Se fizesse sol, nós ___ à praia. (ir, conditionnel)|iríamos|iremos,vamos,fomos|S'il faisait beau, nous irions à la plage.
Ele fala como se ___ tudo. (saber)|soubesse|sabia,saiba,souber|Il parle comme s'il savait tout.
Minha mãe queria que eu ___ médico. (ser)|fosse|seja,era,sou|Ma mère voulait que je sois médecin.
Se eu ___ você, não faria isso. (ser)|fosse|seja,era,for|Si j'étais toi, je ne ferais pas ça.
O que você ___ se ganhasse na loteria? (fazer, conditionnel)|faria|fará,fazeria,fizesse|Que ferais-tu si tu gagnais au loto ?
Seria ótimo se vocês ___ vir amanhã. (poder)|pudessem|possam,podiam,puderem|Ce serait super si vous pouviez venir demain.
Eu pedi que ele ___ a porta. (fechar)|fechasse|feche,fechava,fechar|Je lui ai demandé de fermer la porte.`,
  }),
  n({
    id: 'subjuntivo-futuro',
    cat: 'conjugaison',
    level: 'B1',
    title: 'Le subjonctif futur',
    ptTitle: 'Futuro do subjuntivo',
    summary: 'Se você quiser, quando eu puder… : conditions et moments à venir.',
    lesson: [
      p('Ce temps n’existe pas en français, mais il est **partout** au Brésil. Il s’emploie après **se** (si), **quando** (quand), **assim que** (dès que), **enquanto** (tant que), **como** (comme) quand l’action est **future** ou incertaine.'),
      p('**Formation** : comme le subjonctif imparfait, on part de « eles ___ram » et on enlève **-ram**. Pour les verbes réguliers, la forme ressemble à l’**infinitif**.'),
      table(['', 'falar', 'querer (quiseram)', 'ser / ir (foram)', 'ter (tiveram)'], ['eu', 'falar', 'quiser', 'for', 'tiver'], ['você / ele / a gente', 'falar', 'quiser', 'for', 'tiver'], ['nós', 'falar**mos**', 'quiser**mos**', 'for**mos**', 'tiver**mos**'], ['vocês / eles', 'falar**em**', 'quiser**em**', 'for**em**', 'tiver**em**']),
      p('Formes fréquentes : poder → **puder**, fazer → **fizer**, estar → **estiver**, saber → **souber**, vir → **vier**, ver → **vir** (!), dizer → **disser**.'),
      tip('Piège : le subjonctif futur de **ver** est **vir** (« se você vir o Pedro »), et celui de **vir** est **vier** (« quando você vier »).'),
      ex('Se você quiser, a gente vai junto.', 'Si tu veux, on y va ensemble.'),
      ex('Quando eu puder, te ligo.', 'Quand je pourrai, je t’appellerai.'),
    ],
    raw: `
Se você ___, a gente vai junto. (querer)|quiser|quer,queira,querer|Si tu veux, on y va ensemble.
Quando eu ___, te ligo. (poder)|puder|posso,possa,poder|Quand je pourrai, je t'appellerai.
Assim que ela ___, a gente sai. (chegar)|chegar|chega,chegue,chegou|Dès qu'elle arrive, on part.
Se ___ sol amanhã, vamos à praia. (fazer)|fizer|faz,faça,fazer|S'il fait beau demain, on va à la plage.
Quando vocês ___ ao Brasil, me avisem. (vir)|vierem|vêm,venham,virem|Quand vous viendrez au Brésil, prévenez-moi.
Se eu ___ tempo, vou à academia. (ter)|tiver|tenho,tenha,ter|Si j'ai le temps, j'irai à la salle de sport.
Enquanto você ___ aqui, pode usar meu quarto. (estar)|estiver|está,esteja,estar|Tant que tu seras ici, tu peux utiliser ma chambre.
Se ___ possível, chego às oito. (ser)|for|é,seja,ser|Si c'est possible, j'arrive à huit heures.
Faça como você ___. (querer)|quiser|quer,queira,querer|Fais comme tu veux.
Quando eu ___ a resposta, te conto. (saber)|souber|sei,saiba,saber|Quand je saurai la réponse, je te la dirai.
Se vocês ___ o filme, me digam. (ver)|virem|verem,vejam,veem|Si vous voyez le film, dites-le-moi.`,
  }),

  n({
    id: 'participio',
    cat: 'conjugaison',
    level: 'A2',
    title: 'Le participe passé',
    ptTitle: 'Particípio',
    summary: 'Falado, comido, feito, dito, aberto… la base de tous les temps composés.',
    lesson: [
      p('Le participe passé se forme avec **-ado** (verbes en -ar) et **-ido** (verbes en -er / -ir).'),
      table(['infinitif', 'participe'], ['falar', 'fal**ado**'], ['comer', 'com**ido**'], ['partir', 'part**ido**']),
      p('**Participes irréguliers** à connaître :'),
      table(['infinitif', 'participe', 'infinitif', 'participe'], ['fazer', 'feito', 'dizer', 'dito'], ['ver', 'visto', 'vir', 'vindo'], ['escrever', 'escrito', 'abrir', 'aberto'], ['pôr', 'posto', 'cobrir', 'coberto']),
      p('**Doubles participes** : au Brésil on emploie surtout la forme courte : ganhar → **ganho**, pagar → **pago**, gastar → **gasto**, aceitar → **aceito**, entregar → **entregue**.'),
      tip('Avec **ser / estar**, le participe s’accorde comme un adjectif : « a porta está **aberta** », « as contas foram **pagas** ». Avec **ter** (temps composés), il reste invariable : « eu tinha **aberto** a porta ».'),
      ex('A loja está fechada e o jantar já está feito.', 'Le magasin est fermé et le dîner est déjà prêt.'),
    ],
    raw: `
A porta está ___. (abrir)|aberta|abrida,aberto,abrido|La porte est ouverte.
O jantar já está ___. (fazer)|feito|fazido,feita,fizado|Le dîner est déjà prêt.
Esse livro foi ___ por um brasileiro. (escrever)|escrito|escrevido,escrita,escribido|Ce livre a été écrit par un Brésilien.
A conta já foi ___. (pagar)|paga|pagada,pago,pagado|L'addition a déjà été payée.
Eu nunca tinha ___ o mar. (ver)|visto|vido,vista,veído|Je n'avais jamais vu la mer.
O que foi ___ na reunião? (dizer)|dito|dizido,dita,dixo|Qu'est-ce qui a été dit en réunion ?
As janelas estão ___. (fechar)|fechadas|fechados,fechada,fechido|Les fenêtres sont fermées.
Ele tinha ___ de longe para a festa. (vir)|vindo|vinido,venido,vido|Il était venu de loin pour la fête.
A mesa está ___. (pôr)|posta|ponida,posto,pôsta|La table est mise.
O time tinha ___ o jogo. (ganhar)|ganho/ganhado|ganhido,ganha,ganhando|L'équipe avait gagné le match.`,
  }),
  n({
    id: 'preterito-composto',
    cat: 'conjugaison',
    level: 'B1',
    title: 'Le « passé composé » portugais',
    ptTitle: 'Pretérito perfeito composto',
    summary: 'Tenho trabalhado muito : une action qui dure jusqu’à aujourd’hui.',
    lesson: [
      p('Formation : **ter** au présent + **participe** (invariable).'),
      table(['', 'trabalhar'], ['eu', 'tenho trabalhado'], ['você / ele / a gente', 'tem trabalhado'], ['nós', 'temos trabalhado'], ['vocês / eles', 'têm trabalhado']),
      p('**Piège pour les francophones** : ce n’est PAS le passé composé français ! Il exprime une action **répétée ou continue** qui a commencé dans le passé et **dure jusqu’à maintenant** (« ces derniers temps »).'),
      table(['portugais', 'sens'], ['Ontem eu **trabalhei** muito.', 'Hier j’ai beaucoup travaillé (fini).'], ['Ultimamente eu **tenho trabalhado** muito.', 'Ces derniers temps, je travaille beaucoup.']),
      tip('Mots-indices : **ultimamente**, **nos últimos dias**, **desde…**, **esses tempos**. Pour une action ponctuelle et terminée, on garde le prétérit simple (falei, comi).'),
      ex('Tem chovido muito ultimamente.', 'Il pleut beaucoup ces derniers temps.'),
    ],
    raw: `
Ultimamente eu ___ muito. (trabalhar)|tenho trabalhado|trabalhei,tinha trabalhado,trabalho|Ces derniers temps, je travaille beaucoup.
Ontem eu ___ até tarde. (trabalhar)|trabalhei|tenho trabalhado,trabalhava,tinha trabalhado|Hier j'ai travaillé tard.
Ela ___ muito mal nas últimas semanas. (dormir)|tem dormido|dormiu,dormia,tinha dormido|Elle dort très mal ces dernières semaines.
Nós ___ a vovó com frequência desde o ano passado. (visitar)|temos visitado|visitamos,visitávamos,tínhamos visitado|Nous rendons souvent visite à mamie depuis l'an dernier.
Eles ___ ao cinema todo fim de semana. (ir)|têm ido|foram,iam,têm vindo|Ils vont au cinéma tous les week-ends ces temps-ci.
Tem ___ muito ultimamente. (chover)|chovido|chovendo,choveu,chovida|Il pleut beaucoup ces derniers temps.
O que você ___ de bom? (fazer, ces temps-ci)|tem feito|fez,fazia,tinha feito|Qu'est-ce que tu fais de beau ces temps-ci ?
Eu ___ português todos os dias desde janeiro. (estudar)|tenho estudado|estudei,estudava,tinha estudado|J'étudie le portugais tous les jours depuis janvier.
Vocês ___ notícias dele? (ter, ces temps-ci)|têm tido|tiveram,tinham,têm tendo|Vous avez des nouvelles de lui ces temps-ci ?
Ano passado nós ___ para o Chile. (viajar)|viajamos|temos viajado,viajávamos,tínhamos viajado|L'année dernière, nous sommes partis au Chili.`,
  }),
  n({
    id: 'mais-que-perfeito',
    cat: 'conjugaison',
    level: 'B1',
    title: 'Le plus-que-parfait',
    ptTitle: 'Pretérito mais-que-perfeito',
    summary: 'Eu já tinha saído : une action antérieure à une autre action passée.',
    lesson: [
      p('Formation courante : **ter** à l’imparfait + **participe**. On trouve aussi **haver** (plus soutenu) : « havia saído ».'),
      table(['', 'sair'], ['eu', 'tinha saído'], ['você / ele / a gente', 'tinha saído'], ['nós', 'tínhamos saído'], ['vocês / eles', 'tinham saído']),
      p('Il s’emploie comme en français, pour une action **déjà terminée** au moment d’une autre action passée.'),
      ex('Quando cheguei, o filme já tinha começado.', 'Quand je suis arrivé, le film avait déjà commencé.'),
      tip('Il existe aussi une forme simple littéraire (**falara, saíra**) : tu la croiseras dans les livres, mais elle n’est presque jamais utilisée à l’oral.'),
    ],
    raw: `
Quando cheguei, o filme já ___. (começar)|tinha começado|começou,começava,tem começado|Quand je suis arrivé, le film avait déjà commencé.
Eu nunca ___ uma comida tão boa. (comer)|tinha comido|comia,tenho comido,tinha comendo|Je n'avais jamais mangé un plat aussi bon.
Ela disse que já ___ o livro. (ler)|tinha lido|lia,tem lido,tinha leído|Elle a dit qu'elle avait déjà lu le livre.
Nós já ___ o carro antes de viajar. (vender)|tínhamos vendido|vendíamos,temos vendido,tínhamos vendo|Nous avions déjà vendu la voiture avant de partir.
Quando ligaram, eles já ___. (sair)|tinham saído|saíam,têm saído,tinham saindo|Quand ils ont appelé, ils étaient déjà partis.
Eu ___ a porta, mas alguém abriu de novo. (fechar)|tinha fechado|fechava,tenho fechado,tinha fechando|J'avais fermé la porte, mais quelqu'un l'a rouverte.
Você já ___ o Rio antes dessa viagem? (visitar)|tinha visitado|visitava,tem visitado,teria visitado|Tu avais déjà visité Rio avant ce voyage ?
Ele percebeu que ___ a chave em casa. (esquecer)|tinha esquecido|esquecia,tem esquecido,teria esquecido|Il s'est rendu compte qu'il avait oublié la clé à la maison.
Quando acordei, ela já ___ o café. (fazer)|tinha feito|fazia,tem feito,tinha fazido|Quand je me suis réveillé, elle avait déjà fait le café.
Quando começou a chover, nós já ___. (chegar)|tínhamos chegado|chegávamos,temos chegado,teríamos chegado|Quand il a commencé à pleuvoir, nous étions déjà arrivés.`,
  }),
  n({
    id: 'futuro-simples',
    cat: 'conjugaison',
    level: 'B1',
    title: 'Le futur simple',
    ptTitle: 'Futuro do presente',
    summary: 'Falarei, farei, direi : le futur de l’écrit, des annonces et des prédictions.',
    lesson: [
      p('Formation : **infinitif entier** + terminaisons (comme en français).'),
      table(['', 'falar', 'comer', 'partir'], ['eu', 'falar**ei**', 'comer**ei**', 'partir**ei**'], ['você / ele / a gente', 'falar**á**', 'comer**á**', 'partir**á**'], ['nós', 'falar**emos**', 'comer**emos**', 'partir**emos**'], ['vocês / eles', 'falar**ão**', 'comer**ão**', 'partir**ão**']),
      p('Seulement **3 irréguliers** : **fazer → far-**, **dizer → dir-**, **trazer → trar-** (farei, direi, trarei).'),
      p('Usage : langue **écrite**, **formelle** (journaux, annonces, discours), **prédictions** et promesses. À l’oral, on préfère presque toujours **ir + infinitif** (« vou falar »).'),
      ex('O voo partirá às dez horas.', 'Le vol partira à dix heures.'),
      tip('« **Haverá** » = il y aura. Et « **Será que…?** » sert à poser une question qu’on se pose : « Será que vai chover? » (Est-ce qu’il va pleuvoir ?).'),
    ],
    raw: `
Amanhã ___ sol em todo o país. (fazer)|fará|fazerá,faz,faria|Demain il fera beau dans tout le pays.
O voo ___ às dez horas. (partir)|partirá|partiria,parte,partirão|Le vol partira à dix heures.
Nós ___ o resultado na segunda-feira. (anunciar)|anunciaremos|anunciaríamos,anunciamos,anunciarão|Nous annoncerons le résultat lundi.
Você ___ que eu tinha razão. (ver)|verá|veria,vê,vês|Tu verras que j'avais raison.
Eles ___ a verdade um dia. (dizer)|dirão|dizerão,diriam,dizem|Ils diront la vérité un jour.
Eu ___ tudo o que for possível. (fazer)|farei|fazerei,faria,faço|Je ferai tout ce qui sera possible.
A loja ___ fechada no feriado. (estar)|estará|estaria,está,estarão|Le magasin sera fermé le jour férié.
Quem ___ a sobremesa? (trazer)|trará|trazerá,traria,traz|Qui apportera le dessert ?
Vocês ___ saudade do Brasil. (sentir)|sentirão|sentiriam,sentem,sentirá|Le Brésil vous manquera.
___ uma reunião às três horas. (haver)|Haverá|Haveria,Há,Haverão|Il y aura une réunion à trois heures.
Eu te ___ amanhã. (ligar)|ligarei|ligaria,ligo,ligará|Je t'appellerai demain.
Nós ___ ao Brasil no ano que vem. (voltar)|voltaremos|voltaríamos,voltamos,voltarão|Nous retournerons au Brésil l'année prochaine.
Vocês ___ muita saudade de casa. (sentir)|sentirão|sentiriam,sentem,sentirá|Vous manquerez beaucoup de la maison.`,
  }),
  n({
    id: 'futuro-anterior',
    cat: 'conjugaison',
    level: 'B2',
    title: 'Le futur antérieur',
    ptTitle: 'Futuro do presente composto',
    summary: 'Terei terminado : une action finie avant un moment futur.',
    lesson: [
      p('Formation : **ter** au futur simple + **participe**.'),
      table(['', 'terminar'], ['eu', 'terei terminado'], ['você / ele / a gente', 'terá terminado'], ['nós', 'teremos terminado'], ['vocês / eles', 'terão terminado']),
      p('Usage : une action qui **sera terminée** avant un moment du futur (« d’ici vendredi », « quand tu arriveras »). Il sert aussi à faire une **supposition** sur le passé : « Ele terá esquecido? » (Il aura oublié ?).'),
      ex('Até sexta, eu terei terminado o projeto.', 'D’ici vendredi, j’aurai terminé le projet.'),
      tip('À l’oral, on simplifie souvent : « Até sexta, eu **já vou ter terminado** ».'),
    ],
    raw: `
Quando você chegar, eu já ___ o jantar. (preparar)|terei preparado|tinha preparado,preparei,teria preparado|Quand tu arriveras, j'aurai déjà préparé le dîner.
Até sexta, nós ___ o projeto. (terminar)|teremos terminado|tínhamos terminado,terminamos,teríamos terminado|D'ici vendredi, nous aurons terminé le projet.
Em 2030, eles já ___ a casa. (construir)|terão construído|tinham construído,construíram,teriam construído|En 2030, ils auront déjà construit la maison.
Daqui a uma hora, o avião ___. (pousar)|terá pousado|tinha pousado,pousou,teria pousado|Dans une heure, l'avion aura atterri.
Quando o sol nascer, nós já ___. (sair)|teremos saído|tínhamos saído,saímos,teríamos saído|Quand le soleil se lèvera, nous serons déjà partis.
Até o fim do mês, eu ___ todo o dinheiro. (gastar)|terei gastado/terei gasto|tinha gastado,gastei,teria gastado|D'ici la fin du mois, j'aurai dépensé tout l'argent.
Você ___ o livro até amanhã? (ler)|terá lido|tinha lido,leu,teria lido|Tu auras lu le livre d'ici demain ?
Ele ainda não chegou. ___ o ônibus? (perder, supposition)|Terá perdido|Tinha perdido,Teria perdendo,Tem perdido|Il n'est toujours pas arrivé. Il aura raté le bus ?`,
  }),
  n({
    id: 'condicional',
    cat: 'conjugaison',
    level: 'B1',
    title: 'Le conditionnel',
    ptTitle: 'Futuro do pretérito',
    summary: 'Gostaria, poderia, faria : politesse, souhaits et hypothèses.',
    lesson: [
      p('Formation : **infinitif entier** + **-ia, -ia, -íamos, -iam**.'),
      table(['', 'falar', 'comer', 'partir'], ['eu', 'falar**ia**', 'comer**ia**', 'partir**ia**'], ['você / ele / a gente', 'falar**ia**', 'comer**ia**', 'partir**ia**'], ['nós', 'falar**íamos**', 'comer**íamos**', 'partir**íamos**'], ['vocês / eles', 'falar**iam**', 'comer**iam**', 'partir**iam**']),
      p('Mêmes **3 irréguliers** qu’au futur : **faria**, **diria**, **traria**.'),
      table(['emploi', 'exemple'], ['politesse', 'Você **poderia** me ajudar?'], ['souhait', 'Eu **gostaria** de um café.'], ['hypothèse (avec se + subj. imparfait)', 'Se eu pudesse, **viajaria** mais.'], ['futur dans le passé', 'Ele disse que **chegaria** tarde.']),
      tip('À l’oral brésilien, le conditionnel est souvent remplacé par l’**imparfait** : « Eu **queria** um café », « Se eu pudesse, eu **viajava** ».'),
    ],
    raw: `
Eu ___ de um café, por favor. (gostar)|gostaria|gostarei,gosto,gostei|J'aimerais un café, s'il vous plaît.
Você ___ me ajudar? (poder)|poderia|poderá,pode,pôde|Pourriez-vous m'aider ?
Com mais dinheiro, nós ___ mais. (viajar)|viajaríamos|viajaremos,viajamos,viajávamos|Avec plus d'argent, nous voyagerions davantage.
Eu não ___ isso no seu lugar. (fazer)|faria|fazeria,farei,fiz|Je ne ferais pas ça à ta place.
O que você ___ no meu lugar? (dizer)|diria|dizeria,dirá,disse|Qu'est-ce que tu dirais à ma place ?
Eu ___ morar no Rio. (adorar)|adoraria|adorarei,adoro,adorei|J'adorerais habiter à Rio.
Ele disse que ___ mais tarde. (chegar)|chegaria|chegará,chega,chegou|Il a dit qu'il arriverait plus tard.
Seria possível? — Sim, ___ ótimo! (ser)|seria|será,é,foi|Ce serait possible ? — Oui, ce serait super !
Eles ___ o carro se pudessem. (vender)|venderiam|venderão,vendem,venderam|Ils vendraient la voiture s'ils pouvaient.
Ela prometeu que ___ o bolo. (trazer)|traria|trazeria,trará,trouxe|Elle a promis qu'elle apporterait le gâteau.`,
  }),
  n({
    id: 'condicional-passado',
    cat: 'conjugaison',
    level: 'B2',
    title: 'Le conditionnel passé',
    ptTitle: 'Futuro do pretérito composto',
    summary: 'Teria vindo : ce qui aurait pu se passer.',
    lesson: [
      p('Formation : **ter** au conditionnel + **participe**.'),
      table(['', 'vir'], ['eu', 'teria vindo'], ['você / ele / a gente', 'teria vindo'], ['nós', 'teríamos vindo'], ['vocês / eles', 'teriam vindo']),
      p('Usage : une hypothèse **non réalisée** dans le passé, souvent avec **se + subjonctif plus-que-parfait** (« se eu tivesse sabido… »), ou un regret, un reproche.'),
      ex('Se eu tivesse sabido, teria vindo.', 'Si j’avais su, je serais venu.'),
      tip('À l’oral on entend aussi « **tinha vindo** » à la place de « teria vindo » : « Se eu soubesse, tinha vindo ».'),
    ],
    raw: `
Se eu tivesse sabido, ___. (vir)|teria vindo|tinha vindo,viria,terei vindo|Si j'avais su, je serais venu.
Com mais tempo, nós ___ o museu. (visitar)|teríamos visitado|tínhamos visitado,visitaríamos,teremos visitado|Avec plus de temps, nous aurions visité le musée.
Você ___ do show! (gostar)|teria gostado|tinha gostado,gostaria,terá gostado|Tu aurais aimé le concert !
Se ela tivesse estudado, ___ na prova. (passar)|teria passado|tinha passado,passaria,terá passado|Si elle avait étudié, elle aurait réussi l'examen.
Eu ___ outra coisa no seu lugar. (fazer)|teria feito|tinha feito,teria fazido,terei feito|J'aurais fait autre chose à ta place.
Eles ___ mais cedo se não tivesse chovido. (chegar)|teriam chegado|tinham chegado,chegariam,terão chegado|Ils seraient arrivés plus tôt s'il n'avait pas plu.
Sem a sua ajuda, eu não ___. (conseguir)|teria conseguido|tinha conseguido,conseguiria,terei conseguido|Sans ton aide, je n'y serais pas arrivé.
Se você tivesse pedido, eu te ___. (ajudar)|teria ajudado|tinha ajudado,ajudaria,terei ajudado|Si tu me l'avais demandé, je t'aurais aidé.`,
  }),
  n({
    id: 'subjuntivo-composto',
    cat: 'conjugaison',
    level: 'B2',
    title: 'Subjonctif passé et plus-que-parfait',
    ptTitle: 'Subjuntivo composto',
    summary: 'Espero que tenha gostado, se eu tivesse sabido… : le subjonctif au passé.',
    lesson: [
      p('Trois formes, toutes construites avec **ter** au subjonctif + **participe** :'),
      table(['temps', 'formation', 'exemple'], ['passé', 'tenha + participe', 'Espero que você **tenha gostado**.'], ['plus-que-parfait', 'tivesse + participe', 'Se eu **tivesse sabido**, teria vindo.'], ['futur composé', 'tiver + participe', 'Quando você **tiver terminado**, me avise.']),
      table(['', 'tenha', 'tivesse', 'tiver'], ['eu', 'tenha falado', 'tivesse falado', 'tiver falado'], ['você / ele', 'tenha falado', 'tivesse falado', 'tiver falado'], ['nós', 'tenhamos falado', 'tivéssemos falado', 'tivermos falado'], ['vocês / eles', 'tenham falado', 'tivessem falado', 'tiverem falado']),
      p('On les utilise après les mêmes déclencheurs que le subjonctif simple (espero que, talvez, se, como se, quando…), mais pour une action **déjà accomplie**.'),
      ex('Espero que você tenha gostado do presente.', 'J’espère que le cadeau t’a plu.'),
    ],
    raw: `
Espero que você ___ da viagem. (gostar)|tenha gostado|tem gostado,tivesse gostado,gostasse|J'espère que le voyage t'a plu.
Talvez ela já ___. (sair)|tenha saído|tem saído,tinha saído,tiver saído|Elle est peut-être déjà partie.
Não acredito que eles ___ o jogo. (perder)|tenham perdido|têm perdido,tinham perdido,tiverem perdido|Je n'arrive pas à croire qu'ils aient perdu le match.
Se eu ___, teria vindo antes. (saber)|tivesse sabido|tenha sabido,tinha sabido,tiver sabido|Si j'avais su, je serais venu plus tôt.
Eu queria que você ___ à festa. (vir)|tivesse vindo|tenha vindo,tinha vindo,tiver vindo|J'aurais aimé que tu viennes à la fête.
Se nós ___ mais cedo, não teríamos perdido o trem. (sair)|tivéssemos saído|tenhamos saído,tínhamos saído,tivermos saído|Si nous étions partis plus tôt, nous n'aurions pas raté le train.
Quando você ___ o relatório, me mande. (terminar)|tiver terminado|tenha terminado,tivesse terminado,terá terminado|Quand tu auras fini le rapport, envoie-le-moi.
É possível que eu me ___. (enganar)|tenha enganado|tinha enganado,tivesse enganado,tenho enganado|Il est possible que je me sois trompé.
Ela fala como se ___ um fantasma. (ver)|tivesse visto|tenha visto,tinha visto,tiver visto|Elle parle comme si elle avait vu un fantôme.`,
  }),
  n({
    id: 'infinitivo-pessoal',
    cat: 'conjugaison',
    level: 'B1',
    title: 'L’infinitif personnel',
    ptTitle: 'Infinitivo pessoal',
    summary: 'Para nós sairmos, antes de eles chegarem : l’infinitif qui se conjugue.',
    lesson: [
      p('Spécialité du portugais : un **infinitif qui se conjugue** pour indiquer qui fait l’action. Il remplace souvent un « que + subjonctif » français.'),
      table(['', 'falar', 'fazer', 'ser'], ['eu', 'falar', 'fazer', 'ser'], ['você / ele / a gente', 'falar', 'fazer', 'ser'], ['nós', 'falar**mos**', 'fazer**mos**', 'ser**mos**'], ['vocês / eles', 'falar**em**', 'fazer**em**', 'ser**em**']),
      p('Il est **toujours régulier** : on ajoute **-mos** (nós) ou **-em** (eles) à l’infinitif.'),
      table(['après…', 'exemple'], ['para', 'Comprei pipoca para vocês **comerem**.'], ['antes de / depois de', 'Antes de eles **chegarem**, vamos jantar.'], ['sem', 'Saíram sem **pagarem**.'], ['é + adjectif', 'É melhor nós **sairmos** agora.']),
      tip('Quand le sujet est le même que celui du verbe principal, on garde l’infinitif simple : « Vou estudar para **passar** na prova ».'),
    ],
    raw: `
É melhor nós ___ agora. (sair)|sairmos|saímos,sair,saírem|Il vaut mieux que nous partions maintenant.
Comprei pipoca para vocês ___ durante o filme. (comer)|comerem|comer,comam,comermos|J'ai acheté du pop-corn pour que vous mangiez pendant le film.
Antes de eles ___, vamos jantar. (chegar)|chegarem|chegar,cheguem,chegam|Avant qu'ils arrivent, on va dîner.
Depois de nós ___ o trabalho, vamos à praia. (terminar)|terminarmos|terminamos,terminem,terminaram|Après avoir fini le travail, nous irons à la plage.
O professor pediu para os alunos ___ em silêncio. (ficar)|ficarem|ficar,fiquem,ficam|Le professeur a demandé aux élèves de rester en silence.
É importante vocês ___ a verdade. (saber)|saberem|saber,saibam,sabem|Il est important que vous sachiez la vérité.
Sem nós ___, eles não conseguem. (ajudar)|ajudarmos|ajudamos,ajudar,ajudemos|Sans notre aide, ils n'y arrivent pas.
Isso é para nós ___ juntos. (fazer)|fazermos|faremos,fazer,façamos|C'est pour que nous le fassions ensemble.
Eles saíram sem ___ tchau. (dizer)|dizerem|dizer,digam,disseram|Ils sont partis sans dire au revoir.`,
  }),

  // ---------------- Grammaire ----------------
  n({
    id: 'artigos',
    cat: 'grammaire',
    level: 'A1',
    title: 'Articles et genre des noms',
    ptTitle: 'Artigos e gênero',
    summary: 'O, a, um, uma… et les pièges de genre avec le français.',
    lesson: [
      table(['', 'masculin', 'féminin'], ['défini singulier', 'o', 'a'], ['défini pluriel', 'os', 'as'], ['indéfini singulier', 'um', 'uma'], ['indéfini pluriel', 'uns', 'umas']),
      p('En général, **-o** = masculin, **-a** = féminin. Les mots en **-ção, -dade, -gem** sont féminins : a canção, a cidade, a viagem.'),
      p('**Exceptions** fréquentes : **o** dia, **o** mapa, **o** problema, **o** sistema (mots grecs en -ma) ; **a** mão, **a** foto, **a** tribo.'),
      tip('Pièges avec le français : **o mar** (la mer), **a viagem** (le voyage), **o carro** (la voiture), **a árvore** (l’arbre), **a cor** (la couleur), **o leite** (le lait, comme en français).'),
      ex('O problema é que a viagem é longa.', 'Le problème, c’est que le voyage est long.'),
    ],
    raw: `
___ problema é sério.|O|A,Os,As|Le problème est grave.
Eu adoro ___ mar.|o|a,os,as|J'adore la mer.
___ viagem foi ótima.|A|O,Os,As|Le voyage était génial.
Ele comprou ___ carro novo.|um|uma,uns,umas|Il a acheté une nouvelle voiture.
Qual é ___ cor do seu carro?|a|o,os,as|Quelle est la couleur de ta voiture ?
___ cidade é linda.|A|O,Os,As|La ville est magnifique.
Tenho ___ dor de cabeça.|uma|um,uns,umas|J'ai mal à la tête.
___ mãos estão frias.|As|Os,A,O|Les mains sont froides.
Cadê ___ leite?|o|a,os,as|Où est le lait ?
___ árvore do jardim é enorme.|A|O,Os,As|L'arbre du jardin est énorme.
___ sistema não funciona.|O|A,Os,As|Le système ne fonctionne pas.`,
  }),
  n({
    id: 'plural',
    cat: 'grammaire',
    level: 'A1',
    title: 'Le pluriel',
    ptTitle: 'Plural',
    summary: 'Pães, hotéis, flores, aviões : les règles du pluriel.',
    lesson: [
      p('Règle générale : on ajoute **-s** (casa → casas). Les adjectifs s’accordent aussi.'),
      table(['terminaison', 'pluriel', 'exemples'], ['-r, -z, -s (accentué)', '+ es', 'flor → flores, luz → luzes, mês → meses'], ['-l', '-is', 'animal → animais, hotel → hotéis, azul → azuis'], ['-il (non accentué)', '-eis', 'fácil → fáceis'], ['-m', '-ns', 'homem → homens, jovem → jovens'], ['-ão', '-ões (le plus fréquent)', 'avião → aviões, estação → estações'], ['-ão', '-ães / -ãos (à apprendre)', 'pão → pães, cão → cães, mão → mãos, irmão → irmãos']),
      ex('Os hotéis do centro são caros.', 'Les hôtels du centre sont chers.'),
    ],
    raw: `
Dois ___, por favor. (pão)|pães|pãos,pões,pãoes|Deux pains, s'il vous plaît.
Os ___ estão cheios. (hotel)|hotéis|hotels,hoteles,hotéus|Les hôtels sont complets.
Ela tem três ___. (irmão)|irmãos|irmões,irmães,irmãoes|Elle a trois frères.
As ___ são lindas. (flor)|flores|flors,floris,flôres|Les fleurs sont belles.
Muitos ___ chegam aqui. (avião)|aviões|aviãos,aviães,aviãoes|Beaucoup d'avions arrivent ici.
Os ___ do zoológico. (animal)|animais|animals,animales,animaus|Les animaux du zoo.
Dois ___ entraram. (homem)|homens|homems,homemes,homes|Deux hommes sont entrés.
Esses exercícios são ___. (fácil)|fáceis|fácils,fáciles,fácies|Ces exercices sont faciles.
Eu tenho dois ___ de férias. (mês)|meses|mêss,mêses,mes|J'ai deux mois de vacances.
Os carros ___ são nossos. (azul)|azuis|azuls,azules,azul|Les voitures bleues sont à nous.
As ___ estão sujas. (mão)|mãos|mães,mões,mãoes|Les mains sont sales.`,
  }),
  n({
    id: 'contracoes',
    cat: 'grammaire',
    level: 'A1',
    title: 'Les contractions',
    ptTitle: 'Contrações: no, na, do, da…',
    summary: 'Em + o = no, de + a = da, a + o = ao…',
    lesson: [
      p('Les prépositions **em, de, a, por** fusionnent avec l’article qui suit.'),
      table(['', '+ o', '+ a', '+ os', '+ as'], ['em', 'no', 'na', 'nos', 'nas'], ['de', 'do', 'da', 'dos', 'das'], ['a', 'ao', 'à', 'aos', 'às'], ['por', 'pelo', 'pela', 'pelos', 'pelas']),
      p('Aussi avec les pronoms : de + ele = **dele**, em + esse = **nesse**, em + um = **num**.'),
      tip('Certaines villes prennent l’article : **o Rio** → « moro **no** Rio » ; d’autres non : « moro **em** São Paulo ». Les pays aussi : **o Brasil** → no Brasil, **a França** → na França.'),
      ex('Ela é da França e mora no Brasil.', 'Elle est de France et habite au Brésil.'),
    ],
    raw: `
Eu moro ___ Brasil. (em + o)|no|na,em o,do|J'habite au Brésil.
Ela é ___ França. (de + a)|da|do,de a,na|Elle est de France.
Vamos ___ praia? (a + a)|à|ao,na,da|On va à la plage ?
O livro está ___ mesa. (em + a)|na|no,da,em a|Le livre est sur la table.
Esse é o carro ___ meu pai. (de + o)|do|da,de o,no|C'est la voiture de mon père.
Obrigado ___ ajuda! (por + a)|pela|pelo,para a,da|Merci pour l'aide !
Fui ___ cinema ontem. (a + o)|ao|à,no,do|Je suis allé au cinéma hier.
Ela mora ___ Rio de Janeiro.|no|na,em,do|Elle habite à Rio de Janeiro.
Vou passar ___ centro. (por + o)|pelo|pela,no,por o|Je vais passer par le centre.
Essa casa é ___. (de + ela)|dela|de ela,da,dele|Cette maison est à elle.`,
  }),
  n({
    id: 'possessivos',
    cat: 'grammaire',
    level: 'A1',
    title: 'Les possessifs',
    ptTitle: 'Possessivos',
    summary: 'Meu, minha, seu, dele, nosso…',
    lesson: [
      p('Le possessif s’accorde avec l’**objet possédé** (comme en français).'),
      table(['', 'masc. sing.', 'fém. sing.', 'masc. plur.', 'fém. plur.'], ['mon / ma', 'meu', 'minha', 'meus', 'minhas'], ['ton / votre (você)', 'seu', 'sua', 'seus', 'suas'], ['notre', 'nosso', 'nossa', 'nossos', 'nossas']),
      p('Pour « son / sa / leur », le Brésil préfère **dele / dela / deles / delas** placé **après** le nom, car « seu » est réservé à « você ».'),
      ex('O carro dele é azul, o carro dela é vermelho.', 'Sa voiture (à lui) est bleue, sa voiture (à elle) est rouge.'),
      tip('L’article devant le possessif est facultatif au Brésil : « meu carro » = « o meu carro ».'),
    ],
    raw: `
Essa é ___ irmã. (ma)|minha|meu,minhas,meus|C'est ma sœur.
___ pais moram no Rio. (mes)|Meus|Minhas,Meu,Minha|Mes parents habitent à Rio.
Qual é o ___ nome? (ton)|seu|sua,seus,dele|Quel est ton nom ?
A casa ___ é grande. (sa, à lui)|dele|dela,seu,sua|Sa maison (à lui) est grande.
O carro ___ é novo. (sa, à elle)|dela|dele,sua,seu|Sa voiture (à elle) est neuve.
___ casa é sua casa! (ma)|Minha|Meu,Minhas,Meus|Ma maison est ta maison !
___ amigos chegaram. (nos)|Nossos|Nossas,Nosso,Nossa|Nos amis sont arrivés.
Onde estão ___ chaves? (tes)|suas|seus,sua,seu|Où sont tes clés ?
Essas são as ___ fotos. (nos)|nossas|nossos,nossa,nosso|Ce sont nos photos.
A mãe ___ é professora. (leur, à eux)|deles|delas,seus,dele|Leur mère est professeure.`,
  }),
  n({
    id: 'demonstrativos',
    cat: 'grammaire',
    level: 'A1',
    title: 'Les démonstratifs',
    ptTitle: 'Demonstrativos',
    summary: 'Esse, essa, isso, aquele…',
    lesson: [
      p('À l’oral brésilien, on utilise surtout **esse / essa** (ce, cette, près de nous) et **aquele / aquela** (celui-là, loin). **Este / esta** existent mais sont plus formels.'),
      table(['', 'masc.', 'fém.', 'neutre'], ['près', 'esse / esses', 'essa / essas', 'isso'], ['loin', 'aquele / aqueles', 'aquela / aquelas', 'aquilo']),
      p('Le **neutre** (isso, aquilo) désigne une chose non nommée : « O que é isso? ».'),
      p('Contractions : em + esse = **nesse**, de + isso = **disso**, de + aquela = **daquela**.'),
      ex('Essa praia é linda, mas aquela é melhor.', 'Cette plage est belle, mais celle-là est mieux.'),
    ],
    raw: `
___ livro aqui é ótimo.|Esse/Este|Aquele,Essa,Isso|Ce livre-ci est super.
O que é ___? (ça, près de toi)|isso|esse,essa,aquele|Qu'est-ce que c'est, ça ?
Você vê ___ casa lá longe?|aquela|essa,aquele,aquilo|Tu vois cette maison là-bas ?
___ meninas são minhas primas.|Essas|Esses,Essa,Isso|Ces filles sont mes cousines.
Eu moro ___ prédio. (em + esse)|nesse|desse,em esse,nessa|J'habite dans cet immeuble.
___ é o meu irmão, ali no fundo.|Aquele|Aquela,Isso,Aquilo|Celui-là, au fond, c'est mon frère.
Não gosto ___. (de + isso)|disso|de isso,nisso,desso|Je n'aime pas ça.
Lembra ___ viagem para a Bahia em 2010? (de + aquela)|daquela|dessa,naquela,aquela|Tu te souviens de ce voyage à Bahia en 2010 ?
Quanto custa ___ aí?|isso|esso,essa,aquele|Combien coûte ça, là ?
___ pessoas são simpáticas.|Essas|Esses,Essa,Isso|Ces personnes sont sympathiques.`,
  }),
  n({
    id: 'pronomes',
    cat: 'grammaire',
    level: 'A2',
    title: 'Les pronoms personnels',
    ptTitle: 'Pronomes',
    summary: 'Você, a gente, te, me, comigo… le système brésilien.',
    lesson: [
      table(['sujet', 'complément (oral BR)', 'après préposition', 'avec'], ['eu', 'me', 'mim', 'comigo'], ['você', 'te / você', 'você', 'com você'], ['ele / ela', 'ele / ela (o / a à l’écrit)', 'ele / ela', 'com ele'], ['a gente / nós', 'a gente / nos', 'a gente / nós', 'com a gente / conosco'], ['vocês', 'vocês', 'vocês', 'com vocês'], ['eles / elas', 'eles / elas', 'eles / elas', 'com eles']),
      p('Au Brésil, le pronom complément se place souvent **avant le verbe**, même en début de phrase : « **Me** dá um café? », « Eu **te** amo ».'),
      p('À l’oral, on utilise **ele / ela** comme complément : « Eu vi **ele** ontem » (à l’écrit : « Eu **o** vi »).'),
      tip('Après une préposition, « eu » devient **mim** : para mim, de mim, sem mim. Mais **comigo** avec « com ».'),
    ],
    raw: `
___ vai ao cinema hoje. (on)|A gente|Nós,Vocês,Eles|On va au cinéma ce soir.
Eu ___ amo! (je t'aime)|te|você,ti,mim|Je t'aime !
Você vem ___? (avec moi)|comigo|com mim,com eu,mim|Tu viens avec moi ?
Ela ___ ligou ontem? (t')|te|ti,tu,mim|Elle t'a appelé hier ?
Esse presente é para ___. (moi)|mim|eu,me,comigo|Ce cadeau est pour moi.
___ dá uma água, por favor? (donne-moi)|Me|Mim,Eu,Te|Tu me donnes de l'eau, s'il te plaît ?
Eu vi ___ na festa. (lui, oral)|ele/o|lhe,dele,mim|Je l'ai vu à la fête.
Quer sair com ___? (nous)|a gente/conosco|nós,nos,mim|Tu veux sortir avec nous ?
___ são de onde? (vous)|Vocês|Você,Vós,Vos|Vous êtes d'où ?
Ele sempre fala ___. (de moi)|de mim|de eu,me,comigo|Il parle toujours de moi.`,
  }),
  n({
    id: 'negacao-perguntas',
    cat: 'grammaire',
    level: 'A1',
    title: 'Négation et questions',
    ptTitle: 'Negação e perguntas',
    summary: 'Não, nada, ninguém, nunca, né ? et les mots interrogatifs.',
    lesson: [
      p('La négation se place **avant le verbe** : « Eu **não** falo alemão ». Avec nada, ninguém, nunca, on garde **não** : « Não vi **ninguém** » (double négation).'),
      table(['mot', 'sens'], ['o que', 'que, quoi'], ['quem', 'qui'], ['onde', 'où'], ['quando', 'quand'], ['como', 'comment'], ['por que', 'pourquoi'], ['porque', 'parce que'], ['quanto / quanta', 'combien'], ['qual', 'quel / lequel']),
      tip('**Por que** (pourquoi) s’écrit en deux mots, **porque** (parce que) en un seul. **né?** (= não é?) se met à la fin pour demander confirmation.'),
      ex('Por que você não veio? — Porque estava doente.', 'Pourquoi tu n’es pas venu ? — Parce que j’étais malade.'),
    ],
    raw: `
Eu ___ falo alemão.|não|nem,no,non|Je ne parle pas allemand.
___ você mora? — Em Lisboa.|Onde|Quando,Quem,Como|Où habites-tu ? — À Lisbonne.
___ você está triste? — Porque perdi o ônibus.|Por que|Porque,Quanto,Qual|Pourquoi es-tu triste ? — Parce que j'ai raté le bus.
Eu não vi ___. (personne)|ninguém|nada,nenhum,alguém|Je n'ai vu personne.
Ela não comeu ___. (rien)|nada|ninguém,nunca,algo|Elle n'a rien mangé.
___ custa esse sapato?|Quanto|Quantos,Qual,Como|Combien coûte cette chaussure ?
___ é o seu telefone?|Qual|Que,Quanto,Quem|Quel est ton numéro de téléphone ?
Eu ___ fui ao Japão. (jamais)|nunca|nada,ninguém,nenhum|Je ne suis jamais allé au Japon.
Está calor hoje, ___? (n'est-ce pas)|né/não é|nem,ne,num|Il fait chaud aujourd'hui, hein ?
___ chega o trem?|Quando|Quanto,Onde,Quem|Quand arrive le train ?`,
  }),
  n({
    id: 'preposicoes',
    cat: 'grammaire',
    level: 'A2',
    title: 'Les prépositions',
    ptTitle: 'Preposições',
    summary: 'Em, para, de, por, a, até : lieux, temps, transports.',
    lesson: [
      table(['usage', 'préposition', 'exemple'], ['lieu où l’on est', 'em', 'Estou em casa / no Rio'], ['destination', 'para (pra) / a', 'Vou para o Rio'], ['origine, matière', 'de', 'Sou de Lyon, mesa de madeira'], ['transport', 'de', 'de carro, de ônibus (mais **a pé**)'], ['heure', 'a (às)', 'às oito horas'], ['mois, année', 'em', 'em março, em 2025'], ['jour', 'em (no / na)', 'no domingo, na segunda'], ['moment de la journée', 'de', 'de manhã, de noite'], ['cause, échange', 'por', 'obrigado por tudo'], ['jusqu’à', 'até', 'até sexta']),
      ex('Vou de ônibus para o trabalho às oito.', 'Je vais au travail en bus à huit heures.'),
      tip('**Para** indique un but ou un destinataire (para você), **por** une cause, un échange ou un passage (pela praia).'),
    ],
    raw: `
Eu vou ___ ônibus.|de|em,com,por|J'y vais en bus.
Ela chega ___ três horas.|às|as,nas,em|Elle arrive à trois heures.
Vamos ___ o Rio amanhã.|para|em,de,por|Nous allons à Rio demain.
Meu aniversário é ___ março.|em|no,de,a|Mon anniversaire est en mars.
Eu trabalho ___ segunda a sexta.|de|em,por,desde|Je travaille du lundi au vendredi.
Vou ___ pé.|a|de,em,com|J'y vais à pied.
Obrigado ___ tudo!|por|para,de,com|Merci pour tout !
Ele chega amanhã ___ manhã.|de|em,a,para|Il arrive demain matin.
Esse presente é ___ você.|para|por,de,a|Ce cadeau est pour toi.
Vou ficar aqui ___ sexta-feira.|até|para,em,desde|Je vais rester ici jusqu'à vendredi.`,
  }),
  n({
    id: 'comparativos',
    cat: 'grammaire',
    level: 'A2',
    title: 'Comparatifs et superlatifs',
    ptTitle: 'Comparativos',
    summary: 'Mais… do que, melhor, maior, -íssimo.',
    lesson: [
      table(['', 'structure', 'exemple'], ['supériorité', 'mais + adj + (do) que', 'mais alto do que eu'], ['infériorité', 'menos + adj + (do) que', 'menos caro que'], ['égalité', 'tão + adj + quanto', 'tão bom quanto'], ['superlatif', 'o mais / o menos + adj', 'o mais bonito'], ['absolu', 'adj + -íssimo', 'lindíssimo, caríssimo']),
      p('Irréguliers : **bom → melhor**, **ruim / mau → pior**, **grande → maior**, **pequeno → menor**.'),
      tip('Attention : **mais** (plus) ≠ **mas** (mais). Et on ne dit jamais « mais bom » ni « mais grande » : **melhor**, **maior**.'),
      ex('O Rio é maior do que Salvador, mas Salvador é mais antiga.', 'Rio est plus grande que Salvador, mais Salvador est plus ancienne.'),
    ],
    raw: `
O Rio é ___ quente do que Curitiba.|mais|muito,mas,tão|Rio est plus chaud que Curitiba.
Esse restaurante é ___ do que aquele. (meilleur)|melhor|mais bom,maior,mais melhor|Ce restaurant est meilleur que celui-là.
Minha casa é ___ do que a sua. (plus grande)|maior|mais grande,melhor,menor|Ma maison est plus grande que la tienne.
Ela é tão alta ___ o irmão.|quanto/como|do que,de,mais|Elle est aussi grande que son frère.
Hoje está ___ frio do que ontem. (moins)|menos|mais pouco,menor,pior|Aujourd'hui il fait moins froid qu'hier.
Essa praia é ___! (super belle, -íssimo)|lindíssima|lindissíma,mais linda,linda demais|Cette plage est super belle !
O trânsito hoje está ___ do que ontem. (pire)|pior|mais ruim,piorr,menor|La circulation est pire qu'hier.
Ele é o ___ jogador do time. (le meilleur)|melhor|mais bom,maior,bom|C'est le meilleur joueur de l'équipe.
Meu irmão é ___ do que eu. (plus petit)|menor|mais pequeno,pior,menos|Mon frère est plus petit que moi.
São Paulo é a cidade ___ populosa do Brasil.|mais|maior,muito,melhor|São Paulo est la ville la plus peuplée du Brésil.`,
  }),
  n({
    id: 'ter-haver',
    cat: 'grammaire',
    level: 'A2',
    title: '« Il y a » : ter et haver',
    ptTitle: 'Ter x Haver',
    summary: 'Tem um mercado aqui ? Moro aqui há dois anos.',
    lesson: [
      p('Pour dire **« il y a »** (existence), le Brésil utilise **tem** à l’oral et **há** à l’écrit ou en registre soutenu. Le verbe reste **au singulier**.'),
      ex('Tem muita gente na praia. / Há muitas pessoas na praia.', 'Il y a beaucoup de monde à la plage.'),
      p('Au passé : **teve** (oral) / **houve** (écrit) pour un événement ; **tinha** / **havia** pour une description.'),
      p('Pour la durée (« il y a deux ans », « depuis deux ans ») on utilise **há** ou **faz** : « Moro aqui **há** dois anos ».'),
      tip('Ne confondez pas **há** (verbe haver) et **à** (a + a) : « Vou **à** praia » ≠ « **Há** uma praia ».'),
    ],
    raw: `
___ um mercado perto daqui? (il y a, oral)|Tem|Têm,É,Está|Il y a un supermarché près d'ici ?
Não ___ ninguém em casa. (oral)|tem|têm,é,está|Il n'y a personne à la maison.
Moro no Brasil ___ três anos. (depuis)|há/faz|à,desde,em|J'habite au Brésil depuis trois ans.
___ muitas pessoas na praia hoje. (écrit)|Há|Têm,São,Hão|Il y a beaucoup de monde à la plage aujourd'hui.
Eu ___ uma reunião às dez. (avoir)|tenho|há,tem,hei|J'ai une réunion à dix heures.
___ quanto tempo você estuda português?|Há|À,A,Desde|Depuis combien de temps tu étudies le portugais ?
Não ___ problema! (oral)|tem/há|é,está,ter|Pas de problème !
Ontem ___ uma festa na casa do Pedro. (oral, passé)|teve/houve|tem,teria,têve|Hier il y a eu une fête chez Pedro.
Ela ___ dois filhos. (avoir)|tem|há,têm,é|Elle a deux enfants.
Eles ___ um carro novo. (avoir)|têm|há,hão,temos|Ils ont une nouvelle voiture.`,
  }),
]

export const notionById = (id: string) => notions.find((x) => x.id === id)

/** Regroupement des notions de conjugaison par temps. */
export interface Tense {
  id: string
  title: string
  ptTitle: string
  emoji: string
  summary: string
  notions: string[]
}

export const tenses: Tense[] = [
  { id: 'present', title: 'Présent', ptTitle: 'Presente', emoji: '🕐', summary: 'Verbes réguliers et irréguliers, ser / estar, action en cours', notions: ['presente-regulares', 'ser-estar', 'presente-irregulares', 'gerundio'] },
  { id: 'passe', title: 'Passé', ptTitle: 'Passado', emoji: '⏪', summary: 'Prétérit, imparfait, participe, « passé composé » portugais et plus-que-parfait', notions: ['preterito-regulares', 'preterito-irregulares', 'imperfeito', 'participio', 'preterito-composto', 'mais-que-perfeito'] },
  { id: 'futur', title: 'Futur', ptTitle: 'Futuro', emoji: '⏩', summary: 'Futur proche, futur simple et futur antérieur', notions: ['futuro-proximo', 'futuro-simples', 'futuro-anterior'] },
  { id: 'conditionnel', title: 'Conditionnel', ptTitle: 'Futuro do pretérito', emoji: '🤔', summary: 'Politesse, souhaits, hypothèses et ce qui aurait pu arriver', notions: ['condicional', 'condicional-passado'] },
  { id: 'subjonctif', title: 'Subjonctif', ptTitle: 'Subjuntivo', emoji: '💭', summary: 'Il faut que tu manges, j’aimerais que tu sois, si tu veux, si j’avais su…', notions: ['subjuntivo-presente', 'subjuntivo-imperfeito', 'subjuntivo-futuro', 'subjuntivo-composto'] },
  { id: 'imperatif', title: 'Impératif & infinitif personnel', ptTitle: 'Imperativo e infinitivo pessoal', emoji: '📢', summary: 'Donner un ordre, et l’infinitif conjugué propre au portugais', notions: ['imperativo', 'infinitivo-pessoal'] },
]

export const tenseOf = (notionId: string) => tenses.find((t) => t.notions.includes(notionId))
export const allExercises: Exercise[] = notions.flatMap((x) => x.exercises)
export const exerciseById = (id: string) => allExercises.find((e) => e.id === id)
