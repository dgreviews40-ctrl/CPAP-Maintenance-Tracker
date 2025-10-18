export const queryKeys = {
  auth: {
    user: (userId: string) => ['auth', 'user', userId],
  },
  profiles: {
    detail: (userId: string) => ['profiles', 'detail', userId],
  },
  machines: {
    all: (userId: string) => ['machines', 'all', userId],
    customParts: (userId: string) => ['machines', 'customParts', userId],
  },
  parts: {
    userParts: (userId: string) => ['parts', 'userParts', userId],
    customImages: (userId: string) => ['parts', 'customImages', userId],
  },
  maintenance: {
    history: (userId: string) => ['maintenance', 'history', userId],
    schedule: (userId: string) => ['maintenance', 'schedule', userId], // Used for general schedule/stats
  },
  inventory: {
    all: (userId: string) => ['inventory', 'all', userId],
  },
  frequencies: {
    custom: (userId: string) => ['frequencies', 'custom', userId],
  },
};