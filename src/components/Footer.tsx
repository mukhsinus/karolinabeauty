// src/components/Footer.tsx
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-8 border-t border-border bg-card">
      <div className="container mx-auto px-4 text-center">
        <p className="font-display text-lg font-semibold text-foreground mb-2">Beauty Studio</p>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Beauty Studio. {t("footer.rights")}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
