'use client';

// Privacy policy and terms of use for the hackathon prototype.
// Written for what the app really does: demo mode keeps data on the device, Supabase mode stores it in Supabase.
import { formatDate } from '../lib/day';
import { useLang } from './LangProvider';

const UPDATED = new Date(2026, 10, 24).getTime();

export function Privacy() {
  const { t, tr, lang } = useLang();
  const name = (n: string) => ({ name: <strong>{n}</strong> });
  return (
    <main className="legal">
      <p className="legal-meta">{t('legal.updated', { date: formatDate(UPDATED, lang) })}</p>
      <h1>{t('priv.title')}</h1>
      <p className="legal-lead">{t('priv.lead')}</p>

      <h2>{t('priv.whoH')}</h2>
      <p>{t('priv.whoP')}</p>

      <h2>{t('priv.dataH')}</h2>
      <ul>
        <li>{t('priv.data1')}</li>
        <li>{t('priv.data2')}</li>
        <li>{t('priv.data3')}</li>
        <li>{t('priv.data4')}</li>
        <li>{t('priv.data5')}</li>
      </ul>
      <p>{t('priv.dataHealth')}</p>

      <h2>{t('priv.whereH')}</h2>
      <p>
        <strong>{t('priv.demoLead')}</strong> {t('priv.demoText')}
      </p>
      <p>
        <strong>{t('priv.sbLead')}</strong> {t('priv.sbText')}
      </p>
      <p>{t('priv.noStats')}</p>
      <p>{t('priv.langP')}</p>

      <h2 id="cookies">{t('priv.cookiesH')}</h2>
      <p>{t('priv.cookiesP')}</p>

      <h2>{t('priv.thirdH')}</h2>
      <p>{t('priv.thirdIntro')}</p>
      <ul>
        <li>{tr('priv.thirdMeteo', name('Open-Meteo'))}</li>
        <li>{tr('priv.thirdFonts', name('Google Fonts'))}</li>
        <li>{tr('priv.thirdSupabase', name('Supabase'))}</li>
        <li>{tr('priv.thirdHost', name(t('priv.thirdHostName')))}</li>
      </ul>

      <h2>{t('priv.rightsH')}</h2>
      <p>{t('priv.rightsP')}</p>
    </main>
  );
}

export function Terms() {
  const { t, lang } = useLang();
  return (
    <main className="legal">
      <p className="legal-meta">{t('legal.updated', { date: formatDate(UPDATED, lang) })}</p>
      <h1>{t('terms.title')}</h1>
      <p className="legal-lead">{t('terms.lead')}</p>

      <h2>{t('terms.protoH')}</h2>
      <p>{t('terms.protoP')}</p>

      <h2>{t('terms.noGuaranteeH')}</h2>
      <p>{t('terms.noGuaranteeP')}</p>

      <h2>{t('terms.dataH')}</h2>
      <p>{t('terms.dataP')}</p>

      <h2>{t('terms.liabilityH')}</h2>
      <p>{t('terms.liabilityP')}</p>

      <h2>{t('terms.rightsH')}</h2>
      <p>{t('terms.rightsP')}</p>

      <h2>{t('terms.lawH')}</h2>
      <p>{t('terms.lawP')}</p>
    </main>
  );
}
