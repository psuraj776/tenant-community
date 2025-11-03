/**
 * About Module
 * Static content and app information
 */

export interface AboutContent {
  mission: string;
  team: string;
  contact: string;
  terms: string;
  privacy: string;
  version: string;
}

export const aboutContent: AboutContent = {
  mission: 'Tenant Community is a platform to help tenants find homes, flatmates, and connect with the community.',
  team: 'Built with ❤️ by a team of passionate developers.',
  contact: 'Email: support@tenantcommunity.com',
  terms: 'https://tenantcommunity.com/terms',
  privacy: 'https://tenantcommunity.com/privacy',
  version: '1.0.0',
};
