import mongoose from 'mongoose';
import { DishModel, MEAL_TYPES, DIET_TAGS, ALLERGENS } from '../models/dish.model';
import { IngredientModel } from '../models/ingredient.model';

export interface MealDbMealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface MealDbDetailResponse {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strMealThumb?: string;
  strTags?: string;
  strYoutube?: string;
  strSource?: string;
  [key: string]: any;
}

const THEMEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

// ── Vietnamese Dish Translations, Descriptions & Step-by-Step Guides ─
export const VIETNAMESE_DISH_INFO: Record<string, {
  name: string;
  description: string;
  instructions: string;
  mealType: typeof MEAL_TYPES[number];
  dietTags: (typeof DIET_TAGS[number])[];
  allergens?: (typeof ALLERGENS[number])[];
}> = {
  '53238': {
    name: 'Phở Bò Hà Nội',
    description: 'Món quốc hồn quốc túy của ẩm thực Việt Nam với nước dùng xương hầm thanh ngọt dậy mùi quế hồi, bánh phở mềm thơm và thịt bò thái mỏng đậm đà.',
    instructions: `Bước 1: Nướng xém vỏ gừng tươi và hành tây trên chảo nóng để dậy mùi thơm nức. Rang quế thanh, hoa hồi, hạt ngò và đinh hương trên lửa nhỏ cho đến khi tỏa hương thơm thảo mộc.\n\nBước 2: Cho nước dùng bò cùng các loại thảo mộc đã rang, gừng và hành vào nồi lớn đun sôi. Hạ nhỏ lửa ninh trong 30-40 phút, nêm nước mắm ngon, đường phèn và chút tương cho vừa vị, sau đó lọc lấy phần nước dùng trong vắt.\n\nBước 3: Thịt thăn bò bọc kín để ngăn đá 15 phút cho săn lại rồi dùng dao bén thái lát thật mỏng. Bánh phở chần nhanh qua nước sôi rồi chia đều vào các tô.\n\nBước 4: Xếp thịt bò thái mỏng lên trên mặt bánh phở, rắc hành lá và ngò gai cắt nhỏ. Chan nước dùng sôi sùng sục vào tô để làm chín tái thịt bò, thưởng thức nóng kèm chanh ớt tươi.`,
    mealType: 'an_sang',
    dietTags: ['man'],
    allergens: ['gluten']
  },
  '52828': {
    name: 'Bún Thịt Nướng Chả Giò',
    description: 'Bún tươi ăn kèm thịt heo ướp sả nướng than hoa thơm lừng, chả giò giòn rụm, đồ chua, đậu phộng rang và nước mắm chua ngọt chuẩn vị Nam Bộ.',
    instructions: `Bước 1: Giã nhuyễn hành tím, tỏi, sả tươi cùng đường, tiêu, nước mắm và dầu hào tạo thành hỗn hợp ướp thịt sánh thơm.\n\nBước 2: Thịt heo thái lát mỏng vừa ăn, ướp cùng hỗn hợp gia vị trong ít nhất 30 phút cho ngấm đều.\n\nBước 3: Nướng thịt trên bếp than hoa hoặc nồi chiên không dầu ở 180°C trong 15-20 phút cho đến khi thịt vàng óng, hơi xém cạnh và dậy mùi thơm nức mũi.\n\nBước 4: Cho bún tươi vào tô, xếp thịt nướng, chả giò chiên giòn, rau sống, dưa leo băm, đồ chua và rắc đậu phộng rang lên trên. Chan nước mắm tỏi ớt chua ngọt và thưởng thức.`,
    mealType: 'an_trua',
    dietTags: ['man'],
    allergens: ['dau_phong', 'hai_san']
  },
  '53235': {
    name: 'Thịt Kho Tàu Nước Dừa',
    description: 'Thịt ba rọi thái vuông ninh mềm nhừ trong nước dừa tươi ngọt thanh, béo ngậy cùng trứng vịt lòng đào ngấm đều gia vị đậm đà.',
    instructions: `Bước 1: Thịt ba rọi rửa sạch với muối, cắt miếng vuông dày khoảng 3-4cm. Luộc sơ qua nước sôi rồi vớt ra để ráo.\n\nBước 2: Thắng nước màu từ đường cát cho đến khi chuyển màu cánh gián đẹp mắt. Cho thịt vào xào săn cùng tỏi ớt băm và nước mắm ngon.\n\nBước 3: Đổ nước dừa tươi vào ngập mặt thịt, đun sôi rồi hạ nhỏ lửa đun liu riu trong 40 phút. Cho trứng luộc đã bóc vỏ vào kho cùng.\n\nBước 4: Kho nhỏ lửa đến khi nước thịt sánh kẹo, thịt mềm rục tan trong miệng và trứng chuyển màu nâu cánh gián. Dùng nóng cùng cơm trắng và dưa cải muối chua.`,
    mealType: 'an_toi',
    dietTags: ['man'],
    allergens: ['trung', 'hai_san']
  },
  '53228': {
    name: 'Cá Kho Tộ Đậm Đà',
    description: 'Cá tươi ướp nước mắm, tiêu đen, ớt hiểm kho trong niêu đất đến khi nước kho sánh kẹo, thịt cá săn chắc, ăn cùng cơm trắng nóng hổi tuyệt hảo.',
    instructions: `Bước 1: Cá tươi làm sạch, cắt khúc vừa ăn, rửa sạch với nước muối loãng và thấm khô. Ướp cá cùng nước mắm, đường, hành tỏi băm, tiêu xay và ớt hiểm trong 20 phút.\n\nBước 2: Đun nóng dầu ăn trong niêu đất (hoặc chảo đáy dày), cho đường vào thắng caramen màu cánh gián đẹp mắt.\n\nBước 3: Xếp từng khúc cá vào niêu, đun lửa lớn cho thịt cá săn lại hai mặt rồi đổ phần nước ướp cá cùng chút nước sôi vào đun.\n\nBước 4: Hạ lửa nhỏ liu riu kho trong 25-30 phút cho đến khi nước kho cạn sền sệt, rắc thêm nhiều tiêu đen và hành lá cắt khúc lên trên rồi tắt bếp.`,
    mealType: 'an_toi',
    dietTags: ['man'],
    allergens: ['hai_san']
  },
  '53232': {
    name: 'Gỏi Gà Xé Phay Hành Tây',
    description: 'Thịt gà ta luộc dai ngọt xé sợi trộn cùng hành tây giòn ngọt bớt hăng, rau răm, rau thơm và nước sốt chua ngọt thanh mát.',
    instructions: `Bước 1: Gà ta luộc chín tới cùng vài lát gừng và củ hành nướng. Vớt ra để nguội rồi dùng tay xé thành từng miếng sợi vừa ăn.\n\nBước 2: Hành tây bóc vỏ, thái mỏng tang rồi ngâm ngay vào âu nước đá lạnh có pha chút giấm đường trong 15 phút để hành giòn sần sật và hết sạch vị hăng.\n\nBước 3: Pha nước sốt trộn gỏi gồm: nước cốt chanh, nước mắm ngon, đường cát, tỏi ớt băm nhuyễn theo tỷ lệ chua ngọt vừa khẩu vị.\n\nBước 4: Vớt hành tây để ráo, cho thịt gà xé, hành tây, rau răm, rau húng lủi vào thau lớn. Rưới nước sốt vào trộn nhẹ tay cho ngấm rồi rắc đậu phộng rang giã dập lên trên.`,
    mealType: 'an_trua',
    dietTags: ['man', 'eat_clean', 'low_carb'],
    allergens: ['hai_san']
  },
  '52997': {
    name: 'Bánh Mì Thịt Bò Áp Chảo',
    description: 'Bánh mì giòn rụm kẹp thịt bò xào sả ớt, đồ chua ngâm giấm, dưa leo, ngò rí và sốt mayonnaise sriracha béo cay nồng nàn.',
    instructions: `Bước 1: Thịt bò thái mỏng, ướp cùng tỏi băm, dầu hào, nước tương, dầu mè và hạt tiêu trong 15 phút cho ngấm vị.\n\nBước 2: Làm nóng chảo với chút dầu ăn, phi thơm tỏi rồi cho thịt bò vào áp chảo trên lửa lớn trong 2-3 phút cho vừa chín mềm, giữ nguyên độ ngọt tự nhiên.\n\nBước 3: Pha sốt mayonnaise cùng tương ớt Sriracha để tạo vị sốt béo ngậy, cay nhẹ hấp dẫn.\n\nBước 4: Rạch dọc thân ổ bánh mì nướng nóng giòn, phết sốt bơ trứng và sốt mayonnaise sriracha, kẹp đầy thịt bò, dưa leo, đồ chua cà rốt và vài nhánh ngò rí tươi.`,
    mealType: 'an_sang',
    dietTags: ['man'],
    allergens: ['gluten', 'trung', 'dau_nanh']
  },
  '53249': {
    name: 'Bánh Mì Kẹp Thịt Nướng',
    description: 'Ổ bánh mì Việt Nam nóng giòn đặc ruột kẹp đầy ắp thịt nướng thơm lừng, pate béo ngậy, sốt bơ trứng và dưa leo ngò tươi.',
    instructions: `Bước 1: Thịt heo thái lát vừa ăn, ướp mật ong, sả băm, ngũ vị hương, nước tương và dầu màu điều trong 30 phút.\n\nBước 2: Xếp thịt lên vỉ nướng chín vàng đều hai mặt hoặc áp chảo cho thơm xém cạnh.\n\nBước 3: Ổ bánh mì đem nướng lại cho vỏ ngoài giòn rụm, bổ dọc một bên thân bánh.\n\nBước 4: Phết một lớp pate gan mịn màng, sốt bơ trứng béo ngậy, kẹp thịt nướng, dưa leo, đồ chua và rưới vài giọt nước tương ớt cay nồng.`,
    mealType: 'an_sang',
    dietTags: ['man'],
    allergens: ['gluten', 'trung']
  },
  '53250': {
    name: 'Bánh Mì Chay Nấm & Đậu Hũ',
    description: 'Bánh mì chay thanh đạm với nhân đậu hũ chiên sả, nấm đùi gà áp chảo sốt tương cay và rau thơm tươi mát bổ dưỡng.',
    instructions: `Bước 1: Đậu hũ cắt thanh dài chiên vàng đều các mặt. Nấm đùi gà cắt lát xào nhanh cùng sả ớt băm và hạt nêm nấm chay.\n\nBước 2: Pha nước sốt tương chay đậm đà từ nước tương, tương đen ngọt, ớt tươi và chút đường phèn nấu sôi sánh mịn.\n\nBước 3: Bánh mì nướng nóng giòn tan, rạch dọc bụng bánh.\n\nBước 4: Xếp đậu hũ chiên sả, nấm xào thơm nức, dưa leo, cà rốt chua ngọt, rau ngò tươi và rưới đều nước sốt tương cay vào bên trong.`,
    mealType: 'an_sang',
    dietTags: ['chay', 'eat_clean'],
    allergens: ['gluten', 'dau_nanh']
  },
  '53233': {
    name: 'Mực Chiên Muối Tiêu Ớt',
    description: 'Mực ống tươi cắt khoanh lăn bột chiên vàng giòn rụm bên ngoài, ngọt mọng bên trong, xóc muối tiêu cay tê ăn nhậu cực đỉnh.',
    instructions: `Bước 1: Mực ống tươi làm sạch, khứa vảy rồng rồi cắt khoanh tròn vừa ăn, thấm khô thật kỹ bằng khăn giấy sạch.\n\nBước 2: Lăn mực qua một lớp mỏng bột bắp và bột chiên giòn để tạo độ giòn rụm khi chiên.\n\nBước 3: Đun sôi ngập dầu trên chảo lớn, thả mực vào chiên ngập dầu ở lửa lớn trong 2-3 phút cho bột vàng ruộm, giòn tan rồi vớt ra giấy thấm dầu.\n\nBước 4: Cho mực vào âu lớn cùng muối tiêu, ớt tươi băm và hành lá rang, xóc đều cho gia vị bám đều quanh từng khoanh mực rồi thưởng thức nóng hổi.`,
    mealType: 'mon_nhau',
    dietTags: ['man'],
    allergens: ['hai_san', 'gluten']
  },
  '53242': {
    name: 'Bánh Bao Xá Xíu Hấp',
    description: 'Vỏ bánh bao mềm xốp trắng tinh bọc lấy nhân thịt xá xíu đậm đà, trứng cút bùi béo và nấm mèo giòn sần sật.',
    instructions: `Bước 1: Trộn bột mì, men nở, đường và sữa tươi ấm, nhồi thật kỹ đến khi khối bột mịn dẻo không dính tay, ủ bột 45 phút cho nở gấp đôi.\n\nBước 2: Thịt heo xá xíu thái hạt lựu xào cùng hành tây băm, nấm mèo và sốt xá xíu cho sánh sệt đậm đà.\n\nBước 3: Chia bột thành từng phần nhỏ, cán tròn mỏng mép ngoài, đặt nhân xá xíu vào giữa và túm miệng bánh xếp ly thật khéo léo.\n\nBước 4: Đặt bánh vào xửng hấp có lót giấy nến, hấp cách thủy trên lửa vừa trong 15-20 phút cho bánh nở căng tròn, thơm lừng.`,
    mealType: 'an_vat',
    dietTags: ['man'],
    allergens: ['gluten', 'trung', 'dau_nanh']
  },
  '53227': {
    name: 'Há Cảo Bánh Tráng Hấp',
    description: 'Lớp bánh tráng dẻo trong veo gói gọn phần nhân thịt băm, nấm mèo và hành phi thơm lừng chấm cùng sốt tương ớt chua cay.',
    instructions: `Bước 1: Thịt nạc dăm băm nhuyễn trộn cùng nấm mèo ngâm nở thái sợi, hành tím băm, tiêu đen và hạt nêm.\n\nBước 2: Nhúng bánh tráng qua nước ấm cho vừa mềm dẻo, đặt lên đĩa phẳng.\n\nBước 3: Múc một muỗng nhân thịt vào giữa rồi cuộn tròn hoặc gấp mép tạo hình há cảo xinh xắn.\n\nBước 4: Phết một lớp dầu ăn mỏng lên đĩa hấp, xếp há cảo vào hấp cách thủy trong 10 phút. Rắc hành phi giòn lên trên và chấm cùng nước tương tỏi ớt.`,
    mealType: 'an_vat',
    dietTags: ['man'],
    allergens: ['dau_nanh']
  },
  '53243': {
    name: 'Gỏi Cuốn Tôm Thịt Tươi Sạch',
    description: 'Gỏi cuốn thanh mát với tôm luộc đỏ au, thịt ba chỉ, bún tươi và các loại rau ghém tươi non cuốn bánh tráng, chấm tương đen đậu phộng.',
    instructions: `Bước 1: Tôm tươi luộc chín bóc vỏ, chẻ đôi theo chiều dọc. Thịt ba chỉ luộc chín tới cùng củ hành, thái lát mỏng.\n\nBước 2: Rửa sạch và để ráo các loại rau sống: xà lách, rau thơm, húng quế, hẹ và giá đỗ.\n\nBước 3: Làm ẩm bánh tráng bằng khăn ẩm, xếp lần lượt xà lách, rau thơm, bún tươi, thịt ba chỉ và tôm đỏ au ở mặt ngoài, cuộn chặt tay cùng cọng hẹ xanh.\n\nBước 4: Nấu sốt chấm: phi thơm tỏi, cho tương đen (Hoisin), bơ đậu phộng và chút nước vào đun sôi sánh mịn, rắc đậu phộng rang giã dập và ớt băm lên trên.`,
    mealType: 'an_trua',
    dietTags: ['man', 'eat_clean', 'low_carb'],
    allergens: ['hai_san', 'dau_phong', 'dau_nanh']
  },
  '53244': {
    name: 'Bún Trộn Tôm Nướng Hành Phi',
    description: 'Tô bún tôm nướng thơm khói hòa quyện cùng hành phi giòn tan, rau xà lách, dưa leo băm và nước mắm tỏi ớt đậm đà tươi mát.',
    instructions: `Bước 1: Tôm tươi bóc vỏ chừa đuôi, ướp cùng tỏi băm, tiêu xay, dầu màu điều và hạt nêm trong 15 phút.\n\nBước 2: Nướng tôm trên than hoa hoặc áp chảo lửa lớn cho đến khi tôm cong tròn, đỏ au và dậy mùi thơm ngọt ngào.\n\nBước 3: Phi hành tím thái mỏng với dầu ăn trên lửa nhỏ cho đến khi hành chuyển sang màu vàng giòn rụm.\n\nBước 4: Cho bún tươi vào tô, xếp tôm nướng, rau xà lách, giá đỗ, dưa leo băm, rắc hành phi và chan nước mắm chua ngọt trộn đều thưởng thức.`,
    mealType: 'an_trua',
    dietTags: ['man', 'eat_clean'],
    allergens: ['hai_san', 'dau_phong']
  },
  '53247': {
    name: 'Cá Chẽm Hấp Gừng Hành',
    description: 'Cá chẽm tươi ngọt tự nhiên được hấp chín tới cùng gừng tươi thái chỉ, hành hoa và nước tương dầu mè thơm nức mũi.',
    instructions: `Bước 1: Cá chẽm đánh vảy, làm sạch màng đen, khứa nhẹ vài đường xéo trên thân cá rồi xoa đều muối và rượu trắng để khử tanh.\n\nBước 2: Gừng cạo vỏ thái chỉ mỏng, hành lá cắt khúc dài chẻ sợi ngâm nước đá cho xoăn tít.\n\nBước 3: Nhồi một phần gừng và hành vào bụng cá, xếp cá lên đĩa sâu lòng đem hấp cách thủy trong 12-15 phút đến khi mắt cá lồi trắng và thịt chín tới.\n\nBước 4: Chắt bỏ bớt nước hấp cá tanh, rải gừng hành tươi lên mặt rồi rưới hỗn hợp nước tương, dầu mè và dầu ăn đun sôi sùng sục lên trên để dậy mùi thơm ngào ngạt.`,
    mealType: 'an_toi',
    dietTags: ['man', 'eat_clean'],
    allergens: ['hai_san', 'dau_nanh']
  },
  '53236': {
    name: 'Lẩu Nấm Rau Củ Kiểu Việt',
    description: 'Nồi lẩu thanh tịnh ngọt mát hầm từ bắp cải, ngô ngọt, củ cải trắng kết hợp các loại nấm đông cô, nấm linh chi và đậu phụ non.',
    instructions: `Bước 1: Nấu nước dùng lẩu thanh ngọt bằng cách hầm ngô ngọt cắt khúc, củ cải trắng, cà rốt và mướp hương trong 30 phút trên lửa nhỏ.\n\nBước 2: Sơ chế các loại nấm: nấm hương, nấm kim châm, nấm đùi gà cắt gốc ngâm nước muối loãng rồi rửa sạch, để ráo.\n\nBước 3: Đậu phụ non cắt miếng vuông vừa ăn. Rau cải xoong, cải cúc và mồng tơi nhặt sạch lá non.\n\nBước 4: Nêm nước dùng với chút hạt nêm nấm chay và muối biển. Đặt nồi lẩu lên bếp sôi liu riu, nhúng nấm, đậu phụ và rau xanh ăn kèm bún tươi.`,
    mealType: 'an_toi',
    dietTags: ['chay', 'eat_clean'],
    allergens: ['dau_nanh']
  },
  '53240': {
    name: 'Đậu Hũ Xào Rau Củ & Hạt Điều',
    description: 'Đậu hũ chiên vàng giòn xào nhanh trên lửa lớn cùng bông cải, ớt chuông ngọt và hạt điều bùi béo bổ dưỡng.',
    instructions: `Bước 1: Đậu hũ cắt khối vuông nhỏ, chiên vàng giòn các mặt trên chảo dầu rồi vớt ra để ráo.\n\nBước 2: Bông cải xanh chần nhanh qua nước sôi rồi ngâm nước đá để giữ màu xanh mướt. Ớt chuông cắt miếng vuông vừa ăn.\n\nBước 3: Phi thơm tỏi băm, cho bông cải và ớt chuông vào xào nhanh tay trên lửa lớn, nêm dầu hào chay và nước tương.\n\nBước 4: Trút đậu hũ chiên và hạt điều rang vàng vào đảo đều thêm 1-2 phút cho ngấm sốt rồi rắc tiêu đen lên trên, ăn cùng cơm nóng.`,
    mealType: 'an_trua',
    dietTags: ['chay', 'eat_clean'],
    allergens: ['dau_nanh']
  },
  '53234': {
    name: 'Bún Cá Hồi Nấu Ngót',
    description: 'Canh bún chua thanh dịu nhẹ từ cà chua chín, thơm (dứa), thì là và từng thớ cá hồi béo ngậy ngọt lịm hấp dẫn.',
    instructions: `Bước 1: Cá hồi cắt khúc vừa ăn, rửa sạch với rượu gừng rồi thấm khô. Ướp cá với chút nước mắm, tiêu xay và hành tím băm.\n\nBước 2: Phi thơm hành tím, xào cà chua bổ múi cau và dứa (thơm) cắt lát để tạo màu đỏ cam tự nhiên và vị chua thanh.\n\nBước 3: Đổ nước sôi vào nồi nấu sôi bùng, thả nhẹ từng miếng cá hồi vào đun lửa vừa trong 7-10 phút cho cá chín ngọt, vớt bọt liên tục.\n\nBước 4: Nêm nước mắm và nước cốt chanh cho vừa khẩu vị chua thanh ngọt dịu. Cho bún tươi vào tô, múc cá hồi và nước canh nóng, rắc thì là và hành lá cắt khúc thưởng thức.`,
    mealType: 'an_trua',
    dietTags: ['man', 'eat_clean'],
    allergens: ['hai_san']
  },
  '53239': {
    name: 'Gỏi Tôm Xốt Cay Bang Bang',
    description: 'Món salad tôm tươi giòn ngọt trộn cùng xoài xanh bào sợi, rau mầm và sốt ớt chua cay bùng nổ hương vị.',
    instructions: `Bước 1: Tôm tươi lột vỏ, bỏ chỉ lưng, luộc vừa chín tới trong nước có pha gừng rồi vớt ra ngâm ngay vào nước đá lạnh để tôm giòn sần sật.\n\nBước 2: Xoài xanh, dưa chuột và cà rốt gọt vỏ rồi dùng dao bào sợi mỏng dài.\n\nBước 3: Pha nước sốt Bang Bang cay béo gồm: xốt mayonnaise, tương ớt cay, nước cốt chanh, mật ong và tỏi ớt băm nhuyễn khuấy đều.\n\nBước 4: Xếp rau củ bào sợi và tôm ra đĩa lớn, rưới đều nước sốt chua cay béo ngậy lên trên, rắc mè rang và đậu phộng ăn ngay.`,
    mealType: 'an_vat',
    dietTags: ['man', 'low_carb'],
    allergens: ['hai_san']
  },
  '53245': {
    name: 'Bún Trộn Rau Củ Thanh Đạm',
    description: 'Tô bún chay tươi mát ngập tràn rau xanh, dưa chuột, giá đỗ, đậu phộng rang giã nhỏ chan nước sốt chua ngọt nhẹ bụng.',
    instructions: `Bước 1: Bún tươi chần nhanh qua nước sôi rồi xả lại bằng nước lọc mát, để ráo nước hoàn toàn.\n\nBước 2: Dưa chuột thái sợi, cà rốt thái chỉ, giá đỗ rửa sạch để ráo, xà lách cắt khúc vừa ăn.\n\nBước 3: Nấu nước sốt chua ngọt chay từ: nước tương thanh đạm, đường phèn, nước cốt chanh và tỏi ớt băm.\n\nBước 4: Cho rau sống vào đáy tô, đặt bún tươi lên trên, rải dưa chuột, cà rốt và thật nhiều đậu phộng rang giòn. Chan nước sốt và trộn đều khi ăn.`,
    mealType: 'an_trua',
    dietTags: ['chay', 'eat_clean'],
    allergens: ['dau_phong', 'dau_nanh']
  },
  '53246': {
    name: 'Nộm Bắp Cải Cà Rốt Chua Ngọt',
    description: 'Bắp cải bào sợi mỏng giòn sần sật bóp chua ngọt cùng cà rốt, rau răm cay nhẹ và đậu phộng rang khai vị tuyệt hảo.',
    instructions: `Bước 1: Bắp cải trắng và bắp cải tím rửa sạch, dùng dao thật sắc bào thành sợi mỏng li ti. Cà rốt nạo sợi chỉ.\n\nBước 2: Trộn bắp cải và cà rốt với chút muối hạt trong 5 phút rồi vắt nhẹ tay cho ráo bớt nước để nộm giữ độ giòn tan.\n\nBước 3: Pha nước mắm tỏi ớt chua ngọt chuẩn vị: 2 thìa nước mắm, 2 thìa đường, 2 thìa nước cốt chanh và tỏi ớt băm.\n\nBước 4: Rưới nước sốt vào thau bắp cải, trộn nhẹ đều tay cùng rau răm thái nhỏ. Bày ra đĩa và rắc đậu phộng rang vàng giòn lên mặt.`,
    mealType: 'an_vat',
    dietTags: ['chay', 'eat_clean', 'low_carb'],
    allergens: ['dau_phong']
  },
  '53230': {
    name: 'Bông Cải Chiên Giòn Sốt Nước Mắm',
    description: 'Súp lơ tím và xanh nhúng bột tempura chiên giòn rụm vàng ruộm, chấm kèm nước mắm tỏi ớt chua ngọt kích thích vị giác.',
    instructions: `Bước 1: Bông cải xanh và súp lơ cắt miếng nhỏ vừa miệng ăn, ngâm nước muối loãng 10 phút rồi vớt ra để ráo.\n\nBước 2: Khuấy đều bột chiên giòn tempura với nước đá thật lạnh thành hỗn hợp sánh lỏng (nước đá lạnh giúp lớp bột giòn xốp lâu hơn).\n\nBước 3: Nhúng từng miếng bông cải vào bột, thả vào chảo dầu sôi chiên vàng giòn rụm ở nhiệt độ vừa rồi vớt ra giấy thấm dầu.\n\nBước 4: Bày bông cải chiên giòn ra đĩa, chấm cùng nước mắm tỏi ớt chua ngọt pha sánh kẹo hoặc sốt tương ớt mayonnaise.`,
    mealType: 'an_vat',
    dietTags: ['man'],
    allergens: ['gluten', 'hai_san']
  },
  '53241': {
    name: 'Nem Cuốn Rau Củ Chay',
    description: 'Những cuốn nem chay giòn rụm với nhân khoai môn, mộc nhĩ, cà rốt và miến dong thơm lừng chấm tương ớt.',
    instructions: `Bước 1: Khoai môn và cà rốt bào sợi nhuyễn. Mộc nhĩ ngâm nở thái chỉ mỏng. Miến dong ngâm mềm cắt khúc ngắn 2cm.\n\nBước 2: Trộn đều các nguyên liệu nhân cùng hạt nêm chay, tiêu xay và hành boa-rô băm thơm.\n\nBước 3: Trải bánh tráng ra mặt phẳng, múc nhân vào giữa rồi cuốn tròn chặt tay, gập hai đầu mép bánh kín khít.\n\nBước 4: Đun nóng chảo dầu trên lửa vừa, cho chả giò vào chiên ngập dầu đến khi vỏ ngoài vàng ruộm, giòn tan. Dùng nóng kèm rau sống và sốt tương ớt chua ngọt.`,
    mealType: 'an_vat',
    dietTags: ['chay', 'eat_clean'],
    allergens: ['gluten', 'dau_nanh']
  },
  '53237': {
    name: 'Gỏi Tai Heo Trộn Thính',
    description: 'Tai heo luộc giòn sần sật trộn đều cùng thính gạo rang vàng, lá chanh thái chỉ, ớt tươi và tỏi băm thơm phức làm món nhậu khoái khẩu.',
    instructions: `Bước 1: Tai heo cạo sạch lông, xát muối và chanh khử sạch mùi hôi. Cho vào nồi luộc chín tới cùng củ hành và nhánh gừng đập dập.\n\nBước 2: Vớt tai heo ra ngâm ngay vào âu nước đá lạnh 10 phút để tai heo giòn sần sật và trắng muốt, sau đó dùng dao sắc thái lát thật mỏng.\n\nBước 3: Cho tai heo vào âu lớn, nêm chút nước mắm ngon, bột ngọt, tỏi băm và lá chanh thái chỉ sợi nhỏ bóp đều cho thấm vị.\n\nBước 4: Rắc từ từ thính gạo rang vàng thơm vào âu, vừa rắc vừa trộn đều tay để thính bám đều quanh từng miếng tai heo. Bày ra đĩa ăn kèm lá sung non và tương ớt cay.`,
    mealType: 'mon_nhau',
    dietTags: ['man', 'low_carb'],
    allergens: ['hai_san']
  },
  '53229': {
    name: 'Bún Bò Bắp Trộn Rau Thơm',
    description: 'Bún tươi kết hợp thịt bắp bò áp chảo mềm ngọt, rau mùi thơm nồng, giá giòn và sốt giấm tỏi ớt đặc trưng vị Bắc.',
    instructions: `Bước 1: Bắp bò hoa thái lát mỏng, ướp cùng tỏi băm nhuyễn, dầu hào, tiêu đen xay và chút dầu ăn trong 20 phút.\n\nBước 2: Làm nóng chảo gang trên lửa thật lớn, trút bắp bò vào đảo nhanh tay trong 2 phút cho thịt vừa chín tái mềm ngọt, không bị dai.\n\nBước 3: Pha nước giấm tỏi ớt chua ngọt dịu: giấm gạo, nước mắm, đường, nước lọc ấm và tỏi ớt đập dập.\n\nBước 4: Xếp bún tươi vào tô, cho bắp bò xào nóng hổi lên trên cùng rau mùi, giá đỗ, hành phi và rắc đậu phộng rang giòn. Chan nước giấm chua ngọt và thưởng thức.`,
    mealType: 'an_trua',
    dietTags: ['man'],
    allergens: ['hai_san', 'dau_phong']
  },
  '53231': {
    name: 'Cừu Hầm Khoai Lang Kiểu Việt',
    description: 'Bắp cừu hầm mềm tan trong nước xốt quế, hồi, sả ớt cùng khoai lang vàng bùi ngọt đậm đà phong vị ấm cúng.',
    instructions: `Bước 1: Bắp cừu rửa sạch với rượu gừng khử mùi gây, chặt miếng vuông vừa ăn. Ướp thịt cùng sả băm, ngũ vị hương, tỏi ớt và nước mắm trong 30 phút.\n\nBước 2: Áp chảo thịt cừu trên lửa lớn cho săn vàng các mặt rồi trút ra đĩa riêng.\n\nBước 3: Cho nước dùng vào nồi cùng thanh quế, hoa hồi đun sôi, thả thịt cừu vào hầm nhỏ lửa trong 45 phút cho thịt mềm nhừ thơm phức.\n\nBước 4: Cho khoai lang cắt khúc vào hầm thêm 15 phút đến khi khoai bùi ngọt chín tới. Múc ra tô sâu lòng, rắc ngò rí thái nhỏ ăn cùng bánh mì nóng giòn.`,
    mealType: 'an_toi',
    dietTags: ['man'],
    allergens: []
  },
  '53251': {
    name: 'Bánh Mì Nướng Thịt Băm Thơm Giòn',
    description: 'Bánh mì nướng phủ thịt băm ướp gia vị thảo mộc cay thơm, ăn kèm hành ngò và chanh tươi giải ngấy.',
    instructions: `Bước 1: Thịt heo hoặc thịt bò băm nhuyễn trộn đều cùng hành tây băm, tỏi, ớt bột, tiêu đen, dầu ô liu và ngò tây cắt nhỏ.\n\nBước 2: Dùng muỗng phết đều một lớp thịt băm mỏng lên bề mặt miếng bánh mì cắt lát.\n\nBước 3: Cho bánh vào lò nướng hoặc nồi chiên không dầu ở 190°C trong 8-10 phút cho thịt chín săn vàng, thơm lừng và đế bánh mì giòn rụm.\n\nBước 4: Lấy bánh ra, rắc hành lá tươi và vắt thêm vài giọt nước cốt chanh tươi để cân bằng vị béo, thưởng thức nóng giòn.`,
    mealType: 'an_vat',
    dietTags: ['man'],
    allergens: ['gluten']
  }
};

// ── Vietnamese Ingredient Translation Map ──────────────────────────
export const INGREDIENT_TRANSLATIONS: Record<string, string> = {
  // Meats & Seafoods
  'beef': 'Thịt bò',
  'beef stock': 'Nước dùng bò',
  'sirloin steak': 'Thịt thăn bò',
  'minced beef': 'Thịt bò băm',
  'steak': 'Thịt bò bít tết',
  'pork': 'Thịt heo',
  'minced pork': 'Thịt heo băm',
  'pork chops': 'Sườn heo',
  'pork belly': 'Thịt ba rọi heo',
  'bacon': 'Thịt ba rọi hun khói (Bacon)',
  'chicken': 'Thịt gà',
  'chicken breast': 'Ức gà',
  'chicken thighs': 'Đùi gà',
  'chicken stock': 'Nước dùng gà',
  'turkey': 'Thịt gà tây',
  'lamb shanks': 'Bắp cừu',
  'lamb stock': 'Nước dùng cừu',
  'prawns': 'Tôm tươi',
  'shrimp': 'Tôm tươi',
  'squid': 'Mực ống tươi',
  'salmon': 'Cá hồi tươi',
  'sea bass': 'Cá chẽm',
  'trout': 'Cá hồi / Cá hương',
  'fish': 'Cá tươi',

  // Sauces & Condiments
  'fish sauce': 'Nước mắm',
  'soy sauce': 'Nước tương',
  'dark soy sauce': 'Hắc xì dầu',
  'oyster sauce': 'Dầu hào',
  'hoisin sauce': 'Sốt tương đen (Hoisin)',
  'hotsauce': 'Tương ớt cay nồng',
  'sriracha': 'Tương ớt Sriracha',
  'chilli sauce': 'Tương ớt',
  'mayonnaise': 'Xốt Mayonnaise',
  'hummus': 'Sốt đậu gà Hummus',
  'peanut butter': 'Bơ đậu phộng',
  'thai red curry paste': 'Xốt cà ri đỏ Thái Lan',
  'tomato puree': 'Cà chua nghiền cô đặc',

  // Herbs, Spices & Aromatics
  'garlic': 'Tỏi',
  'ginger': 'Gừng tươi',
  'onion': 'Hành tây',
  'onions': 'Hành tây',
  'red onion': 'Hành tây tím',
  'spring onions': 'Hành lá',
  'shallots': 'Hành tím',
  'challots': 'Hành tím',
  'chilli': 'Ớt tươi',
  'chillies': 'Ớt tươi',
  'red chilli': 'Ớt đỏ',
  'green chilli': 'Ớt xanh',
  'birds-eye chillies': 'Ớt hiểm cay',
  'lemongrass': 'Sả tươi',
  'basil': 'Rau húng quế',
  'thai basil': 'Húng quế',
  'coriander': 'Ngò rí (Rau mùi)',
  'coriander seeds': 'Hạt ngò',
  'cilantro': 'Ngò rí',
  'mint': 'Rau húng lủi',
  'parsley': 'Ngò tây (Mùi tây)',
  'star anise': 'Hoa hồi',
  'cinnamon stick': 'Quế thanh',
  'cinnamon': 'Bột quế',
  'cloves': 'Đinh hương',
  'allspice': 'Gia vị tiêu Jamaica (Allspice)',
  'ground cumin': 'Bột thì là (Cumin)',
  'szechuan peppercorns': 'Hoa tiêu Tứ Xuyên',
  'pepper': 'Tiêu đen xay',
  'black pepper': 'Tiêu đen xay',
  'white pepper': 'Tiêu sọ trắng',

  // Seasonings & Liquids
  'palm sugar': 'Đường thốt nốt',
  'sugar': 'Đường cát',
  'brown sugar': 'Đường nâu',
  'caster sugar': 'Đường tinh luyện',
  'clear honey': 'Mật ong nguyên chất',
  'salt': 'Muối tinh',
  'sea salt': 'Muối biển',
  'rice vinegar': 'Giấm gạo',
  'vinegar': 'Giấm ăn',
  'sesame oil': 'Dầu mè',
  'sesame seed oil': 'Dầu mè thơm',
  'vegetable oil': 'Dầu ăn thực vật',
  'sunflower oil': 'Dầu hướng dương',
  'olive oil': 'Dầu ô liu',
  'rapeseed oil': 'Dầu hạt cải',
  'ground nut oil': 'Dầu đậu phộng (Dầu lạc)',
  'coconut milk': 'Nước cốt dừa',
  'coconut water': 'Nước dừa tươi',
  'vegetable stock': 'Nước dùng rau củ quả',
  'water': 'Nước lọc',

  // Dairy & Eggs
  'egg': 'Trứng gà',
  'eggs': 'Trứng gà',
  'duck egg': 'Trứng vịt',
  'butter': 'Bơ lạt',
  'milk': 'Sữa tươi',

  // Vegetables & Tofu
  'tofu': 'Đậu phụ',
  'tempeh': 'Tương đậu nén Tempeh',
  'cucumber': 'Dưa chuột (Dưa leo)',
  'carrot': 'Cà rốt',
  'carrots': 'Cà rốt',
  'tomato': 'Cà chua chín mọng',
  'bean sprouts': 'Giá đỗ',
  'broccoli': 'Súp lơ xanh',
  'purple sprouting broccoli': 'Bông cải tím',
  'cabbage': 'Bắp cải',
  'red cabbage': 'Bắp cải tím',
  'bok choi': 'Cải thìa (Cải chíp)',
  'pak choi': 'Cải thìa tươi',
  'courgettes': 'Bí ngòi xanh',
  'butternut squash': 'Bí đỏ hồ lô',
  'celery': 'Cần tây',
  'green beans': 'Đậu cô ve (Đậu que)',
  'petit pois': 'Đậu Hà Lan hạt non',
  'radish': 'Củ cải trắng / Củ cải đỏ',
  'lettuce': 'Xà lách',
  'salad greens': 'Rau xà lách tươi',
  'raw vegetables': 'Rau sống các loại',
  'shiitake mushrooms': 'Nấm hương (Nấm đông cô)',
  'sweetcorn': 'Bắp (ngô) ngọt',
  'sweet potatoes': 'Khoai lang',
  'potatoes': 'Khoai tây',

  // Nuts & Seeds
  'cashew nuts': 'Hạt điều rang',
  'peanuts': 'Đậu phộng (Lạc)',
  'roasted peanut': 'Đậu phộng rang vàng',
  'soya bean': 'Hạt đậu nành',
  'sesame seeds': 'Vừng (mè) trắng rang',
  'sesame seed': 'Vừng (mè) trắng rang',

  // Fruits
  'lime': 'Chanh tươi',
  'lime juice': 'Nước cốt chanh',
  'lemon': 'Chanh vàng',

  // Carbs, Flours & Noodles
  'rice noodles': 'Bún tươi / Phở',
  'vermicelli': 'Bún tươi / Miến',
  'brown rice noodle': 'Bún gạo lứt',
  'rice paper': 'Bánh tráng cuốn',
  'rice': 'Cơm trắng / Gạo thơm',
  'jasmine rice': 'Gạo thơm lài',
  'rice flour pancakes': 'Bánh xèo bột gạo giòn',
  'flour': 'Bột mì',
  'plain flour': 'Bột mì đa dụng',
  'white bread mix': 'Bột mì làm bánh mì trắng',
  'fast action yeast': 'Men nở làm bánh',
  'cornstarch': 'Bột bắp (ngô)',
  'corn flour': 'Bột bắp',
  'bread': 'Bánh mì giòn',
  'baguette': 'Bánh mì que',
  'pretzels': 'Bánh xoắn mặn Pretzel'
};

// ── Normalize Ingredient Name ──────────────────────────────────────
export const normalizeIngredientName = (rawName: string): string => {
  const clean = rawName.trim().replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();
  
  if (INGREDIENT_TRANSLATIONS[lower]) {
    return INGREDIENT_TRANSLATIONS[lower];
  }

  // Check partial key matches
  for (const [key, translated] of Object.entries(INGREDIENT_TRANSLATIONS)) {
    if (lower === key || lower.startsWith(key + ' ') || lower.endsWith(' ' + key)) {
      return translated;
    }
  }

  // Fallback: capitalize words nicely
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

// ── Detect Allergens From Ingredients ───────────────────────────────
export const detectAllergens = (ingredients: string[]): (typeof ALLERGENS[number])[] => {
  const detected = new Set<typeof ALLERGENS[number]>();
  const text = ingredients.join(' ').toLowerCase();

  if (/shrimp|prawn|squid|fish|crab|salmon|trout|sea bass|seafood|oyster/.test(text)) {
    detected.add('hai_san');
  }
  if (/peanut/.test(text)) {
    detected.add('dau_phong');
  }
  if (/egg/.test(text)) {
    detected.add('trung');
  }
  if (/milk|cheese|butter|cream|dairy/.test(text)) {
    detected.add('sua');
  }
  if (/flour|bread|baguette|wheat|pasta|noodle|yeast/.test(text)) {
    detected.add('gluten');
  }
  if (/soy|tofu|edamame/.test(text)) {
    detected.add('dau_nanh');
  }

  return Array.from(detected);
};

// ── Detect Diet Tags From Category and Title ────────────────────────
export const detectDietTags = (
  category?: string,
  mealName?: string,
  allergens?: string[]
): (typeof DIET_TAGS[number])[] => {
  const text = `${category || ''} ${mealName || ''}`.toLowerCase();
  const tags: (typeof DIET_TAGS[number])[] = [];

  const isVegetarian = /vegetarian|vegan|chay|veggie/.test(text);
  if (isVegetarian) {
    tags.push('chay', 'eat_clean');
  } else {
    tags.push('man');
  }

  if (/salad|gỏi|nộm|healthy|clean|bún trộn/.test(text)) {
    if (!tags.includes('eat_clean')) tags.push('eat_clean');
    if (!tags.includes('low_carb')) tags.push('low_carb');
  }

  return tags;
};

// ── Detect Meal Type From Category and Title ────────────────────────
export const detectMealType = (
  category?: string,
  mealName?: string
): typeof MEAL_TYPES[number] => {
  const text = `${category || ''} ${mealName || ''}`.toLowerCase();

  if (/pho|phở|banh mi|bánh mì|breakfast|sáng|omelette/.test(text)) {
    return 'an_sang';
  }
  if (/squid|mực|beer|nhậu|muối tiêu|rang muối|cánh gà/.test(text)) {
    return 'mon_nhau';
  }
  if (/bánh bao|há cảo|tempura|salad|gỏi|nộm|snack|rolls|cuốn|bánh/.test(text)) {
    return 'an_vat';
  }
  if (/bun|bún|noodle|soup|lunch|trưa/.test(text)) {
    return 'an_trua';
  }
  return 'an_toi';
};

// ── TheMealDB API Client ────────────────────────────────────────────
export const theMealDbService = {
  /**
   * Fetch all Vietnamese meals from TheMealDB
   */
  async fetchVietnameseMealList(): Promise<MealDbMealSummary[]> {
    const res = await fetch(`${THEMEALDB_BASE}/filter.php?a=Vietnamese`);
    if (!res.ok) throw new Error(`TheMealDB API error: ${res.statusText}`);
    const data = await res.json() as { meals?: MealDbMealSummary[] };
    return data.meals || [];
  },

  /**
   * Lookup full meal details by ID
   */
  async lookupMealById(idMeal: string): Promise<MealDbDetailResponse | null> {
    const res = await fetch(`${THEMEALDB_BASE}/lookup.php?i=${idMeal}`);
    if (!res.ok) throw new Error(`TheMealDB API error: ${res.statusText}`);
    const data = await res.json() as { meals?: MealDbDetailResponse[] };
    return data.meals && data.meals.length > 0 ? data.meals[0] : null;
  },

  /**
   * Search meals by name
   */
  async searchMeals(term: string): Promise<MealDbDetailResponse[]> {
    const res = await fetch(`${THEMEALDB_BASE}/search.php?s=${encodeURIComponent(term)}`);
    if (!res.ok) throw new Error(`TheMealDB API error: ${res.statusText}`);
    const data = await res.json() as { meals?: MealDbDetailResponse[] };
    return data.meals || [];
  },

  /**
   * Sync and ingest meals into MongoDB with upserted ingredients
   */
  async syncVietnameseMeals(createdByUserId?: string) {
    // 1. Determine creator user ID
    let creatorId: mongoose.Types.ObjectId;
    if (createdByUserId && mongoose.Types.ObjectId.isValid(createdByUserId)) {
      creatorId = new mongoose.Types.ObjectId(createdByUserId);
    } else {
      // Find first user in DB or create fallback
      const existingUser = await mongoose.connection.collection('users').findOne({});
      if (existingUser) {
        creatorId = existingUser._id as mongoose.Types.ObjectId;
      } else {
        creatorId = new mongoose.Types.ObjectId();
      }
    }

    const summaries = await this.fetchVietnameseMealList();
    const results = {
      totalFound: summaries.length,
      dishesUpserted: 0,
      ingredientsUpserted: 0,
      errors: [] as string[]
    };

    const ingredientCache = new Map<string, mongoose.Types.ObjectId>();

    for (const summary of summaries) {
      try {
        const detail = await this.lookupMealById(summary.idMeal);
        if (!detail) continue;

        // Extract ingredients and quantities (1 to 20)
        const extractedRawIngredients: { name: string; quantity: string }[] = [];
        for (let i = 1; i <= 20; i++) {
          const rawIng = (detail[`strIngredient${i}`] as string || '').trim();
          const rawMeasure = (detail[`strMeasure${i}`] as string || '').trim();
          if (rawIng) {
            extractedRawIngredients.push({
              name: rawIng,
              quantity: rawMeasure
            });
          }
        }

        // Upsert ingredients into IngredientModel
        const dishIngredients: {
          ingredientId: mongoose.Types.ObjectId;
          name: string;
          quantity?: string;
        }[] = [];

        for (const raw of extractedRawIngredients) {
          const vietnameseName = normalizeIngredientName(raw.name);
          let ingredientId = ingredientCache.get(vietnameseName.toLowerCase());

          if (!ingredientId) {
            let ingDoc = await IngredientModel.findOne({
              name: { $regex: new RegExp(`^${vietnameseName.trim()}$`, 'i') }
            });

            if (!ingDoc) {
              ingDoc = await IngredientModel.create({
                name: vietnameseName.trim().toLowerCase()
              });
              results.ingredientsUpserted++;
            }

            ingredientId = ingDoc._id as mongoose.Types.ObjectId;
            ingredientCache.set(vietnameseName.toLowerCase(), ingredientId);
          }

          dishIngredients.push({
            ingredientId,
            name: vietnameseName,
            quantity: raw.quantity || undefined
          });
        }

        // Metadata override or smart auto-detection
        const predefined = VIETNAMESE_DISH_INFO[detail.idMeal];
        const rawIngredientNames = extractedRawIngredients.map((ing) => ing.name);

        const dishName = predefined?.name || detail.strMeal;
        const dishDescription = predefined?.description ||
          `Món ăn thơm ngon chuẩn vị ẩm thực ${detail.strArea || 'Việt Nam'}, chế biến với các nguyên liệu tươi ngon theo công thức TheMealDB.`;
        const instructions = predefined?.instructions || detail.strInstructions || '';
        const mealType = predefined?.mealType || detectMealType(detail.strCategory, detail.strMeal);
        const allergens = predefined?.allergens || detectAllergens(rawIngredientNames);
        const dietTags = predefined?.dietTags || detectDietTags(detail.strCategory, detail.strMeal, allergens);

        // Upsert into DishModel by mealDbId or name
        await DishModel.findOneAndUpdate(
          {
            $or: [
              { mealDbId: detail.idMeal },
              { name: dishName }
            ]
          },
          {
            $set: {
              name: dishName,
              description: dishDescription,
              instructions,
              imageUrl: detail.strMealThumb || '',
              youtubeUrl: detail.strYoutube || '',
              mealDbId: detail.idMeal,
              area: detail.strArea || 'Vietnamese',
              category: detail.strCategory || 'Món chính',
              mealType,
              dietTags,
              allergens,
              ingredients: dishIngredients,
              createdBy: creatorId,
              isDeleted: false
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        results.dishesUpserted++;
      } catch (err: any) {
        results.errors.push(`Error syncing meal ${summary.idMeal} (${summary.strMeal}): ${err.message}`);
      }
    }

    return results;
  }
};
