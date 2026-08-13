"use client";

import * as React from "react";
import { footerLinks } from "@/lib/config/site";
import { legalDocs } from "@/lib/config/legal-content";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function LegalLinks() {
  const [openDoc, setOpenDoc] = React.useState<{ href: string; title: string } | null>(null);
  const doc = openDoc ? legalDocs[openDoc.href] : null;

  return (
    <>
      <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-6 gap-y-2">
        {footerLinks.map((link) => (
          <Button
            key={link.href}
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-muted hover:bg-transparent hover:text-foreground"
            onClick={() => setOpenDoc({ href: link.href, title: link.label })}
          >
            {link.label}
          </Button>
        ))}
      </nav>

      {doc && (
        <Modal
          open={Boolean(doc)}
          onOpenChange={(open) => !open && setOpenDoc(null)}
          title={doc.title}
          description={doc.updated}
        >
          <div className="max-h-[65vh] overflow-y-auto pr-1">
            <p className="mb-3 text-sm leading-relaxed">{doc.intro}</p>
            {doc.sections.map((section, index) => (
              <div key={index} className="mb-4">
                {section.heading && (
                  <h3 className="mb-1.5 text-sm font-semibold">{section.heading}</h3>
                )}
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className="mb-2 text-sm leading-relaxed text-muted last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}