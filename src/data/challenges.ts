/**
 * « Aller plus loin » : défis de conjugaison et de grammaire.
 * Texte à trous : chaque trou s'écrit [réponse|indice] ; alternatives acceptées séparées par « / ».
 * Traductions : la première version portugaise est la référence, les suivantes sont aussi acceptées.
 */
import type { Level } from './types'

export interface Translation {
  fr: string
  pt: string[]
}

export interface Challenge {
  id: string
  title: string
  emoji: string
  level: Level
  cat: 'conjugaison' | 'grammaire'
  focus: string
  clozeTitle: string
  cloze: string
  clozeFr: string
  translations: Translation[]
}

const t = (fr: string, ...pt: string[]): Translation => ({ fr, pt })

export const challenges: Challenge[] = [
  {
    id: 'defi-present',
    title: 'Le présent en contexte',
    emoji: '🕐',
    level: 'A2',
    cat: 'conjugaison',
    focus: 'Verbes réguliers et irréguliers au présent, ser / estar',
    clozeTitle: 'A rotina do Rafael',
    cloze:
      'Todo dia, o Rafael [acorda|acordar] às seis e meia. Ele [toma|tomar] banho, [faz|fazer] café e [sai|sair] de casa às sete. No caminho, ele [ouve|ouvir] música no metrô. Ao meio-dia, ele e os colegas [almoçam|almoçar] juntos. À noite, ele [está|estar / ser] sempre cansado, mas [lê|ler] um pouco antes de dormir. No fim de semana, eu e ele [vamos|ir] à praia e [jogamos|jogar] vôlei.',
    clozeFr:
      'Tous les jours, Rafael se réveille à six heures et demie. Il se douche, fait du café et sort de chez lui à sept heures. En chemin, il écoute de la musique dans le métro. À midi, lui et ses collègues déjeunent ensemble. Le soir, il est toujours fatigué, mais il lit un peu avant de dormir. Le week-end, lui et moi allons à la plage et jouons au volley.',
    translations: [
      t('Je me réveille à sept heures tous les jours.', 'Eu acordo às sete horas todos os dias.', 'Acordo às sete todos os dias.', 'Eu acordo às sete todo dia.', 'Acordo às sete horas todo dia.'),
      t('Elle est fatiguée aujourd’hui.', 'Ela está cansada hoje.', 'Hoje ela está cansada.'),
      t('Nous voulons apprendre le portugais.', 'Nós queremos aprender português.', 'Queremos aprender português.', 'A gente quer aprender português.'),
      t('Qu’est-ce que tu fais le week-end ?', 'O que você faz no fim de semana?', 'O que você faz nos fins de semana?'),
      t('Je ne sais pas où il habite.', 'Eu não sei onde ele mora.', 'Não sei onde ele mora.'),
      t('Ils viennent dîner à la maison ce soir.', 'Eles vêm jantar em casa hoje à noite.', 'Eles vêm jantar lá em casa hoje à noite.', 'Eles vêm jantar aqui em casa hoje à noite.'),
    ],
  },
  {
    id: 'defi-passe',
    title: 'Raconter au passé',
    emoji: '⏪',
    level: 'B1',
    cat: 'conjugaison',
    focus: 'Prétérit (action terminée) ou imparfait (description, habitude) ?',
    clozeTitle: 'Minhas férias na Bahia',
    cloze:
      'No ano passado, eu [fui|ir] para a Bahia com a minha irmã. Quando nós [chegamos|chegar] em Salvador, [fazia|fazer] muito calor. O hotel [era|ser] pequeno, mas muito charmoso. Todos os dias, nós [íamos|ir] à praia de manhã. Uma noite, nós [conhecemos|conhecer] um grupo de músicos que [tocava|tocar] samba no Pelourinho. Eu [adorei|adorar] a viagem e [tirei|tirar] muitas fotos.',
    clozeFr:
      'L’année dernière, je suis allé à Bahia avec ma sœur. Quand nous sommes arrivés à Salvador, il faisait très chaud. L’hôtel était petit, mais plein de charme. Tous les jours, nous allions à la plage le matin. Un soir, nous avons rencontré un groupe de musiciens qui jouait de la samba au Pelourinho. J’ai adoré le voyage et j’ai pris beaucoup de photos.',
    translations: [
      t('Hier, je suis allé au cinéma avec mes amis.', 'Ontem eu fui ao cinema com meus amigos.', 'Ontem fui ao cinema com os meus amigos.', 'Ontem eu fui ao cinema com os meus amigos.', 'Ontem fui ao cinema com meus amigos.'),
      t('Quand j’étais enfant, j’habitais près de la mer.', 'Quando eu era criança, eu morava perto do mar.', 'Quando era criança, morava perto do mar.', 'Quando eu era criança, morava perto do mar.'),
      t('Elle n’a pas compris la question.', 'Ela não entendeu a pergunta.'),
      t('Nous avons mangé une feijoada délicieuse.', 'Nós comemos uma feijoada deliciosa.', 'Comemos uma feijoada deliciosa.', 'A gente comeu uma feijoada deliciosa.'),
      t('Il pleuvait quand je suis sorti.', 'Estava chovendo quando eu saí.', 'Chovia quando eu saí.', 'Estava chovendo quando saí.'),
      t('Qu’est-ce que tu as fait hier soir ?', 'O que você fez ontem à noite?'),
    ],
  },
  {
    id: 'defi-futur-conditionnel',
    title: 'Projets et souhaits',
    emoji: '⏩',
    level: 'B1',
    cat: 'conjugaison',
    focus: 'Futur proche, futur simple et conditionnel',
    clozeTitle: 'Planos para o ano que vem',
    cloze:
      'No ano que vem, eu [vou|ir] morar em Florianópolis. Primeiro, eu [farei|fazer, futur simple] um curso intensivo de português. Depois, [procurarei|procurar, futur simple] um emprego. Minha família [virá|vir, futur simple] me visitar no verão. Eu [gostaria|gostar, conditionnel] de morar perto da praia, mas os aluguéis lá [seriam|ser, conditionnel] caros demais. Então eu [poderia|poder, conditionnel] dividir um apartamento com amigos.',
    clozeFr:
      'L’année prochaine, je vais habiter à Florianópolis. D’abord, je ferai un cours intensif de portugais. Ensuite, je chercherai un emploi. Ma famille viendra me rendre visite en été. J’aimerais habiter près de la plage, mais les loyers y seraient trop chers. Alors je pourrais partager un appartement avec des amis.',
    translations: [
      t('Demain, je vais travailler à la maison.', 'Amanhã eu vou trabalhar em casa.', 'Amanhã vou trabalhar em casa.', 'Amanhã eu vou trabalhar de casa.', 'Amanhã vou trabalhar de casa.'),
      t('Il fera beau ce week-end.', 'Vai fazer sol neste fim de semana.', 'Fará sol neste fim de semana.', 'Vai fazer sol nesse fim de semana.', 'Vai fazer tempo bom neste fim de semana.'),
      t('J’aimerais réserver une table pour deux.', 'Eu gostaria de reservar uma mesa para dois.', 'Gostaria de reservar uma mesa para dois.', 'Eu gostaria de reservar uma mesa para duas pessoas.'),
      t('Pourriez-vous m’aider, s’il vous plaît ?', 'Você poderia me ajudar, por favor?', 'Poderia me ajudar, por favor?', 'O senhor poderia me ajudar, por favor?'),
      t('Nous verrons demain.', 'Veremos amanhã.', 'Vamos ver amanhã.', 'A gente vê amanhã.'),
      t('Il a dit qu’il arriverait plus tard.', 'Ele disse que chegaria mais tarde.', 'Ele falou que chegaria mais tarde.', 'Ele disse que ia chegar mais tarde.'),
    ],
  },
  {
    id: 'defi-subjonctif',
    title: 'Le subjonctif au quotidien',
    emoji: '💭',
    level: 'B1',
    cat: 'conjugaison',
    focus: 'Subjonctif présent, imparfait et futur',
    clozeTitle: 'Os conselhos da minha mãe',
    cloze:
      'Antes da viagem, minha mãe me disse: « Quero que você [tome|tomar] cuidado. É importante que você [leve|levar] um casaco, mesmo que [faça|fazer] calor. Quando você [chegar|chegar], me liga. Se você [precisar|precisar] de dinheiro, me avisa. Espero que você [seja|ser] muito feliz lá. » Eu respondi: « Se eu [pudesse|poder], levaria você comigo! »',
    clozeFr:
      'Avant le voyage, ma mère m’a dit : « Je veux que tu fasses attention. C’est important que tu prennes un manteau, même s’il fait chaud. Quand tu arriveras, appelle-moi. Si tu as besoin d’argent, préviens-moi. J’espère que tu seras très heureux là-bas. » J’ai répondu : « Si je pouvais, je t’emmènerais avec moi ! »',
    translations: [
      t('Il faut que tu manges plus.', 'É preciso que você coma mais.', 'Você precisa comer mais.', 'É preciso que tu comas mais.'),
      t('J’espère que tu vas bien.', 'Espero que você esteja bem.', 'Eu espero que você esteja bem.'),
      t('Si tu veux, on peut y aller ensemble.', 'Se você quiser, a gente pode ir junto.', 'Se quiser, a gente pode ir junto.', 'Se você quiser, podemos ir juntos.'),
      t('J’aimerais que tu viennes avec moi.', 'Eu gostaria que você viesse comigo.', 'Gostaria que você viesse comigo.'),
      t('Quand je pourrai, je t’appellerai.', 'Quando eu puder, eu te ligo.', 'Quando eu puder, te ligo.', 'Quando puder, te ligarei.', 'Quando eu puder, eu te ligarei.'),
      t('Si j’avais de l’argent, je voyagerais.', 'Se eu tivesse dinheiro, eu viajaria.', 'Se eu tivesse dinheiro, viajaria.', 'Se tivesse dinheiro, viajaria.'),
    ],
  },
  {
    id: 'defi-temps-composes',
    title: 'Les temps composés',
    emoji: '🧱',
    level: 'B2',
    cat: 'conjugaison',
    focus: 'Tenho falado, tinha falado, teria falado, tivesse falado…',
    clozeTitle: 'De volta ao Brasil',
    cloze:
      'Fazia dez anos que eu não ia ao Brasil. Ultimamente, eu [tenho pensado|pensar, « passé composé » PT] muito nessa viagem. Quando cheguei ao aeroporto, meus primos já [tinham chegado|chegar, plus-que-parfait] para me buscar. Eles [tinham preparado|preparar, plus-que-parfait] uma festa surpresa! Se eu [tivesse sabido|saber, subj. plus-que-parfait], [teria trazido|trazer, conditionnel passé] presentes para todos. Até o fim das férias, eu [terei visitado|visitar, futur antérieur] toda a família.',
    clozeFr:
      'Ça faisait dix ans que je n’étais pas allé au Brésil. Ces derniers temps, je pense beaucoup à ce voyage. Quand je suis arrivé à l’aéroport, mes cousins étaient déjà arrivés pour venir me chercher. Ils avaient préparé une fête surprise ! Si j’avais su, j’aurais apporté des cadeaux pour tout le monde. D’ici la fin des vacances, j’aurai rendu visite à toute la famille.',
    translations: [
      t('Je travaille beaucoup ces derniers temps.', 'Tenho trabalhado muito ultimamente.', 'Eu tenho trabalhado muito ultimamente.', 'Ultimamente eu tenho trabalhado muito.'),
      t('Quand je suis arrivé, le film avait déjà commencé.', 'Quando eu cheguei, o filme já tinha começado.', 'Quando cheguei, o filme já tinha começado.'),
      t('Si j’avais su, je serais venu.', 'Se eu tivesse sabido, eu teria vindo.', 'Se eu tivesse sabido, teria vindo.', 'Se eu soubesse, teria vindo.', 'Se eu soubesse, eu teria vindo.'),
      t('J’espère que le cadeau t’a plu.', 'Espero que você tenha gostado do presente.', 'Eu espero que você tenha gostado do presente.'),
      t('D’ici vendredi, j’aurai fini le travail.', 'Até sexta, eu terei terminado o trabalho.', 'Até sexta, terei terminado o trabalho.', 'Até sexta-feira, terei terminado o trabalho.'),
      t('Tu aurais aimé ce restaurant.', 'Você teria gostado desse restaurante.', 'Você teria gostado deste restaurante.'),
    ],
  },
  {
    id: 'defi-prepositions',
    title: 'Articles, contractions et prépositions',
    emoji: '🧭',
    level: 'A2',
    cat: 'grammaire',
    focus: 'no, na, ao, à, pelo, de ônibus, a pé…',
    clozeTitle: 'Um dia no Rio',
    cloze:
      'Ontem eu fui [ao|a + o] Rio de Janeiro [de|moyen de transport] ônibus. Cheguei [às|à + heure] nove horas e fui direto [à|a + a] praia de Copacabana. Almocei [num|em + um] restaurante [na|em + a] Avenida Atlântica. [Depois do|après le] almoço, passei [pelo|par le] centro e comprei um presente [para|pour] minha mãe. Voltei para casa [à/de|moment de la journée] noite, muito cansado.',
    clozeFr:
      'Hier, je suis allé à Rio de Janeiro en bus. Je suis arrivé à neuf heures et je suis allé directement à la plage de Copacabana. J’ai déjeuné dans un restaurant de l’avenue Atlântica. Après le déjeuner, je suis passé par le centre et j’ai acheté un cadeau pour ma mère. Je suis rentré à la maison le soir, très fatigué.',
    translations: [
      t('J’habite au Brésil depuis deux ans.', 'Eu moro no Brasil há dois anos.', 'Moro no Brasil há dois anos.', 'Moro no Brasil faz dois anos.', 'Faz dois anos que eu moro no Brasil.'),
      t('Le livre est sur la table de la cuisine.', 'O livro está na mesa da cozinha.', 'O livro está em cima da mesa da cozinha.'),
      t('Je vais à la plage à pied.', 'Eu vou à praia a pé.', 'Vou à praia a pé.', 'Vou pra praia a pé.', 'Eu vou para a praia a pé.'),
      t('Merci pour l’aide !', 'Obrigado pela ajuda!', 'Obrigada pela ajuda!'),
      t('Elle vient de France et elle habite à Rio.', 'Ela é da França e mora no Rio.', 'Ela vem da França e mora no Rio.', 'Ela é da França e ela mora no Rio.'),
      t('Le cadeau est pour toi.', 'O presente é para você.', 'O presente é pra você.'),
    ],
  },
  {
    id: 'defi-pronoms',
    title: 'Pronoms, possessifs et démonstratifs',
    emoji: '👥',
    level: 'A2',
    cat: 'grammaire',
    focus: 'te, comigo, mim, dele, dela, esse, aquele…',
    clozeTitle: 'Fotos de família',
    cloze:
      'Olha [essa|cette (près de nous)] foto! Esse homem é o [meu|mon] pai e aquela mulher é a mãe [dele|sa (à lui)]. Ali no fundo estão os [nossos|nos] primos. Você conhece [aquele|celui-là (loin)] menino? É o filho [dela|son (à elle)], a minha tia. Ela sempre fala de [mim|moi] quando liga. Quer vir [comigo|avec moi] visitar a família?',
    clozeFr:
      'Regarde cette photo ! Cet homme, c’est mon père, et cette femme-là, c’est sa mère. Là, au fond, ce sont nos cousins. Tu connais ce garçon-là ? C’est son fils, à ma tante. Elle parle toujours de moi quand elle appelle. Tu veux venir avec moi rendre visite à la famille ?',
    translations: [
      t('Je t’aime.', 'Eu te amo.', 'Te amo.'),
      t('Tu viens avec moi ?', 'Você vem comigo?', 'Vem comigo?'),
      t('Sa voiture (à elle) est rouge.', 'O carro dela é vermelho.'),
      t('Ces chaussures sont à moi.', 'Esses sapatos são meus.', 'Estes sapatos são meus.'),
      t('Donne-moi ça, s’il te plaît.', 'Me dá isso, por favor.', 'Me dê isso, por favor.', 'Dá isso pra mim, por favor.'),
      t('On se voit demain.', 'A gente se vê amanhã.', 'Nos vemos amanhã.'),
    ],
  },
  {
    id: 'defi-melange',
    title: 'Grand mélange',
    emoji: '🏆',
    level: 'B2',
    cat: 'conjugaison',
    focus: 'Tous les temps et toutes les structures, comme dans la vraie vie',
    clozeTitle: 'A história do meu avô',
    cloze:
      'Quando eu [era|ser] pequeno, meu avô [contava|contar] histórias incríveis. Ele [nasceu|nascer] em Minas Gerais e [trabalhou|trabalhar] a vida toda numa fazenda. Ultimamente, eu [tenho lido|ler, « passé composé » PT] muitos livros sobre essa região. Se ele ainda [estivesse|estar] vivo, eu [faria|fazer] mil perguntas para ele. No ano que vem, eu [vou|ir] visitar a cidade onde ele [cresceu|crescer]. Espero que a casa dele ainda [exista|existir]!',
    clozeFr:
      'Quand j’étais petit, mon grand-père racontait des histoires incroyables. Il est né dans le Minas Gerais et a travaillé toute sa vie dans une ferme. Ces derniers temps, je lis beaucoup de livres sur cette région. S’il était encore vivant, je lui poserais mille questions. L’année prochaine, je vais visiter la ville où il a grandi. J’espère que sa maison existe encore !',
    translations: [
      t('Il faut que nous partions avant qu’il pleuve.', 'Precisamos sair antes que chova.', 'A gente precisa sair antes que chova.', 'É preciso que a gente saia antes que chova.', 'É preciso que saiamos antes que chova.'),
      t('Si tu étais venu, tu aurais adoré.', 'Se você tivesse vindo, teria adorado.', 'Se você tivesse vindo, você teria adorado.'),
      t('Je ne savais pas que tu parlais portugais.', 'Eu não sabia que você falava português.', 'Não sabia que você falava português.'),
      t('Quand tu arriveras, appelle-moi.', 'Quando você chegar, me liga.', 'Quando você chegar, me ligue.', 'Quando chegar, me liga.'),
      t('Ça fait trois ans que j’étudie le portugais.', 'Faz três anos que eu estudo português.', 'Faz três anos que estudo português.', 'Estudo português há três anos.', 'Eu estudo português há três anos.'),
      t('Elle m’a demandé de fermer la porte.', 'Ela me pediu para fechar a porta.', 'Ela pediu para eu fechar a porta.', 'Ela me pediu que fechasse a porta.'),
      t('Nous allons à la plage bien qu’il fasse froid.', 'Vamos à praia embora esteja frio.', 'Nós vamos à praia embora esteja frio.', 'A gente vai à praia embora esteja frio.'),
      t('Je pense que tu as raison.', 'Eu acho que você tem razão.', 'Acho que você tem razão.'),
    ],
  },
]

export const challengeById = (id: string) => challenges.find((c) => c.id === id)

export interface Blank {
  answer: string
  hint: string
}

/** Découpe le texte à trous en morceaux de texte et trous. */
export function parseCloze(text: string): (string | Blank)[] {
  const parts: (string | Blank)[] = []
  const re = /\[([^|\]]+)\|([^\]]+)\]/g
  let last = 0
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push({ answer: m[1], hint: m[2] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
