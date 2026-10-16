import React, { useEffect } from 'react';
import { SITE_CONFIG } from '../../config/site';

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  isPrivate?: boolean;
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  path,
  isPrivate = false,
  noIndex = false
}) => {
  const shouldNoIndex = isPrivate || noIndex;
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title.includes('HireX') 
      ? title 
      : `${title} | HireX`;
    document.title = formattedTitle;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Canonical Tag
    const canonicalUrl = `${SITE_CONFIG.publicUrl}${path === '/' ? '' : path}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 4. Update Robots Tag (noindex for private views, index for public pages)
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', shouldNoIndex ? 'noindex, nofollow' : 'index, follow');

    // 5. Update Open Graph Meta
    const updateOg = (property: string, content: string) => {
      let og = document.querySelector(`meta[property="${property}"]`);
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', property);
        document.head.appendChild(og);
      }
      og.setAttribute('content', content);
    };

    updateOg('og:title', formattedTitle);
    updateOg('og:description', description);
    updateOg('og:url', canonicalUrl);
    updateOg('og:type', isPrivate ? 'article' : 'website');
    updateOg('og:image', `${SITE_CONFIG.publicUrl}/favicon.svg`);

    // 6. JSON-LD Structured Data
    let jsonLd = document.getElementById('hirex-jsonld');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'hirex-jsonld';
      jsonLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLd);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${SITE_CONFIG.publicUrl}/#website`,
          "url": SITE_CONFIG.publicUrl,
          "name": SITE_CONFIG.name,
          "description": SITE_CONFIG.description,
          "inLanguage": "en-US"
        },
        {
          "@type": "Organization",
          "@id": `${SITE_CONFIG.publicUrl}/#organization`,
          "name": SITE_CONFIG.organization.name,
          "url": SITE_CONFIG.publicUrl,
          "logo": `${SITE_CONFIG.publicUrl}/favicon.svg`,
          "description": SITE_CONFIG.description,
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "email": SITE_CONFIG.organization.contactEmail
          }
        }
      ]
    };

    jsonLd.textContent = JSON.stringify(schemaData);
  }, [title, description, path, isPrivate]);

  return null;
};
