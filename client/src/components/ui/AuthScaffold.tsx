import type { PropsWithChildren, ReactNode } from 'react';
import { Cloud, Star } from 'lucide-react';
import schoolCar from '../../assets/school-car.svg';

type AuthScaffoldProps = PropsWithChildren<{
  headingId: string;
  title: ReactNode;
  subtitle: string;
}>;

export const AuthScaffold = ({ headingId, title, subtitle, children }: AuthScaffoldProps) => (
  <section className="header-screen" aria-labelledby={headingId}>
    <div className="header-art" aria-hidden="true">
      <Cloud className="header-cloud header-cloud--left" fill="currentColor" strokeWidth={0} />
      <Cloud className="header-cloud header-cloud--right" fill="currentColor" strokeWidth={0} />
      <Star className="header-star header-star--large" fill="currentColor" strokeWidth={0} />
      <Star className="header-star header-star--small" fill="currentColor" strokeWidth={0} />
      <img className="header-car" src={schoolCar} alt="" />
      <div className="header-road">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
    <div className="header-panel">
      <div className="mb-5 text-center">
        <h1
          id={headingId}
          className="display-heading inline-flex items-center justify-center gap-2"
        >
          {title}
        </h1>
        <p className="body-copy mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  </section>
);
