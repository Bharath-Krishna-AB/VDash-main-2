const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  // Modals bg and border
  content = content.replace(/bg-white([^>]*?)shadow-card/g, 'bg-[var(--color-background)] border-[3px] border-[var(--color-surface-dark)] $1shadow-[0_8px_0_var(--color-surface-dark)]');
  // Close buttons / Action buttons
  content = content.replace(/bg-surface-dark text-white border-none/g, 'bg-[var(--color-brand-primary)] text-[var(--color-surface-dark)] border-[2px] border-[var(--color-surface-dark)] shadow-[0_4px_0_var(--color-surface-dark)]');
  // Help icon
  content = content.replace(/stroke="#FFFFFF"/g, 'stroke="var(--color-surface-dark)"');
  // Secondary boxes
  content = content.replace(/bg-slate-50 border-2 border-slate-200/g, 'bg-[var(--color-background)] border-[3px] border-[var(--color-surface-dark)]');
  // Avatars
  content = content.replace(/bg-blue-600 text-white/g, 'bg-[var(--color-brand-primary)] text-[var(--color-surface-dark)] border-[2px] border-[var(--color-surface-dark)]');
  content = content.replace(/bg-blue-500 text-white/g, 'bg-[var(--color-brand-primary)] text-[var(--color-surface-dark)] border-[2px] border-[var(--color-surface-dark)]');
  content = content.replace(/bg-slate-500 text-white/g, 'bg-[var(--color-brand-primary)] text-[var(--color-surface-dark)] border-[2px] border-[var(--color-surface-dark)]');
  // Call buttons
  content = content.replace(/bg-surface-dark text-white/g, 'bg-[var(--color-brand-primary)] text-[var(--color-surface-dark)] border-[2px] border-[var(--color-surface-dark)] shadow-[0_4px_0_var(--color-surface-dark)]');
  fs.writeFileSync(file, content);
}

fix('components/modals/HintModal.tsx');
fix('components/modals/HelpModal.tsx');
fix('components/modals/ContactsModal.tsx');
