import React from 'react';
import { useTranslation } from "react-i18next";

export const App = () => {
    const { t } = useTranslation();
  return (
    <div className="container">
      <h1>{t('App_WelcomeToAutoi18n')}</h1>
      <p>{t('App_ThisIsASimpleTest')}</p>
      <input placeholder={t('App_EnterYourName')} />
      <button title={t('App_ClickMe')}>{t('App_Submit')}</button>
    </div>
  );
};
