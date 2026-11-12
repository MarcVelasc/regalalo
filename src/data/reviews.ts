import type { Review } from '../types'

type R = [sellerId: string, productId: string, author: string, rating: number, comment: string, date: string]

const raw: R[] = [
  // Floristería Primavera · promedio alto
  ['s1', 'p2', 'Camila R.', 5, 'Llegaron hermosas y a tiempo. Mi novia no podía creerlo.', '2026-09-20'],
  ['s1', 'p1', 'Marcelo P.', 5, 'Los girasoles estaban frescos y el empaque precioso. La atención fue súper buena.', '2026-09-14'],
  ['s1', 'p3', 'Daniela V.', 5, 'Hermoso arreglo, tal cual la foto. Lo volvería a pedir.', '2026-09-22'],
  ['s1', 'p2', 'Jorge L.', 4, 'Muy lindas las rosas, solo se retrasó 30 minutos la entrega.', '2026-08-30'],
  ['s1', 'p5', 'Valeria S.', 5, 'La suculenta llegó perfecta y la tarjetita fue un lindo detalle.', '2026-08-18'],
  ['s1', 'p4', 'Rosa M.', 5, 'Mi mamá quedó encantada, las flores secas se ven preciosas.', '2026-07-25'],
  ['s1', 'p1', 'Luis F.', 4, 'Muy buen ramo, aunque esperaba un poco más de follaje.', '2026-07-10'],

  // Detalles Lucía
  ['s2', 'p6', 'Andrea T.', 5, 'El amigurumi quedó idéntico al perrito de mi hija. Lloró de felicidad.', '2026-09-18'],
  ['s2', 'p7', 'Sebastián C.', 5, 'La tarjeta pop-up es una obra de arte. Todos preguntaron dónde la compré.', '2026-09-02'],
  ['s2', 'p8', 'Paola G.', 5, 'La pulsera quedó bonita y resistente. Súper recomendada.', '2026-08-21'],
  ['s2', 'p9', 'Natalia B.', 4, 'El bordado es muy fino. Tardó un día más de lo prometido, pero valió la pena.', '2026-08-05'],
  ['s2', 'p10', 'Gabriela H.', 5, 'La vela huele delicioso y la presentación es de regalo.', '2026-07-19'],
  ['s2', 'p6', 'Rodrigo Q.', 4, 'Muy lindo trabajo, comunicación excelente durante todo el pedido.', '2026-07-02'],

  // Garage Hot Wheels · el mejor puntuado
  ['s3', 'p11', 'Fernando A.', 5, 'El ramo de autitos fue el éxito del cumpleaños de mi hijo. Impresionante.', '2026-09-25'],
  ['s3', 'p12', 'Carla D.', 5, 'Llegó en su blíster impecable. Mi esposo lo está coleccionando.', '2026-09-15'],
  ['s3', 'p14', 'Ricardo N.', 5, 'La caja sorpresa trajo un Treasure Hunt. No me lo esperaba, ¡genial!', '2026-09-01'],
  ['s3', 'p13', 'Mónica E.', 5, 'Mis sobrinos pasaron toda la tarde con la pista. Excelente regalo.', '2026-08-12'],
  ['s3', 'p11', 'Alejandro K.', 5, 'Rodrigo es un crack, me asesoró y armó el ramo con los modelos que pedí.', '2026-07-28'],
  ['s3', 'p12', 'Silvia J.', 4, 'Muy bien todo, el envío tardó un día más de lo previsto.', '2026-07-08'],

  // Dulce Tentación · bueno pero con altibajos
  ['s4', 'p15', 'Lorena Z.', 5, 'Los bombones estaban deliciosos y la caja es preciosa.', '2026-09-21'],
  ['s4', 'p16', 'Pablo I.', 4, 'La torta riquísima. Llegó un poco inclinada pero sabía excelente.', '2026-09-09'],
  ['s4', 'p17', 'Karen O.', 5, 'El desayuno sorpresa fue lo mejor. Llegó a las 7:30, justo como pedí.', '2026-08-25'],
  ['s4', 'p18', 'Diego M.', 4, 'El panetón estaba muy rico y fresco. Algo caro, pero de calidad.', '2026-08-02'],
  ['s4', 'p15', 'Fabiola U.', 3, 'Buen sabor, pero faltaron dos bombones en la caja. Me compensaron después.', '2026-07-15'],
  ['s4', 'p19', 'Esteban W.', 5, 'Las galletas parecían de revista y estaban crujientes. Mis hijos felices.', '2026-06-30'],
  ['s4', 'p17', 'Teresa Y.', 4, 'Todo muy bien, solo que la entrega llegó 20 minutos tarde.', '2026-06-12'],

  // Taller Mi Rincón
  ['s5', 'p21', 'Juan C.', 5, 'La taza quedó nítida, los colores de la foto idénticos al original.', '2026-09-19'],
  ['s5', 'p22', 'Ernesto B.', 4, 'La billetera es de buena calidad, el grabado quedó prolijo.', '2026-09-05'],
  ['s5', 'p23', 'Adriana P.', 5, 'El cuadro con nuestra fecha quedó hermoso. Se nota el cuidado.', '2026-08-17'],
  ['s5', 'p24', 'Mauricio L.', 4, 'Llaveros bonitos, aunque tardaron 3 días más de lo indicado.', '2026-08-01'],
  ['s5', 'p21', 'Brenda S.', 3, 'La taza llegó bien, pero la foto salió un poco oscura. Respondieron rápido.', '2026-07-12'],
  ['s5', 'p25', 'Cristian R.', 5, 'El álbum es un tesoro. Mi mamá no paró de llorar al verlo.', '2026-06-28'],

  // Canastas Don Pepe
  ['s6', 'p26', 'Raúl V.', 5, 'La canasta para papá estuvo completísima, todo de calidad.', '2026-09-23'],
  ['s6', 'p27', 'Isabel F.', 4, 'El café huele increíble. La prensa francesa viene en caja sencilla.', '2026-09-10'],
  ['s6', 'p29', 'Liliana C.', 5, 'La caja spa fue un acierto total para mi mamá. Súper bonita.', '2026-08-27'],
  ['s6', 'p28', 'Gustavo T.', 4, 'La canasta navideña llegó bien presentada, algo más de dulces no hubiera estado mal.', '2026-08-04'],
  ['s6', 'p26', 'Mariela A.', 5, 'Atención excelente. Don Pepe me llamó para confirmar la dirección.', '2026-07-21'],
  ['s6', 'p30', 'Hugo N.', 4, 'Buen kit, herramientas resistentes. Lo recogí y estaba listo a la hora.', '2026-07-03'],
]

export const REVIEWS: Review[] = raw.map(([sellerId, productId, author, rating, comment, date], i) => ({
  id: `r${i + 1}`,
  sellerId,
  productId,
  author,
  rating,
  comment,
  date,
}))
