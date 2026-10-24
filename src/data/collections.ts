/**
 * Collections de fiches thématiques (verbes, adverbes, expressions, adjectifs).
 * Format : pt | fr | exemple pt | exemple fr | note (facultative)
 */
import type { StudyItem } from './types'

export interface Collection {
  id: string
  title: string
  emoji: string
  cat: string
  items: StudyItem[]
  /** Fiches regroupées sous une seule carte (ex. les 4 fiches des 100 verbes). */
  group?: string
}

export interface CollectionGroup {
  id: string
  title: string
  emoji: string
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function parse(prefix: string, cat: string, raw: string): StudyItem[] {
  return raw
    .trim()
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => {
      const [pt, fr, ex, exFr, note] = l.trim().split('|')
      return { id: `${prefix}-${slug(pt)}`, pt, fr, ex, exFr, note: note || undefined, cat }
    })
}

const VERBS = [
  `
ser|être (permanent)|Quero ser professor no futuro.|Je veux être professeur plus tard.|eu sou · você é · nós somos · eles são
estar|être (état, lieu)|Preciso estar lá às oito.|Je dois être là-bas à huit heures.|eu estou · você está · nós estamos · eles estão
ter|avoir|Quero ter um cachorro.|Je veux avoir un chien.|eu tenho · você tem · nós temos · eles têm
ir|aller|Preciso ir ao banco.|Je dois aller à la banque.|eu vou · você vai · nós vamos · eles vão
fazer|faire|O que você vai fazer hoje?|Qu'est-ce que tu vas faire aujourd'hui ?|eu faço · você faz · passé : eu fiz
poder|pouvoir|Você pode me ajudar?|Tu peux m'aider ?|eu posso · você pode
dizer|dire|Não sei o que dizer.|Je ne sais pas quoi dire.|eu digo · você diz · passé : eu disse
falar|parler|Você fala português?|Tu parles portugais ?
dar|donner|Vou dar um presente para ela.|Je vais lui offrir un cadeau.|eu dou · você dá · passé : eu dei
ver|voir|Quero ver o mar.|Je veux voir la mer.|eu vejo · você vê · passé : eu vi
saber|savoir|Você sabe nadar?|Tu sais nager ?|eu sei · você sabe
querer|vouloir|Quero um café, por favor.|Je voudrais un café, s'il vous plaît.|eu quero · você quer
ficar|rester, devenir, se trouver|Vou ficar em casa hoje.|Je vais rester à la maison aujourd'hui.|Verbe à tout faire : ficar feliz (devenir heureux), onde fica? (où se trouve ?)
vir|venir|Você pode vir amanhã?|Tu peux venir demain ?|eu venho · você vem · passé : eu vim
achar|trouver, penser|Acho que vai chover.|Je pense qu'il va pleuvoir.|« Achar » = trouver un objet ou donner son avis.
passar|passer|Vou passar na sua casa mais tarde.|Je vais passer chez toi plus tard.
dever|devoir|Você deve descansar.|Tu dois te reposer.
pegar|prendre, attraper|Vou pegar um táxi.|Je vais prendre un taxi.|passé : eu peguei
deixar|laisser|Pode deixar a mala aqui.|Tu peux laisser la valise ici.
chegar|arriver|Que horas você vai chegar?|À quelle heure tu vas arriver ?|passé : eu cheguei
conhecer|connaître (personne, lieu)|Quero conhecer o Nordeste.|Je veux découvrir le Nordeste.|eu conheço
pensar|penser|Preciso pensar um pouco.|J'ai besoin de réfléchir un peu.
sair|sortir, partir|Vamos sair hoje à noite?|On sort ce soir ?|eu saio · você sai
gostar|aimer (bien)|Eu gosto de praia.|J'aime la plage.|Toujours suivi de « de » : gostar de alguma coisa.
precisar|avoir besoin de|Preciso de ajuda.|J'ai besoin d'aide.|Precisar de + nom ; precisar + infinitif.
`,
  `
voltar|revenir, rentrer|Vou voltar às seis.|Je vais rentrer à six heures.
começar|commencer|A aula vai começar.|Le cours va commencer.|passé : eu comecei
conseguir|réussir à, arriver à|Calma, você vai conseguir!|Calme-toi, tu vas y arriver !|eu consigo · você consegue
trabalhar|travailler|Preciso trabalhar amanhã.|Je dois travailler demain.
levar|emporter, emmener|Vou levar um vinho.|Je vais apporter un vin.|« Levar » = vers là-bas ; « trazer » = vers ici.
colocar|mettre, poser|Pode colocar a bolsa aqui.|Tu peux poser le sac ici.
encontrar|trouver, retrouver|Vamos nos encontrar na praça.|On se retrouve sur la place.
chamar|appeler|Vou chamar um Uber.|Je vais appeler un Uber.|se chamar = s'appeler
acontecer|arriver, se passer|O que vai acontecer agora?|Qu'est-ce qui va se passer maintenant ?|O que aconteceu? = Qu'est-ce qui s'est passé ?
entender|comprendre|Não consigo entender.|Je n'arrive pas à comprendre.
morar|habiter|Quero morar no Rio.|Je veux habiter à Rio.
tomar|prendre (boire, douche…)|Vamos tomar um café?|On prend un café ?|tomar banho, tomar sol, tomar remédio
perguntar|demander (question)|Posso perguntar uma coisa?|Je peux te demander quelque chose ?
ouvir|entendre, écouter|Gosto de ouvir música.|J'aime écouter de la musique.|eu ouço · você ouve
esperar|attendre, espérer|Pode esperar um minuto?|Tu peux attendre une minute ?
acreditar|croire|Não consigo acreditar!|Je n'arrive pas à y croire !
lembrar|se souvenir, rappeler|Não consigo lembrar o nome dele.|Je n'arrive pas à me souvenir de son nom.
esquecer|oublier|Não pode esquecer o passaporte!|Il ne faut pas oublier le passeport !
olhar|regarder|Olha que lindo!|Regarde comme c'est beau !
comer|manger|Vamos comer fora?|On mange dehors ?
beber|boire|Preciso beber mais água.|Je dois boire plus d'eau.
dormir|dormir|Quero dormir cedo hoje.|Je veux me coucher tôt ce soir.|eu durmo · você dorme
acordar|se réveiller|Preciso acordar às seis.|Je dois me réveiller à six heures.
abrir|ouvrir|Pode abrir a janela?|Tu peux ouvrir la fenêtre ?
fechar|fermer|Não esquece de fechar a porta.|N'oublie pas de fermer la porte.
`,
  `
comprar|acheter|Quero comprar um presente.|Je veux acheter un cadeau.
pagar|payer|Posso pagar com cartão?|Je peux payer par carte ?|passé : eu paguei
vender|vendre|Eles querem vender o carro.|Ils veulent vendre la voiture.
usar|utiliser, porter|Posso usar seu carregador?|Je peux utiliser ton chargeur ?
ajudar|aider|Posso ajudar?|Je peux aider ?
mostrar|montrer|Vou mostrar a cidade para você.|Je vais te faire visiter la ville.
perder|perdre, rater|Não quero perder o ônibus.|Je ne veux pas rater le bus.|eu perco · você perde
ganhar|gagner, recevoir|Quero ganhar mais dinheiro.|Je veux gagner plus d'argent.|ganhar um presente = recevoir un cadeau
jogar|jouer (sport), jeter|Vamos jogar futebol?|On joue au foot ?|jogar fora = jeter
ler|lire|Gosto de ler antes de dormir.|J'aime lire avant de dormir.|eu leio · você lê
escrever|écrire|Preciso escrever um e-mail.|Je dois écrire un e-mail.
estudar|étudier|Vou estudar português hoje.|Je vais étudier le portugais aujourd'hui.
aprender|apprendre|Quero aprender a surfar.|Je veux apprendre à surfer.
ensinar|enseigner|Você pode me ensinar?|Tu peux m'apprendre ?
entrar|entrer|Pode entrar!|Tu peux entrer !
ligar|appeler (téléphone), allumer|Vou ligar para minha mãe.|Je vais appeler ma mère.|ligar a TV = allumer la télé
mudar|changer, déménager|Quero mudar de emprego.|Je veux changer de travail.|se mudar = déménager
tentar|essayer|Vou tentar de novo.|Je vais réessayer.
terminar|finir, terminer|Preciso terminar o relatório.|Je dois finir le rapport.|terminar com alguém = rompre
acabar|finir, venir de|Acabei de chegar.|Je viens d'arriver.|acabar de + infinitif = venir de
continuar|continuer|Vamos continuar amanhã.|On continue demain.
parar|arrêter|Preciso parar de fumar.|Je dois arrêter de fumer.
correr|courir|Gosto de correr na praia.|J'aime courir sur la plage.
andar|marcher, aller|Vamos andar um pouco?|On marche un peu ?|andar de bicicleta = faire du vélo
sentar|s'asseoir|Pode sentar aqui.|Tu peux t'asseoir ici.
`,
  `
trazer|apporter|Pode trazer a conta?|Vous pouvez apporter l'addition ?|eu trago · passé : eu trouxe
mandar|envoyer, ordonner|Vou mandar uma mensagem.|Je vais envoyer un message.
receber|recevoir|Vou receber amigos em casa.|Je vais recevoir des amis à la maison.
responder|répondre|Preciso responder esse e-mail.|Je dois répondre à cet e-mail.
explicar|expliquer|Pode explicar de novo?|Tu peux réexpliquer ?
contar|raconter, compter|Vou contar uma história.|Je vais raconter une histoire.|contar com = compter sur
gastar|dépenser|Não quero gastar muito.|Je ne veux pas trop dépenser.
procurar|chercher|Estou procurando um apartamento.|Je cherche un appartement.
escolher|choisir|Difícil escolher!|Difficile de choisir !
decidir|décider|Preciso decidir hoje.|Je dois décider aujourd'hui.
sentir|sentir, ressentir|Vou sentir sua falta.|Tu vas me manquer.|eu sinto · sentir falta = regretter l'absence
amar|aimer (amour)|Vou amar você para sempre.|Je t'aimerai pour toujours.|Eu te amo = je t'aime
cair|tomber|Cuidado para não cair!|Attention à ne pas tomber !|eu caio · você cai
subir|monter|Vamos subir o morro?|On monte la colline ?
descer|descendre|Vou descer no próximo ponto.|Je descends au prochain arrêt.|eu desço
viajar|voyager|Quero viajar pelo Brasil.|Je veux voyager à travers le Brésil.
cozinhar|cuisiner|Adoro cozinhar para os amigos.|J'adore cuisiner pour mes amis.
limpar|nettoyer|Preciso limpar a casa.|Je dois nettoyer la maison.
lavar|laver|Vou lavar a louça.|Je vais faire la vaisselle.
assistir|regarder (film, match)|Vamos assistir um filme?|On regarde un film ?|Au Brésil : assistir um filme / uma série.
chorar|pleurer|Esse filme me fez chorar.|Ce film m'a fait pleurer.
rir|rire|Não consigo parar de rir!|Je n'arrive pas à m'arrêter de rire !|eu rio · você ri
cuidar|prendre soin de, s'occuper de|Preciso cuidar das crianças.|Je dois m'occuper des enfants.|Toujours avec « de » : cuidar de.
preparar|préparer|Vou preparar o jantar.|Je vais préparer le dîner.
pedir|demander, commander|Vamos pedir uma pizza?|On commande une pizza ?|eu peço · pedir ≠ perguntar (poser une question)
`,
]

const ADVERBS = `
sempre|toujours|Ele sempre chega atrasado.|Il arrive toujours en retard.
nunca|jamais|Nunca fui ao Japão.|Je ne suis jamais allé au Japon.
às vezes|parfois|Às vezes eu cozinho.|Parfois je cuisine.
geralmente|généralement|Geralmente almoço ao meio-dia.|Généralement je déjeune à midi.
já|déjà, tout de suite|Você já comeu?|Tu as déjà mangé ?|« Já volto » = je reviens tout de suite.
ainda|encore, toujours|Ainda estou no trabalho.|Je suis encore au travail.|ainda não = pas encore
agora|maintenant|Agora não posso.|Maintenant je ne peux pas.
logo|bientôt, tout de suite|Até logo!|À bientôt !
depois|après, ensuite|A gente conversa depois.|On en parle après.
antes|avant|Lava as mãos antes de comer.|Lave-toi les mains avant de manger.
cedo|tôt|Acordei cedo hoje.|Je me suis réveillé tôt aujourd'hui.
tarde|tard|Já está tarde.|Il est déjà tard.
aqui|ici|Estou aqui!|Je suis ici !
lá|là-bas|Lá é muito bonito.|Là-bas, c'est très beau.
perto|près|O mercado fica perto.|Le supermarché est tout près.
longe|loin|Minha casa é longe.|Ma maison est loin.
muito|très, beaucoup|Gostei muito!|J'ai beaucoup aimé !
pouco|peu|Falo um pouco de português.|Je parle un peu portugais.
demais|trop, génial|Comi demais!|J'ai trop mangé !|« Foi demais! » = c'était génial !
bastante|beaucoup, pas mal|Estudei bastante ontem.|J'ai pas mal étudié hier.
bem|bien|Tudo bem?|Ça va ?
mal|mal|Dormi mal esta noite.|J'ai mal dormi cette nuit.
devagar|lentement|Fala mais devagar, por favor.|Parle plus lentement, s'il te plaît.
rápido|vite|Vem rápido!|Viens vite !
também|aussi|Eu também!|Moi aussi !
só|seulement, juste|Só um minuto.|Juste une minute.
quase|presque|Quase perdi o voo.|J'ai failli rater mon vol.
talvez|peut-être|Talvez amanhã.|Peut-être demain.
de repente|soudain|De repente começou a chover.|Soudain il s'est mis à pleuvoir.
finalmente|enfin|Finalmente chegamos!|Enfin, on est arrivés !
`

const IDIOMS = `
pagar mico|se taper la honte|Não quero pagar mico na frente de todo mundo.|Je ne veux pas me taper la honte devant tout le monde.
pisar na bola|faire une gaffe, décevoir|Não quero pisar na bola com você.|Je ne veux pas te décevoir.
enfiar o pé na jaca|faire des excès, se lâcher|Hoje vou enfiar o pé na jaca no churrasco!|Aujourd'hui je vais me lâcher au barbecue !
encher linguiça|faire du remplissage, blablater|Ele só sabe encher linguiça nas reuniões.|Il ne sait que faire du remplissage en réunion.
dar um jeito|trouver une solution, se débrouiller|Calma, a gente vai dar um jeito.|Calme-toi, on va trouver une solution.
quebrar o galho|dépanner|Você pode quebrar o galho e me emprestar dez reais?|Tu peux me dépanner et me prêter dix reais ?
ficar de molho|rester au repos (malade)|Estou gripado, vou ficar de molho hoje.|J'ai la grippe, je vais rester au lit aujourd'hui.
chutar o balde|tout envoyer balader|Cansei de tudo, vou chutar o balde!|J'en ai marre de tout, je vais tout envoyer balader !
cair a ficha|réaliser, piger enfin|Vai demorar para cair a ficha.|Ça va prendre du temps pour réaliser.|Au passé : « caiu a ficha! » = j'ai enfin compris !
dar uma mão|donner un coup de main|Você pode me dar uma mão com a mudança?|Tu peux me donner un coup de main pour le déménagement ?
custar os olhos da cara|coûter les yeux de la tête|Esse celular vai custar os olhos da cara.|Ce portable va coûter les yeux de la tête.
matar a saudade|se retrouver après une longue absence|Vou ao Brasil matar a saudade da família.|Je vais au Brésil pour retrouver ma famille qui me manque.
ser pão-duro|être radin|Não precisa ser pão-duro, paga um café!|Pas besoin d'être radin, offre-moi un café !
falar pelos cotovelos|parler sans arrêt|Minha tia adora falar pelos cotovelos.|Ma tante adore parler sans arrêt.
estar por fora|ne pas être au courant|Não quero estar por fora das novidades.|Je ne veux pas rater les nouvelles.
ficar de olho|garder un œil, surveiller|Pode ficar de olho na minha bolsa?|Tu peux surveiller mon sac ?
tirar o cavalinho da chuva|n'y compte pas, laisse tomber|Pode tirar o cavalinho da chuva, eu não vou emprestar meu carro.|Tu peux toujours courir, je ne vais pas prêter ma voiture.
dar bolo|poser un lapin|Não vai me dar bolo de novo, hein!|Ne me pose pas encore un lapin, hein !
chover no molhado|enfoncer une porte ouverte|Repetir isso é chover no molhado.|Répéter ça, c'est enfoncer une porte ouverte.
fazer uma vaquinha|faire une cagnotte|Vamos fazer uma vaquinha para o presente.|On va faire une cagnotte pour le cadeau.
estar com a corda toda|être plein d'énergie|Depois desse café, vou estar com a corda toda!|Après ce café, je vais être plein d'énergie !
engolir sapo|avaler des couleuvres|No trabalho às vezes preciso engolir sapo.|Au travail je dois parfois avaler des couleuvres.
ficar a ver navios|rester le bec dans l'eau|Se chegar tarde, você vai ficar a ver navios.|Si tu arrives tard, tu vas rester le bec dans l'eau.
dor de cotovelo|jalousie (amoureuse)|Isso aí é dor de cotovelo!|Ça, c'est de la jalousie !
descascar o abacaxi|régler un problème épineux|Sobrou para mim descascar o abacaxi.|C'est moi qui ai dû régler ce problème épineux.
acordar com o pé esquerdo|se lever du pied gauche|Parece que ele resolveu acordar com o pé esquerdo hoje.|On dirait qu'il s'est levé du pied gauche aujourd'hui.
de vento em popa|à merveille, sur de bons rails|O projeto está de vento em popa.|Le projet avance à merveille.
na mesma|toujours pareil, au même point|Melhorou? — Não, continua tudo na mesma.|Ça va mieux ? — Non, c'est toujours pareil.|S'emploie avec estar, ficar ou continuar.
meter o bedelho|se mêler de ce qui ne nous regarde pas|Não precisa meter o bedelho na minha vida.|Pas besoin de te mêler de ma vie.
ter um parafuso a menos|avoir une case en moins|Para fazer isso, precisa ter um parafuso a menos!|Pour faire ça, il faut avoir une case en moins !
`

const ADJECTIVES = [
  `
bom|bon|Esse restaurante é muito bom.|Ce restaurant est très bon.|féminin : boa · comparatif : melhor
ruim|mauvais|O filme foi ruim.|Le film était mauvais.|comparatif : pior
grande|grand|Eles moram numa casa grande.|Ils habitent dans une grande maison.|comparatif : maior
pequeno|petit|O apartamento é pequeno.|L'appartement est petit.|comparatif : menor
novo|neuf, nouveau, jeune|Comprei um celular novo.|J'ai acheté un nouveau portable.
velho|vieux|Esse carro está velho.|Cette voiture est vieille.
bonito|beau|Que dia bonito!|Quelle belle journée !
feio|laid|O tempo está feio hoje.|Il fait un sale temps aujourd'hui.
fácil|facile|A prova foi fácil.|L'examen était facile.
difícil|difficile|Português não é difícil!|Le portugais n'est pas difficile !
caro|cher|Está muito caro!|C'est trop cher !
barato|bon marché|Na feira é mais barato.|Au marché, c'est moins cher.
quente|chaud|O café está quente.|Le café est chaud.
frio|froid|O dia está frio.|La journée est froide.
rápido|rapide|O metrô é rápido.|Le métro est rapide.
lento|lent|A internet está lenta.|Internet est lent.
alto|grand (taille), haut|Meu irmão é muito alto.|Mon frère est très grand.
baixo|petit (taille), bas|Ela é baixa como a mãe.|Elle est petite comme sa mère.
cheio|plein|O ônibus está cheio.|Le bus est plein.
vazio|vide|A geladeira está vazia.|Le frigo est vide.
limpo|propre|A casa está limpa.|La maison est propre.
sujo|sale|Meu tênis está sujo.|Mes baskets sont sales.
feliz|heureux|Estou muito feliz hoje!|Je suis très heureux aujourd'hui !
triste|triste|Por que você está triste?|Pourquoi es-tu triste ?
cansado|fatigué|Estou cansado depois da viagem.|Je suis fatigué après le voyage.
`,
  `
ocupado|occupé|Agora estou ocupado, te ligo depois.|Je suis occupé, je t'appelle après.
livre|libre|Esse lugar está livre?|Cette place est libre ?
pronto|prêt|O jantar está pronto!|Le dîner est prêt !
certo|juste, correct|Você está certo.|Tu as raison.|Tá certo! = D'accord !
errado|faux, erroné|Peguei o ônibus errado.|J'ai pris le mauvais bus.
importante|important|É uma reunião importante.|C'est une réunion importante.
interessante|intéressant|Que livro interessante!|Quel livre intéressant !
chato|ennuyeux, pénible|Que dia chato!|Quelle journée pénible !|Peut aussi décrire une personne agaçante.
engraçado|drôle|Ele é muito engraçado.|Il est très drôle.
simpático|sympathique|O garçom foi muito simpático.|Le serveur a été très sympa.
legal|cool, sympa|Seu amigo é muito legal.|Ton ami est vraiment sympa.
gostoso|délicieux|Que bolo gostoso!|Quel gâteau délicieux !
forte|fort|O café está forte.|Le café est fort.
fraco|faible|Estou fraco depois da gripe.|Je suis faible après la grippe.
rico|riche|Ele ficou rico.|Il est devenu riche.
pobre|pauvre|É um bairro pobre.|C'est un quartier pauvre.
jovem|jeune|Ela é muito jovem.|Elle est très jeune.
antigo|ancien|O centro antigo é lindo.|Le centre ancien est magnifique.
perigoso|dangereux|Esse lugar é perigoso à noite.|Cet endroit est dangereux la nuit.
seguro|sûr|O bairro é seguro.|Le quartier est sûr.
tranquilo|calme, tranquille|A praia está tranquila hoje.|La plage est calme aujourd'hui.
preocupado|inquiet|Estou preocupado com a prova.|Je suis inquiet pour l'examen.
bravo|fâché|Minha mãe ficou brava comigo.|Ma mère s'est fâchée contre moi.|Attention : « bravo » ne veut pas dire « courageux » au Brésil.
lindo|magnifique|Que vista linda!|Quelle vue magnifique !
incrível|incroyable|A viagem foi incrível!|Le voyage était incroyable !
`,
]

const LINKERS = `
mas|mais|Quero ir, mas não posso.|Je veux y aller, mais je ne peux pas.
porém|cependant|O hotel é bom, porém caro.|L'hôtel est bien, cependant il est cher.|Plus soutenu que « mas ».
então|alors, donc|Está chovendo, então vamos ficar em casa.|Il pleut, alors on reste à la maison.
por isso|c'est pourquoi|Estava cansado, por isso dormi cedo.|J'étais fatigué, c'est pourquoi je me suis couché tôt.
porque|parce que|Não fui porque estava doente.|Je n'y suis pas allé parce que j'étais malade.|En deux mots pour la question : « por que? »
pois|car|Leva o casaco, pois vai esfriar.|Prends le manteau, car il va faire froid.
como|comme (cause)|Como estava tarde, peguei um táxi.|Comme il était tard, j'ai pris un taxi.
quando|quand|Me liga quando chegar.|Appelle-moi quand tu arrives.
enquanto|pendant que|Enquanto eu cozinho, você arruma a mesa.|Pendant que je cuisine, tu mets la table.
embora|bien que|Embora esteja frio, vou à praia.|Bien qu'il fasse froid, je vais à la plage.|Suivi du subjonctif.
mesmo assim|quand même|Estava cansado, mas fui mesmo assim.|J'étais fatigué, mais j'y suis allé quand même.
além disso|de plus, en plus|O apartamento é barato e, além disso, fica perto da praia.|L'appartement n'est pas cher et, en plus, il est près de la plage.
aliás|d'ailleurs|Aliás, você viu a Ana?|D'ailleurs, tu as vu Ana ?
ou seja|c'est-à-dire|Chego às oito, ou seja, daqui a uma hora.|J'arrive à huit heures, c'est-à-dire dans une heure.
por exemplo|par exemple|Gosto de frutas, por exemplo manga.|J'aime les fruits, par exemple la mangue.
por outro lado|d'un autre côté|É caro; por outro lado, é muito bom.|C'est cher ; d'un autre côté, c'est très bien.
no entanto|pourtant, néanmoins|Estudei muito; no entanto, não passei.|J'ai beaucoup étudié ; pourtant, je n'ai pas réussi.
apesar de|malgré|Apesar de cansado, ele foi trabalhar.|Malgré la fatigue, il est allé travailler.|apesar de + a = apesar da
antes de|avant de|Escova os dentes antes de dormir.|Brosse-toi les dents avant de dormir.
depois de|après|Depois de comer, vamos passear.|Après avoir mangé, on va se promener.
assim que|dès que|Te ligo assim que chegar.|Je t'appelle dès que j'arrive.
até que|jusqu'à ce que|Espera aqui até que eu volte.|Attends ici jusqu'à ce que je revienne.
para que|pour que|Fala devagar para que ele entenda.|Parle lentement pour qu'il comprenne.
caso|au cas où|Leva o guarda-chuva caso chova.|Prends le parapluie au cas où il pleuvrait.
se|si|Se você quiser, a gente vai junto.|Si tu veux, on y va ensemble.
ou|ou|Você prefere café ou chá?|Tu préfères le café ou le thé ?
nem|ni, même pas|Ele nem me ligou.|Il ne m'a même pas appelé.|Não gosto nem de café nem de chá = ni… ni…
enfim|bref, enfin|Enfim, foi um dia longo.|Bref, ça a été une longue journée.
tipo|genre (oral)|Ele chegou, tipo, duas horas atrasado.|Il est arrivé, genre, deux heures en retard.
aí|et là, du coup (oral)|Aí ele falou que não vinha.|Et là il a dit qu'il ne venait pas.
`

const VERB_PREP = `
gostar de|aimer|Você vai gostar de morar aqui.|Tu vas aimer habiter ici.|eu gosto de…
precisar de|avoir besoin de|Vou precisar de ajuda.|Je vais avoir besoin d'aide.|Devant un infinitif, sans « de » : preciso sair.
pensar em|penser à|Não consigo parar de pensar em você.|Je n'arrive pas à arrêter de penser à toi.
sonhar com|rêver de|Vou sonhar com essa praia.|Je vais rêver de cette plage.
casar com|se marier avec|Ela vai casar com o Pedro.|Elle va se marier avec Pedro.
acreditar em|croire en|Você precisa acreditar em você.|Tu dois croire en toi.
chegar a|arriver à|Vamos chegar a Salvador à noite.|On va arriver à Salvador le soir.|À l'oral, on entend souvent « chegar em ».
lembrar de|se souvenir de, penser à|Precisa lembrar de comprar pão.|Il faut penser à acheter du pain.
esquecer de|oublier de|Não pode esquecer de ligar para ela.|Il ne faut pas oublier de l'appeler.
depender de|dépendre de|Tudo vai depender de você.|Tout va dépendre de toi.
cuidar de|s'occuper de|Quem vai cuidar de você?|Qui va s'occuper de toi ?
parar de|arrêter de|Preciso parar de fumar.|Je dois arrêter de fumer.
começar a|commencer à|Vai começar a chover.|Il va commencer à pleuvoir.
aprender a|apprendre à|Quero aprender a dançar samba.|Je veux apprendre à danser la samba.
ajudar a|aider à|Pode me ajudar a carregar a mala?|Tu peux m'aider à porter la valise ?
conversar com|discuter avec|Preciso conversar com você.|Je dois discuter avec toi.
falar com|parler à|Quero falar com o gerente.|Je veux parler au responsable.|Le français dit « parler à », le portugais « falar com ».
concordar com|être d'accord avec|Não posso concordar com isso.|Je ne peux pas être d'accord avec ça.
morar em|habiter à|Quero morar em Florianópolis.|Je veux habiter à Florianópolis.
entrar em|entrer dans|Pode entrar em casa.|Tu peux entrer dans la maison.
confiar em|faire confiance à|Pode confiar em mim.|Tu peux me faire confiance.
gastar com|dépenser pour|Não quero gastar com besteira.|Je ne veux pas dépenser pour des bêtises.
desistir de|renoncer à, abandonner|Não vou desistir de você.|Je ne vais pas renoncer à toi.
rir de|se moquer de|Não precisa rir de mim!|Pas besoin de te moquer de moi !
ter medo de|avoir peur de|É normal ter medo de altura.|C'est normal d'avoir le vertige.
se apaixonar por|tomber amoureux de|Cuidado para não se apaixonar por ele!|Fais attention à ne pas tomber amoureuse de lui !
passar por|passer par|Vamos passar por Paraty.|On va passer par Paraty.
trocar por|échanger contre|Quero trocar por um tamanho maior.|Je veux l'échanger contre une taille au-dessus.
ir para|aller à (destination)|Preciso ir para casa.|Je dois rentrer à la maison.
sair de|sortir de, partir de|Preciso sair de casa cedo.|Je dois partir de chez moi tôt.
`

const DIMINUTIVES = `
cafezinho|petit café (convivial)|Aceita um cafezinho?|Tu veux un petit café ?|café + -zinho : on l'offre à tout le monde au Brésil.
rapidinho|vite fait, deux secondes|Espera rapidinho!|Attends deux secondes !
pouquinho|un tout petit peu|Só um pouquinho, por favor.|Juste un tout petit peu, s'il te plaît.
devagarinho|tout doucement|Vai devagarinho.|Vas-y tout doucement.
cedinho|de bon matin|Amanhã a gente sai cedinho.|Demain on part de bon matin.
pertinho|tout près|A praia fica pertinho.|La plage est tout près.
agorinha|à l'instant|Ele saiu agorinha.|Il vient de sortir à l'instant.
obrigadinho|merci bien (affectueux)|Obrigadinho pela ajuda!|Merci bien pour l'aide !
beijinho|petit bisou|Um beijinho para você!|Un petit bisou pour toi !
lanchinho|petit encas|Vou fazer um lanchinho.|Je vais grignoter un petit truc.
gatinho|chaton|Que gatinho fofo!|Quel chaton mignon !
amorzinho|mon cœur, mon amour|Bom dia, amorzinho!|Bonjour, mon cœur !
casinha|petite maison|Eles moram numa casinha na praia.|Ils habitent une petite maison à la plage.
cervejinha|petite bière (entre amis)|Bora tomar uma cervejinha?|On va boire une petite bière ?
quentinho|bien chaud|O pão está quentinho.|Le pain est tout chaud.
sozinho|tout seul|Moro sozinho.|J'habite seul.|Diminutif devenu un mot à part entière.
casarão|grande maison, demeure|Eles moram num casarão antigo.|Ils habitent dans une grande demeure ancienne.|-ão = augmentatif
golaço|but magnifique|Que golaço!|Quel but magnifique !|-aço = augmentatif expressif
calorão|grosse chaleur|Que calorão hoje!|Quelle chaleur aujourd'hui !
dinheirão|un paquet d'argent|Ele ganhou um dinheirão.|Il a gagné un paquet d'argent.
amigão|super pote|Valeu, amigão!|Merci, mon pote !
festão|grosse fête|Foi um festão!|C'était une fête énorme !
filmão|super film|Esse filme é um filmão!|Ce film est génial !
carrão|grosse voiture|Ele comprou um carrão.|Il s'est acheté une grosse voiture.
bocão|grande gueule|Ele é um bocão, conta tudo.|C'est une grande gueule, il raconte tout.
`

const EMOTIONS = `
saudade|le manque, la nostalgie|Que saudade da minha família!|Ma famille me manque tellement !|Mot emblématique, sans équivalent exact en français.
animado|enthousiaste, motivé|Estou muito animado com a viagem!|Je suis trop motivé pour le voyage !
ansioso|anxieux, impatient|Estou ansioso para o show.|J'ai hâte d'être au concert.|Souvent positif : « avoir hâte ».
raiva|colère|Fiquei com raiva dele.|Je me suis énervé contre lui.
irritado|agacé|Ele está irritado com o barulho.|Il est agacé par le bruit.
chateado|contrarié, vexé|Fiquei chateado com o que ele disse.|J'ai été contrarié par ce qu'il a dit.
decepcionado|déçu|Estou decepcionado com o resultado.|Je suis déçu du résultat.
medo|peur|Tenho medo de barata.|J'ai peur des cafards.
envergonhado|gêné, honteux|Fiquei envergonhado na frente de todos.|J'étais gêné devant tout le monde.
orgulhoso|fier|Estou orgulhoso de você!|Je suis fier de toi !
aliviado|soulagé|Que bom, estou aliviado!|Tant mieux, je suis soulagé !
emocionado|ému|Fiquei emocionado com o filme.|J'ai été ému par le film.
nervoso|nerveux|Estou nervoso com a entrevista.|Je suis nerveux pour l'entretien.
entediado|qui s'ennuie|Estou entediado em casa.|Je m'ennuie à la maison.
de saco cheio|ras le bol|Estou de saco cheio desse trabalho!|J'en ai ras le bol de ce travail !|familier
de bom humor|de bonne humeur|Hoje ela está de bom humor.|Aujourd'hui elle est de bonne humeur.
de mau humor|de mauvaise humeur|Ele acordou de mau humor.|Il s'est réveillé de mauvaise humeur.
apaixonado|amoureux|Ele está apaixonado por ela.|Il est amoureux d'elle.
ciúmes|jalousie|Ele sente ciúmes de tudo.|Il est jaloux de tout.
Que bom!|Super ! Tant mieux !|Você passou? Que bom!|Tu as réussi ? Super !
Que pena!|Dommage !|Não vai poder vir? Que pena!|Tu ne pourras pas venir ? Dommage !
Que alívio!|Quel soulagement !|Achei a carteira, que alívio!|J'ai retrouvé mon portefeuille, quel soulagement !
Que vergonha!|Quelle honte !|Caí na frente de todo mundo, que vergonha!|Je suis tombé devant tout le monde, quelle honte !
Que saco!|Ça me saoule !|Que saco, perdi o ônibus!|Ça me saoule, j'ai raté le bus !|familier
Que susto!|Quelle frayeur !|Ai, que susto!|Aïe, tu m'as fait peur !
Nossa!|Waouh ! (surprise)|Nossa, que lindo!|Waouh, c'est magnifique !
Caramba!|Ça alors ! Mince !|Caramba, esqueci a chave!|Mince, j'ai oublié la clé !
Graças a Deus!|Dieu merci !|Graças a Deus chegamos bem.|Dieu merci, nous sommes bien arrivés.
Tô nem aí|je m'en fiche|Pode falar o que quiser, tô nem aí.|Dis ce que tu veux, je m'en fiche.|familier
Tanto faz|peu importe|Pizza ou hambúrguer? Tanto faz.|Pizza ou burger ? Peu importe.
`

interface Source {
  id: string
  title: string
  emoji: string
  cat: string
  /** Nom court des parties quand la collection est découpée (« Verbes · 1–25 »). */
  short?: string
  /** Préfixe des identifiants de mots (ne pas changer : la progression y est rattachée). */
  prefix: string
  raw: string
}

const sources: Source[] = [
  { id: 'verbes', title: '100 verbes essentiels', short: 'Verbes', emoji: '🏃', cat: 'verbe', prefix: 'verbe', raw: VERBS.join('\n') },
  { id: 'adverbes', title: 'Adverbes utiles', emoji: '⏱️', cat: 'adverbe', prefix: 'adverbe', raw: ADVERBS },
  { id: 'expressions', title: 'Expressions idiomatiques', emoji: '🗣️', cat: 'expression', prefix: 'idiome', raw: IDIOMS },
  { id: 'adjectifs', title: '50 adjectifs essentiels', short: 'Adjectifs', emoji: '🎨', cat: 'adjectif', prefix: 'adjectif', raw: ADJECTIVES.join('\n') },
  { id: 'liaison', title: 'Mots de liaison', emoji: '🔗', cat: 'liaison', prefix: 'liaison', raw: LINKERS },
  { id: 'verbes-prepositions', title: 'Verbes + préposition', emoji: '🧩', cat: 'verbe + prép.', prefix: 'vprep', raw: VERB_PREP },
  { id: 'diminutifs', title: 'Diminutifs & augmentatifs', emoji: '🔍', cat: 'diminutif', prefix: 'dim', raw: DIMINUTIVES },
  { id: 'emotions', title: 'Émotions & réactions', emoji: '😮', cat: 'émotion', prefix: 'emo', raw: EMOTIONS },
]

/** Au-delà de MAX_DECK mots, une collection est découpée en fiches d'environ PART_SIZE mots, regroupées sous une seule carte. */
const MAX_DECK = 30
const PART_SIZE = 25

export const groups: CollectionGroup[] = []
export const collections: Collection[] = []

for (const src of sources) {
  const items = parse(src.prefix, src.cat, src.raw.trim())
  if (items.length <= MAX_DECK) {
    collections.push({ id: src.id, title: src.title, emoji: src.emoji, cat: src.cat, items })
    continue
  }
  groups.push({ id: src.id, title: src.title, emoji: src.emoji })
  // Parts de tailles équilibrées : 100 → 4 × 25, 50 → 2 × 25, 60 → 3 × 20.
  const parts = Math.ceil(items.length / PART_SIZE)
  const size = Math.ceil(items.length / parts)
  for (let i = 0; i < parts; i++) {
    const chunk = items.slice(i * size, (i + 1) * size)
    collections.push({
      id: `${src.id}-${i + 1}`,
      title: `${src.short ?? src.title} · ${i * size + 1}–${i * size + chunk.length}`,
      emoji: src.emoji,
      cat: src.cat,
      group: src.id,
      items: chunk,
    })
  }
}

export const collectionItems: StudyItem[] = collections.flatMap((c) => c.items)
