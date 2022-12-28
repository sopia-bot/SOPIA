import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ko from './ko.json';
import LanguageDetector from 'i18next-browser-languagedetector';


i18next.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			ko: { transition: ko },
		},
		fallbackLng: 'ko',
		debug: true,
		interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
	});

export default i18next;