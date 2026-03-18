import React from 'react';
import { LegalContentType } from '../data/legalContent';
import { legalDocumentService } from '../services/legalDocumentService';
import BaseModal from './BaseModal';

interface LegalModalProps {
  type: LegalContentType | null;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const content = legalDocumentService.getDocument(type);

  return (
    <BaseModal
      isOpen={Boolean(type)}
      onClose={onClose}
      panelClassName="max-w-2xl max-h-[85vh]"
      bodyClassName="max-h-[calc(85vh-96px)] overflow-y-auto px-6 pb-[60px] pt-5 space-y-6"
      eyebrow="Documento de teste"
      title={<span className="text-2xl">{content.title}</span>}
      subtitle={`Atualizado em ${content.updatedAt}`}
    >
      {content.sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white">{section.heading}</h3>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </BaseModal>
  );
};

export default LegalModal;
