/**
 * EXHIBITION_CONFIG - 天穆村地方史展览数据配置区
 * 非技术人员可直接在此修改史料内容、地图坐标与媒体路径。
 */

export interface MapMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description: string;
  images: string[];
  audio?: string;
  theme?: string;
}

export interface MapYearConfig {
  year: string;
  label: string;
  mapType: 'image' | 'tile';
  url: string;
  bounds?: [[number, number], [number, number]]; // For imageOverlay [[south, west], [north, east]]
  maxZoom: number;
  markers: MapMarker[];
}

export const EXHIBITION_CONFIG = {
  siteTitle: "天穆村地方史展览",
  exhibitionUrl: "https://lily-725.github.io/museum/index.html",
  
  // 首页配置
  home: {
    bgImage: "https://picsum.photos/seed/tianmu_history/1920/1080?brightness=0.6",
    mainTitle: "天穆村",
    subTitle: "地方史数字展览",
    intro: "1404 — 2026",
    nav: {
      exhibition: {
        title: "去看展览",
        desc: "泊岸·生根——天穆六百年"
      },
      map: {
        title: "去看地图",
        desc: "1950 年与 2026 年的天穆村地图"
      }
    }
  },

  // 地图页面全局配置
  mapGlobal: {
    initialCenter: [39.198, 117.155] as [number, number],
    initialZoom: 15,
    minZoom: 13,
    maxZoom: 18
  },

  // 时间轴与分年数据
  maps: [
    {
      year: "1950",
      label: "1950 年",
      mapType: "image",
      // 这里建议使用 assets/images/map_1950.jpg
      url: "https://picsum.photos/seed/map1950/2000/2000?grayscale", 
      bounds: [[39.18, 117.13], [39.22, 117.18]], // 需要根据实际地图扫描件进行校准
      maxZoom: 16,
      markers: [
        {
          id: "1950-1",
          title: "天穆村古码头",
          lat: 39.200,
          lng: 117.150,
          description: "这里是1950年代天穆村最繁忙的水路枢纽。当时的大运河河水清澈，往来货船络绎不绝，支撑了村落数百年的繁荣。",
          images: ["https://picsum.photos/seed/dock1/800/600", "https://picsum.photos/seed/dock2/800/600"],
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        },
        {
          id: "1950-2",
          title: "传统礼拜寺址",
          lat: 39.198,
          lng: 117.155,
          description: "1950年代的礼拜寺是村民的精神支柱，建筑保留了典型的明清园林风格与伊斯兰装饰的结合。",
          images: ["https://picsum.photos/seed/mosque1/800/600"],
          audio: ""
        },
        {
          id: "1950-3",
          title: "村北牛羊市口",
          lat: 39.205,
          lng: 117.160,
          description: "天穆村传统的清真餐饮业源头，清晨这里满是牛羊贩卖的吆喝声。",
          images: ["https://picsum.photos/seed/market1/800/600"],
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        },
        {
          id: "1950-4",
          title: "运河人家旧址",
          lat: 39.195,
          lng: 117.152,
          description: "典型的清末民初运河民居，青砖白瓦，临河而建，推窗即见帆影。",
          images: ["https://picsum.photos/seed/house1/800/600"],
          audio: ""
        },
        {
          id: "1950-5",
          title: "红旗小学前身",
          lat: 39.202,
          lng: 117.145,
          description: "当时的简易小学，虽然设施简陋，却是村里走向现代教育的第一步。",
          images: ["https://picsum.photos/seed/school1/800/600"],
          audio: ""
        },
        {
          id: "1950-6",
          title: "大运河转弯处",
          lat: 39.192,
          lng: 117.165,
          description: "运河在这里划出一道美丽的弧线，周边是肥沃的农田，孕育了天穆人的勤劳品质。",
          images: ["https://picsum.photos/seed/river1/800/600"],
          audio: ""
        }
      ]
    },
    {
      year: "2026",
      label: "2026 年",
      mapType: "tile",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      maxZoom: 18,
      markers: [
        {
          id: "2026-1",
          title: "文化广场中心",
          lat: 39.201,
          lng: 117.158,
          description: "2026年的天穆村已成为现代化的都市社区，广场上的数字大屏滚动播放着古村史料。",
          images: ["https://picsum.photos/seed/square1/800/600"],
          audio: ""
        },
        {
          id: "2026-2",
          title: "运河博物馆",
          lat: 39.197,
          lng: 117.154,
          description: "建立在旧码头遗址上的现代化博物馆，完整收纳了从元代至今的运河文化底蕴。",
          images: ["https://picsum.photos/seed/museum1/800/600"],
          audio: ""
        },
        {
          id: "2026-3",
          title: "现代伊斯兰文化中心",
          lat: 39.203,
          lng: 117.162,
          theme: "新月下的成长",
          description: "集宗教、教育、交流于一体的现代建筑群，是天穆村对外交流的新窗口。",
          images: ["https://picsum.photos/seed/center1/800/600"],
          audio: ""
        },
        {
          id: "2026-4",
          title: "美食商业步道",
          lat: 39.199,
          lng: 117.165,
          theme: "牛羊嘉馔",
          description: "继承了数百年的清真美食文化，现在的步道汇集了全国各地的食客。",
          images: ["https://picsum.photos/seed/food1/800/600"],
          audio: ""
        },
        {
          id: "2026-5",
          title: "滨河湿地公园",
          lat: 39.190,
          lng: 117.150,
          theme: "枕河而居",
          description: "曾经的滩涂已变成绿意盎然的市民公园，是人与自然和谐互动的最佳场所。",
          images: ["https://picsum.photos/seed/park1/800/600"],
          audio: ""
        },
        {
          id: "2026-6",
          title: "智慧社区管理处",
          lat: 39.206,
          lng: 117.155,
          theme: "新月下的成长",
          description: "利用数字化手段管理古村地标，实现历史保护与现代生活的无缝结合。",
          images: ["https://picsum.photos/seed/smart1/800/600"],
          audio: ""
        }
      ]
    }
  ] as MapYearConfig[]
};
