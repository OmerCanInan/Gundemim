// src/services/opmlService.js
import { getRssLinks, addRssLink } from './dbService';

/**
 * OPML XML string verisini parse eder ve veritabanına ekler.
 * @param {string} opmlText
 * @returns {number} Eklenen yeni link sayısı
 */
export const importOPML = (opmlText) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(opmlText, "text/xml");
  const outlines = xmlDoc.querySelectorAll("outline");
  let addedCount = 0;

  outlines.forEach(outline => {
    const xmlUrl = outline.getAttribute("xmlUrl");
    if (xmlUrl) {
      // OPML dosyasında genellikle title veya text attr'si ve bir kategori (üst outline) olabilir.
      // Klasörü belirlemek için ana outline'a bakılır
      let folder = '';
      const parent = outline.parentElement;
      if (parent && parent.tagName.toLowerCase() === 'outline') {
        folder = parent.getAttribute("title") || parent.getAttribute("text") || '';
      }
      
      const beforeCount = getRssLinks().length;
      addRssLink(xmlUrl, folder);
      if (getRssLinks().length > beforeCount) {
        addedCount++;
      }
    }
  });

  return addedCount;
};

/**
 * Veritabanındaki RSS linklerini OPML formatında dışa aktarır.
 * @returns {string} OPML XML String
 */
export const exportOPML = () => {
  const links = getRssLinks();
  
  // Klasörlere göre grupla
  const grouped = {};
  links.forEach(link => {
    const folder = link.folder || "Kategorisiz";
    if (!grouped[folder]) grouped[folder] = [];
    grouped[folder].push(link);
  });

  let opmlStr = `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="1.0">\n  <head>\n    <title>Antigravity RSS Yedek</title>\n  </head>\n  <body>\n`;
  
  Object.keys(grouped).forEach(folder => {
    // Escape HTML characters
    const safeFolder = folder.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    opmlStr += `    <outline text="${safeFolder}" title="${safeFolder}">\n`;
    
    grouped[folder].forEach(linkItem => {
      const safeUrl = linkItem.url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      opmlStr += `      <outline type="rss" text="${safeUrl}" xmlUrl="${safeUrl}" />\n`;
    });
    
    opmlStr += `    </outline>\n`;
  });

  opmlStr += `  </body>\n</opml>`;
  
  return opmlStr;
};
