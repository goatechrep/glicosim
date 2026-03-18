import { legalContentMocks, LegalContentType, LegalDocumentContent } from '../data/legalContent';

const LEGAL_DOCUMENTS_KEY = 'glicosim_legal_documents';

const getStorage = (): Record<LegalContentType, LegalDocumentContent> => {
  const stored = localStorage.getItem(LEGAL_DOCUMENTS_KEY);
  if (!stored) {
    localStorage.setItem(LEGAL_DOCUMENTS_KEY, JSON.stringify(legalContentMocks));
    return legalContentMocks;
  }

  return JSON.parse(stored) as Record<LegalContentType, LegalDocumentContent>;
};

const setStorage = (documents: Record<LegalContentType, LegalDocumentContent>) => {
  localStorage.setItem(LEGAL_DOCUMENTS_KEY, JSON.stringify(documents));
};

export const legalDocumentService = {
  getDocuments(): Record<LegalContentType, LegalDocumentContent> {
    return getStorage();
  },

  getDocument(type: LegalContentType): LegalDocumentContent {
    return getStorage()[type];
  },

  updateDocument(type: LegalContentType, content: LegalDocumentContent): LegalDocumentContent {
    const documents = getStorage();
    documents[type] = content;
    setStorage(documents);
    return documents[type];
  },
};
