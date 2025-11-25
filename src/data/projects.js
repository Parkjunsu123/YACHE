// 카이토 온보딩 프로젝트 목록 (2024년 기준)

export const kaitoProjects = {
  'L0/L1': [
    { name: 'Beldex', ticker: 'BDX' },
    { name: 'Fogo', ticker: 'FOGO' },
    { name: 'Irys', ticker: 'IRYS' },
    { name: 'Mavryk', ticker: 'MAVRYK' },
    { name: 'Mitosis', ticker: 'MITOSIS' },
    { name: 'PEAQ', ticker: 'PEAQ' },
    { name: 'Sonic', ticker: 'S' },
    { name: 'XION', ticker: 'XION' }
  ],
  'L2': [
    { name: 'Arbitrum', ticker: 'ARB' },
    { name: 'Katana', ticker: 'KAT' },
    { name: 'Mantle', ticker: 'MNT' },
  ],
  'DeFi': [
    { name: 'Falcon Finance', ticker: 'FALCON' },
    { name: 'MoreMarkets', ticker: 'MOREMARKETS' },
    { name: 'Multipli', ticker: 'MULTIPLI' },
    { name: 'Noble', ticker: 'NOBLE' },
    { name: 'Orderly', ticker: 'ORDERLYNETWORK' },
    { name: 'STBL', ticker: 'STBL' },
    { name: 'Turtle Club', ticker: 'TURTLECLUB' },
  ],
  'ZK': [
    { name: 'Brevis', ticker: 'BREVIS' },
    { name: 'Cysic', ticker: 'CYSIC' },
    { name: 'Miden', ticker: 'MIDEN' },
    { name: 'zkPass', ticker: 'ZKPASS' }
  ],
  'AI': [
    { name: 'Kaito', ticker: 'KAITO' },
    { name: 'Allora', ticker: 'ALLORA' },
    { name: 'Billions Network', ticker: 'BILLIONS' },
    { name: 'Edgen', ticker: 'EDGEN' },
    { name: 'EverlynAI', ticker: 'EVERLYN' },
    { name: 'Kindred', ticker: 'KINDRED' },
    { name: 'Mira Network', ticker: 'MIRA' },
    { name: 'Noya.ai', ticker: 'NOYA' },
    { name: 'OpenGradient', ticker: 'GRADIENT' },
    { name: 'OpenLedger', ticker: 'OPENLEDGER' },
    { name: 'PIP World', ticker: 'PIPWORLD' },
    { name: 'Sentient', ticker: 'SENTIENT' },
  ],
  'Consumer': [
    { name: 'Tria', ticker: 'TRIA' },
    { name: 'Bitdealer', ticker: 'BITDEALER' },
    { name: 'Metawin', ticker: 'METAWIN' },
    { name: 'Puffpaw', ticker: 'PUFFPAW' },
    { name: 'Rainbow', ticker: 'BAINBOW' },
    { name: 'SIXR Cricket', ticker: 'SIXR' },
  ],
  'AI Agents': [
    { name: 'INFINIT', ticker: 'INFINIT' },
    { name: 'Surf', ticker: 'SURF' },
    { name: 'Talus', ticker: 'TALUS' },
    { name: 'Theoriq', ticker: 'THEORIQ' },
    { name: 'Warden Protocol', ticker: 'WARP' },
  ],
  'Culture': [
    { name: 'MemeX', ticker: 'MEMEX' },
    { name: 'Moonbirds', ticker: 'MOONBIRDS' },
  ],
  'BTCFi': [
    { name: 'GOAT Network', ticker: 'GOATNETWORK' },
    { name: 'Lombard', ticker: 'LOMBARD' },
  ],
  'Robotics': [
    { name: 'Openmind', ticker: 'OPENMIND' }
  ],
  'Interop': [
    { name: 'Skate', ticker: 'SKATE' },
    { name: 'Union', ticker: 'UNION' }
  ],
  'RWA': [
    { name: 'KAIO', ticker: 'KAIO' },
    { name: 'Theo', ticker: 'THEO' }
  ],
  'Exchange': [
    { name: 'ApexX', ticker: 'APEX' },
    { name: 'Flipster', ticker: 'FLIPSTER' },
    { name: 'MemeMax', ticker: 'MEMEMAX' },
    { name: 'PARADEX', ticker: 'PARADEX' }
  ],
  'Others': [
    { name: 'Integra', ticker: 'INTEGRA' },
    { name: 'Multibank', ticker: 'MULTIBANK' },
  ]
};

// 플랫폼별 프로젝트 목록 (기존 구조 유지)
export const projectsByPlatform = {
  '카이토': Object.values(kaitoProjects).flat(),
  '쿠키': [
    { 
      name: 'Superform', 
      ticker: 'SUPERFORM',
      logo: 'https://pbs.twimg.com/profile_images/1937588443166416896/4S5X6QSi_400x400.png'
    },
    { 
      name: 'Spaace', 
      ticker: 'SPAACE',
      logo: 'https://pbs.twimg.com/profile_images/1651202265405898753/6PanR3uY_400x400.jpg'
    },
    { 
      name: 'Rayls', 
      ticker: 'RAYLS',
      logo: 'https://pbs.twimg.com/profile_images/1787938574702116864/W_-vmST3_400x400.png'
    },
    { 
      name: 'Tria', 
      ticker: 'TRIA',
      logo: 'https://pbs.twimg.com/profile_images/1947271337057079296/_smOX_4e_400x400.jpg'
    },
    { 
      name: 'vooi', 
      ticker: 'VOOI',
      logo: 'https://pbs.twimg.com/profile_images/1938271243876155393/fXAC9P_h_400x400.jpg'
    },
    { 
      name: 'Almanak', 
      ticker: 'ALMANAK',
      logo: 'https://pbs.twimg.com/profile_images/1933390399005208578/tBlaw9Jj_400x400.png'
    },
    { 
      name: 'TEN', 
      ticker: 'TEN',
      logo: 'https://pbs.twimg.com/profile_images/1948670923596234752/CjzIhnby_400x400.jpg'
    }
  ],
  '월체인': [
    { 
      name: 'Wallchain', 
      ticker: 'WALLCHAIN',
      logo: 'https://app.wallchain.xyz/external-bucket/hashed/logo-url/wallchain_avatar.dc7498f5fd1a031b58f94a29ac39960d.png'
    },
    { 
      name: 'Spaace', 
      ticker: 'SPAACE',
      logo: 'https://app.wallchain.xyz/external-bucket/hashed/logo-url/Spaace_avatar.38f8c5a9ef818037d1e121de02a03561.svg'
    },
    { 
      name: 'Reya', 
      ticker: 'REYA',
      logo: 'https://app.wallchain.xyz/external-bucket/hashed/logo-url/reya_avatar.f5563ec83e5a1109e726fa85dd528083.svg'
    },
    { 
      name: 'HeyElsa', 
      ticker: 'HEYELSA',
      logo: 'https://app.wallchain.xyz/external-bucket/hashed/logo-url/heyelsa_avatar.ac4bef0169bfb52eae4c13823f599e21.png'
    },
    { 
      name: 'idOS', 
      ticker: 'IDOS',
      logo: 'https://app.wallchain.xyz/external-bucket/hashed/logo-url/idOS_avatar.6573b776da29f65636647b5993e4d605.png'
    }
  ],
  '기타': [
    { 
      name: 'Spaace', 
      ticker: 'SPAACE',
      logo: 'https://static.highongrowth.xyz/enterprise/660be03a7851c55d93a0f21e/952586ccac944c93a68b7d9d30c17728.png'
    },
    { 
      name: 'Espresso', 
      ticker: 'ESPRESSO',
      logo: 'https://static.highongrowth.xyz/enterprise/660be03a7851c55d93a0f21e/b420c0ec25914444a1ae4c765dc1982a.png'
    },
    { 
      name: 'edgeX', 
      ticker: 'EDGEX',
      logo: 'https://pbs.twimg.com/profile_images/1976495879319322624/mMUMJ9ym_400x400.jpg'
    },
    { 
      name: 'Ostium', 
      ticker: 'OSTIUM',
      logo: 'https://static.highongrowth.xyz/enterprise/660be03a7851c55d93a0f21e/07f17da3c7de48379a06628a50882f30.jpg'
    },
    { 
      name: 'RIVER', 
      ticker: 'RIVER',
      logo: 'https://pbs.twimg.com/profile_images/1922297594988085248/O8VnTF4-_400x400.jpg'
    }
  ]
};

// 플랫폼 목록
export const platforms = ['카이토', '쿠키', '월체인', '기타'];

// 카이토 카테고리 목록
export const kaitoCategories = Object.keys(kaitoProjects);

// 특정 플랫폼의 프로젝트 목록 가져오기
export const getProjectsByPlatform = (platform) => {
  return projectsByPlatform[platform] || [];
};

// 카이토 카테고리별 프로젝트 가져오기
export const getProjectsByCategory = (category) => {
  return kaitoProjects[category] || [];
};

// 모든 프로젝트 목록 가져오기
export const getAllProjects = () => {
  return Object.values(projectsByPlatform).flat();
};

// 모든 카이토 프로젝트 가져오기
export const getAllKaitoProjects = () => {
  return Object.values(kaitoProjects).flat();
};

// ticker로 프로젝트 찾기
export const findProjectByTicker = (ticker) => {
  const allProjects = getAllProjects();
  return allProjects.find(p => p.ticker === ticker);
};
