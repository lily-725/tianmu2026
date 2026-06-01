/* eslint-disable */
import type { ExhibitionDraft } from './types/drafts';

export const ex02: ExhibitionDraft = {
  id: 'ex-02',
  title: '舟车辐辏：水陆交汇处的行旅生计',
  description: '车马更迭舟船，古道换新坦途，为生活奔波的劲头，却一如既往。',
  prologue:
    '漕船载着粮米货殖泊靠码头，马车碾过青石板路扬起尘土，自行车的铃铛声又摇醒了街巷的清晨；那些水陆交织的道口，曾穿梭着南来北往的商客，也承载着一村人的营生与盼头。\n当蹄声更迭了橹声，当柏油路覆盖了古道，漫漫长路虽换了新颜，那份为生活奔波的劲头，却岁岁年年，一如既往。\n请随我们穿过喧闹的渡口，细数舟车辐辏间的变迁，感受那份独属于天穆的行旅记忆。',
  coverImage: '/import/picture54.jpg',  // 
  units: [
    {
      id: 'u02-01',
      title: '水运舟行：北运河上帆影长',
      description: '自元代以降，北运河作为京畿漕运之咽喉，催生了沿岸繁华，天穆村的兴盛正源于此。',
      artifactIds: ['a-0033', 'a-0034', 'a-0035', 'a-0036', 'a-0037', 'a-0038']
    },
    {
      id: 'u02-02',
      title: '马蹄扬尘：大车辚辚通远陌',
      description: '北运河的干涸与铁路的通车，终结了水运的黄金时代，许多船户另谋出路。',
      artifactIds: ['a-0039', 'a-0040', 'a-0041', 'a-0042']
    },
    {
      id: 'u02-03',
      title: '双轮流转：驶过烽烟与市井',
      description: '自行车，初名单车、脚踏车，天穆乡间俗称“二蹬”。',
      artifactIds: ['a-0043', 'a-0044', 'a-0046', 'a-0047', 'a-0048']
    }
  ]
} as const;

