// Módulos nuevos: Places, School, Time, Conjugación sonidos, Singular/Plural, Contracciones
const DATA_NUEVOS = {

places:{name:'Places / Lugares',emoji:'🗺️',color:'#3B82F6',desc:'Lugares y direcciones',levels:[
  {name:'En la ciudad',items:[['bank','banco'],['hospital','hospital'],['school','escuela'],['church','iglesia'],['market','mercado'],['supermarket','supermercado'],['mall','centro comercial'],['library','biblioteca'],['museum','museo'],['park','parque'],['airport','aeropuerto'],['station','estación'],['port','puerto'],['bus stop','parada de autobús']]},
  {name:'En el hotel',items:[['lobby','vestíbulo'],['reception','recepción'],['restaurant','restaurante'],['bar','bar'],['pool','alberca'],['gym','gimnasio'],['spa','spa'],['elevator','elevador'],['stairs','escaleras'],['parking lot','estacionamiento'],['terrace','terraza'],['gift shop','tienda de regalos'],['business center','centro de negocios']]},
  {name:'En la naturaleza',items:[['beach','playa'],['mountain','montaña'],['river','río'],['lake','lago'],['forest','bosque'],['jungle','selva'],['desert','desierto'],['island','isla'],['volcano','volcán'],['cave','cueva'],['waterfall','cascada']]}
]},

school:{name:'School Subjects',emoji:'📚',color:'#8B5CF6',desc:'Materias y objetos escolares',levels:[
  {name:'Materias',items:[['math','matemáticas'],['science','ciencias'],['history','historia'],['geography','geografía'],['english','inglés'],['art','arte'],['music','música'],['physical education','educación física'],['biology','biología'],['chemistry','química'],['physics','física'],['literature','literatura']]},
  {name:'Objetos de la escuela',items:[['pencil','lápiz'],['pen','pluma'],['eraser','borrador'],['notebook','cuaderno'],['book','libro'],['backpack','mochila'],['ruler','regla'],['scissors','tijeras'],['glue','pegamento'],['marker','marcador'],['calculator','calculadora'],['computer','computadora']]},
  {name:'En el salón',items:[['teacher','maestro/a'],['student','estudiante'],['desk','escritorio'],['chair','silla'],['blackboard','pizarrón'],['whiteboard','pizarrón blanco'],['clock','reloj'],['window','ventana'],['door','puerta'],['bookcase','librero'],['projector','proyector'],['map','mapa']]}
]},

time:{name:'Time / Tiempo',emoji:'⏰',color:'#F59E0B',desc:'Horas, días, meses y estaciones',levels:[
  {name:'La hora',items:[['one o\'clock','la una'],['two o\'clock','las dos'],['three o\'clock','las tres'],['half past','y media'],['quarter past','y cuarto'],['quarter to','cuarto para'],['noon','mediodía'],['midnight','medianoche'],['a.m.','de la mañana'],['p.m.','de la tarde/noche'],['early','temprano'],['late','tarde']]},
  {name:'Partes del día',items:[['morning','mañana'],['afternoon','tarde'],['evening','noche (temprana)'],['night','noche'],['dawn','amanecer'],['sunrise','salida del sol'],['sunset','puesta del sol'],['dusk','atardecer']]},
  {name:'Días de la semana',items:[['Monday','lunes'],['Tuesday','martes'],['Wednesday','miércoles'],['Thursday','jueves'],['Friday','viernes'],['Saturday','sábado'],['Sunday','domingo'],['weekday','día de semana'],['weekend','fin de semana']]},
  {name:'Meses del año',items:[['January','enero'],['February','febrero'],['March','marzo'],['April','abril'],['May','mayo'],['June','junio'],['July','julio'],['August','agosto'],['September','septiembre'],['October','octubre'],['November','noviembre'],['December','diciembre']]},
  {name:'Estaciones',items:[['spring','primavera'],['summer','verano'],['fall / autumn','otoño'],['winter','invierno']]},
  {name:'Expresiones de tiempo',items:[['today','hoy'],['tomorrow','mañana'],['yesterday','ayer'],['next week','la próxima semana'],['last week','la semana pasada'],['next month','el próximo mes'],['last month','el mes pasado'],['next year','el próximo año'],['last year','el año pasado'],['now','ahora'],['later','después'],['soon','pronto']]}
]},

conjSounds:{name:'Conjugation Sounds',emoji:'🔊',color:'#A855F7',desc:'Diferencias de sonido entre conjugaciones',pairs:true,levels:[
  {name:'Regulares (-ed)',items:[
    {a:['walk','caminar (base)'],b:['walked','caminó (pasado)'],tip:'walk = termina en "k". walked = "walkt" (la "ed" suena como "t").'},
    {a:['reach','alcanzar (base)'],b:['reached','alcanzó (pasado)'],tip:'reach = termina en "ch". reached = "reacht" (la "ed" suena como "t").'},
    {a:['play','jugar (base)'],b:['played','jugó (pasado)'],tip:'play = termina en vocal. played = "playd" (la "ed" suena como "d").'},
    {a:['live','vivir (base)'],b:['lived','vivió (pasado)'],tip:'live = termina en "v". lived = "livd" (la "ed" suena como "d").'},
    {a:['want','querer (base)'],b:['wanted','quiso (pasado)'],tip:'want = termina en "t". wanted = "want-ed" (la "ed" suena como "id").'},
    {a:['need','necesitar (base)'],b:['needed','necesitó (pasado)'],tip:'need = termina en "d". needed = "need-ed" (la "ed" suena como "id").'}
  ]},
  {name:'Irregulares (participio)',items:[
    {a:['give','dar (base)'],b:['given','dado (participio)'],tip:'give = "giv". given = "giv-en" (se agrega "-en").'},
    {a:['eat','comer (base)'],b:['eaten','comido (participio)'],tip:'eat = "iit". eaten = "ii-ten" (se agrega "-en").'},
    {a:['take','tomar (base)'],b:['taken','tomado (participio)'],tip:'take = "teik". taken = "tei-ken" (se agrega "-en").'},
    {a:['write','escribir (base)'],b:['written','escrito (participio)'],tip:'write = "rait". written = "ri-ten" (se agrega "-en" y doble "t").'},
    {a:['speak','hablar (base)'],b:['spoken','hablado (participio)'],tip:'speak = "spiik". spoken = "spou-ken" (cambia la vocal).'},
    {a:['break','romper (base)'],b:['broken','roto (participio)'],tip:'break = "breik". broken = "brou-ken" (cambia la vocal).'}
  ]},
  {name:'Tercera persona (-s)',items:[
    {a:['work','trabajar (I/you/we/they)'],b:['works','trabaja (he/she/it)'],tip:'work = sin "s". works = con "s" (suena como "works").'},
    {a:['play','jugar (I/you/we/they)'],b:['plays','juega (he/she/it)'],tip:'play = sin "s". plays = con "s" (suena como "pleiz").'},
    {a:['watch','mirar (I/you/we/they)'],b:['watches','mira (he/she/it)'],tip:'watch = sin "es". watches = con "es" (suena como "wáchiz").'},
    {a:['go','ir (I/you/we/they)'],b:['goes','va (he/she/it)'],tip:'go = sin "es". goes = con "es" (suena como "gouz").'},
    {a:['study','estudiar (I/you/we/they)'],b:['studies','estudia (he/she/it)'],tip:'study = termina en "y". studies = cambia "y" por "ies" (suena como "stádiz").'}
  ]},
  {name:'Gerundio (-ing)',items:[
    {a:['run','correr (base)'],b:['running','corriendo (gerundio)'],tip:'run = vocal corta. running = dobla la "n" (suena como "rá-ning").'},
    {a:['sit','sentarse (base)'],b:['sitting','sentándose (gerundio)'],tip:'sit = vocal corta. sitting = dobla la "t" (suena como "sí-ting").'},
    {a:['make','hacer (base)'],b:['making','haciendo (gerundio)'],tip:'make = termina en "e". making = quita la "e" (suena como "méi-king").'},
    {a:['write','escribir (base)'],b:['writing','escribiendo (gerundio)'],tip:'write = termina en "e". writing = quita la "e" (suena como "rái-ting").'}
  ]}
]},

singularPlural:{name:'Singular & Plural',emoji:'👥',color:'#F43F5E',desc:'Cambios irregulares y difíciles',pairs:true,levels:[
  {name:'Cambios de vocal',items:[
    {a:['man','hombre'],b:['men','hombres'],tip:'man -> men (la "a" se vuelve "e").'},
    {a:['woman','mujer'],b:['women','mujeres'],tip:'woman -> women (la "o" suena como "i").'},
    {a:['foot','pie'],b:['feet','pies'],tip:'foot -> feet (la "oo" se vuelve "ee").'},
    {a:['tooth','diente'],b:['teeth','dientes'],tip:'tooth -> teeth (la "oo" se vuelve "ee").'},
    {a:['mouse','ratón'],b:['mice','ratones'],tip:'mouse -> mice (la "ou" se vuelve "ai").'},
    {a:['goose','ganso'],b:['geese','gansos'],tip:'goose -> geese (la "oo" se vuelve "ee").'}
  ]},
  {name:'Terminaciones',items:[
    {a:['child','niño'],b:['children','niños'],tip:'child -> children (se agrega "-ren").'},
    {a:['person','persona'],b:['people','personas'],tip:'person -> people (cambio total).'},
    {a:['leaf','hoja'],b:['leaves','hojas'],tip:'leaf -> leaves (la "f" se vuelve "ves").'},
    {a:['knife','cuchillo'],b:['knives','cuchillos'],tip:'knife -> knives (la "fe" se vuelve "ves").'},
    {a:['life','vida'],b:['lives','vidas'],tip:'life -> lives (la "fe" se vuelve "ves").'},
    {a:['wife','esposa'],b:['wives','esposas'],tip:'wife -> wives (la "fe" se vuelve "ves").'}
  ]},
  {name:'Sin cambio / Raros',items:[
    {a:['sheep','oveja'],b:['sheep','ovejas'],tip:'sheep es igual en singular y plural.'},
    {a:['fish','pez'],b:['fish','peces'],tip:'fish es igual (aunque "fishes" existe para especies).'},
    {a:['deer','venado'],b:['deer','venados'],tip:'deer es igual en singular y plural.'},
    {a:['series','serie'],b:['series','series'],tip:'series es igual en singular y plural.'},
    {a:['this','este'],b:['these','estos'],tip:'this -> these (la "i" corta se vuelve "ii" larga).'},
    {a:['that','ese'],b:['those','esos'],tip:'that -> those (cambia la vocal final).'},
    {a:['is','es'],b:['are','son'],tip:'is -> are (el verbo cambia).'},
    {a:['was','era'],b:['were','eran'],tip:'was -> were (el verbo cambia).'}
  ]}
]},

contractions:{name:'Contractions / Contracciones',emoji:'🔠',color:'#0EA5E9',desc:'Formas cortas y habla real',pairs:true,levels:[
  {name:'Verbos + not',items:[
    {a:['do not','no hacer'],b:["don't",'no (contracción)'],tip:"do not -> don't (suena como 'dount')."},
    {a:['does not','no hace'],b:["doesn't",'no (contracción)'],tip:"does not -> doesn't (suena como 'dá-zent')."},
    {a:['did not','no hizo'],b:["didn't",'no (contracción)'],tip:"did not -> didn't (suena como 'díd-ent')."},
    {a:['is not','no es'],b:["isn't",'no es (contracción)'],tip:"is not -> isn't (suena como 'í-zent')."},
    {a:['are not','no son'],b:["aren't",'no son (contracción)'],tip:"are not -> aren't (suena como 'ár-ent')."},
    {a:['was not','no era'],b:["wasn't",'no era (contracción)'],tip:"was not -> wasn't (suena como 'wá-zent')."},
    {a:['were not','no eran'],b:["weren't",'no eran (contracción)'],tip:"were not -> weren't (suena como 'wér-ent')."},
    {a:['can not','no poder'],b:["can't",'no puedo (contracción)'],tip:"can not -> can't (suena como 'kant')."},
    {a:['will not','no hará'],b:["won't",'no hará (contracción)'],tip:"will not -> won't (suena como 'wount')."},
    {a:['would not','no haría'],b:["wouldn't",'no haría (contracción)'],tip:"would not -> wouldn't (suena como 'wú-dent')."}
  ]},
  {name:'Pronombres + verbo',items:[
    {a:['I am','yo soy'],b:["I'm",'soy (contracción)'],tip:"I am -> I'm (suena como 'aim')."},
    {a:['you are','tú eres'],b:["you're",'eres (contracción)'],tip:"you are -> you're (suena como 'iur')."},
    {a:['he is','él es'],b:["he's",'él es (contracción)'],tip:"he is -> he's (suena como 'jis')."},
    {a:['she is','ella es'],b:["she's",'ella es (contracción)'],tip:"she is -> she's (suena como 'shis')."},
    {a:['it is','eso es'],b:["it's",'eso es (contracción)'],tip:"it is -> it's (suena como 'its')."},
    {a:['we are','nosotros somos'],b:["we're",'somos (contracción)'],tip:"we are -> we're (suena como 'wuir')."},
    {a:['they are','ellos son'],b:["they're",'son (contracción)'],tip:"they are -> they're (suena como 'deir')."},
    {a:['I will','yo haré'],b:["I'll",'haré (contracción)'],tip:"I will -> I'll (suena como 'ail')."},
    {a:['I have','yo he'],b:["I've",'he (contracción)'],tip:"I have -> I've (suena como 'aiv')."},
    {a:['I would','yo haría'],b:["I'd",'haría (contracción)'],tip:"I would -> I'd (suena como 'aid')."}
  ]}
]}

};
