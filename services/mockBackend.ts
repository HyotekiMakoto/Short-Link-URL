import { User, ShortLink, UserRole, DailyStat } from '../types';

const USERS_KEY = 'shortai_users';
const LINKS_KEY = 'shortai_links';
const LANG_KEY = 'shortai_lang'; // Distinct "DB file" for language
const SESSION_KEY = 'shortai_session';

// Helper to generate mock history
const generateMockHistory = (days: number): DailyStat[] => {
  const history: DailyStat[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    history.push({
      date: d.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10)
    });
  }
  return history;
};

// Initialize with some data if empty
const initData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@shortai.com',
      name: 'Quản trị viên',
      role: UserRole.ADMIN,
      password: 'admin', 
      createdAt: new Date().toISOString()
    };
    const demoUser: User = {
      id: 'user-1',
      email: 'user@shortai.com',
      name: 'Nguyễn Văn A',
      role: UserRole.USER,
      password: 'user123',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([adminUser, demoUser]));
  }

  if (!localStorage.getItem(LINKS_KEY)) {
    const demoLinks: ShortLink[] = [
      {
        id: 'link-1',
        originalUrl: 'https://www.google.com/search?q=react+typescript',
        slug: 'react-search',
        creatorId: 'user-1',
        clicks: 42,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        lastClickedAt: new Date().toISOString(),
        history: generateMockHistory(7)
      },
      {
        id: 'link-2',
        originalUrl: 'https://tailwindcss.com/docs',
        slug: 'tailwind-docs',
        creatorId: 'admin-1',
        clicks: 128,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        lastClickedAt: new Date().toISOString(),
        history: generateMockHistory(10)
      }
    ];
    localStorage.setItem(LINKS_KEY, JSON.stringify(demoLinks));
  }

  // Initialize Language DB if needed (Simulating the requirement for distinct .db files)
  if (!localStorage.getItem(LANG_KEY)) {
      localStorage.setItem(LANG_KEY, JSON.stringify({ currentLang: 'vi', available: ['vi', 'en'] }));
  }
};

initData();

// --- Auth Services (User DB) ---

export const login = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) throw new Error("Email hoặc mật khẩu không đúng.");
  
  const { password: _, ...userWithoutPass } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPass));
  return userWithoutPass;
};

export const register = async (email: string, password: string, name: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  if (users.find(u => u.email === email)) throw new Error("Email đã tồn tại.");

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    password,
    name,
    role: UserRole.USER,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const { password: _, ...userWithoutPass } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPass));
  return userWithoutPass;
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const recoverPassword = async (email: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("Không tìm thấy email trong hệ thống.");
};

export const updateUserRole = (userId: string, newRole: UserRole) => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].role = newRole;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const getAllUsers = (): User[] => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  // Remove passwords
  return users.map((u: User) => {
    const { password, ...rest } = u;
    return rest;
  });
};

export const deleteUser = (userId: string) => {
  let users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Clean up user's links
  let links = getAllLinks();
  links = links.filter(l => l.creatorId !== userId);
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
};

// --- Link Services (Link DB) ---

export const getAllLinks = (): ShortLink[] => {
  // Filter out expired guest links (simple garbage collection on read)
  let links: ShortLink[] = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
  // Optional: Clean up really old expired guest links automatically
  return links;
};

export const getLinksByUser = (userId: string): ShortLink[] => {
  const all = getAllLinks();
  return all.filter(l => l.creatorId === userId);
};

export const getLinkById = (linkId: string): ShortLink | undefined => {
  const all = getAllLinks();
  return all.find(l => l.id === linkId);
}

export const getLinkBySlug = (slug: string): ShortLink | undefined => {
  const all = getAllLinks();
  return all.find(l => l.slug === slug);
}

export const createShortLink = async (originalUrl: string, slug: string, creatorId: string = 'guest', expiresAt?: string): Promise<ShortLink> => {
  // Simulate delay only for single create to feel real
  if (creatorId !== 'bulk') {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  const links = getAllLinks();
  
  if (links.some(l => l.slug === slug)) {
    throw new Error(`Slug '${slug}' đã được sử dụng.`);
  }

  // Handle Guest Constraints
  if (creatorId === 'guest') {
    // Expiry is hardcoded to 24h for guests
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    expiresAt = tomorrow.toISOString();
  }

  const newLink: ShortLink = {
    id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    originalUrl,
    slug,
    creatorId: creatorId === 'bulk' ? 'guest' : creatorId, // Handle bulk edge case if needed, but usually we pass real ID
    clicks: 0,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
    history: []
  };

  links.push(newLink);
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  return newLink;
};

export const bulkCreateShortLinks = async (
  items: { url: string; slug?: string }[],
  creatorId: string
): Promise<{ success: number; errors: string[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // processing delay
  const errors: string[] = [];
  let successCount = 0;

  for (const item of items) {
    try {
      if (!item.url) continue;
      // Generate slug if missing
      const slug = item.slug || Math.random().toString(36).substring(2, 8);
      await createShortLink(item.url, slug, creatorId);
      successCount++;
    } catch (e: any) {
      errors.push(`Lỗi dòng URL "${item.url}": ${e.message}`);
    }
  }

  return { success: successCount, errors };
};


export const updateLinkExpiry = (linkId: string, expiresAt: string | null) => {
  const links = getAllLinks();
  const index = links.findIndex(l => l.id === linkId);
  if (index !== -1) {
    links[index].expiresAt = expiresAt;
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  }
}

export const deleteLink = (linkId: string) => {
  const links = getAllLinks();
  const newLinks = links.filter(l => l.id !== linkId);
  localStorage.setItem(LINKS_KEY, JSON.stringify(newLinks));
};

export const incrementClick = (linkId: string) => {
  const links = getAllLinks();
  const linkIndex = links.findIndex(l => l.id === linkId);
  
  if (linkIndex !== -1) {
    const link = links[linkIndex];

    // Check expiry
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
       // Expired link, do not increment (in real app, would return 404 or expired page)
       return;
    }

    link.clicks += 1;
    link.lastClickedAt = new Date().toISOString();
    
    // Update History
    const today = new Date().toISOString().split('T')[0];
    if (!link.history) link.history = [];
    
    const todayStatIndex = link.history.findIndex(h => h.date === today);
    if (todayStatIndex >= 0) {
      link.history[todayStatIndex].count += 1;
    } else {
      link.history.push({ date: today, count: 1 });
    }

    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  }
};

// --- Language Services (Language DB) ---

export const getLanguageSettings = (): { currentLang: string, available: string[] } => {
    return JSON.parse(localStorage.getItem(LANG_KEY) || '{"currentLang":"vi","available":["vi"]}');
};

export const setLanguage = (lang: string) => {
    const settings = getLanguageSettings();
    settings.currentLang = lang;
    localStorage.setItem(LANG_KEY, JSON.stringify(settings));
};