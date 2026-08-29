import { Cloud, Star } from 'lucide-react';
import schoolCar from '../../../assets/school-car.svg';

type StudentHeaderProps = {
  name: string;
  status: 'picked up' | 'dropped off' | 'waiting';
};

function StudentHeader({ name, status }: StudentHeaderProps) {
  const statusClass =
    status === 'picked up'
      ? 'bg-leaf-soft text-leaf-dark'
      : status === 'dropped off'
        ? 'bg-sky-soft text-sky-dark'
        : 'bg-[#fff6d8] text-[#946b00]';

  return (
    <section className="-mx-6 -mt-6 mb-5 flex flex-col">
      <div className="header-art h-75" aria-hidden="true">
        <Cloud className="header-cloud header-cloud--left" fill="currentColor" strokeWidth={0} />
        <Cloud className="header-cloud header-cloud--right" fill="currentColor" strokeWidth={0} />
        <Star className="header-star header-star--large" fill="currentColor" strokeWidth={0} />
        <Star className="header-star header-star--small" fill="currentColor" strokeWidth={0} />
        <img className="header-car bottom-24" src={schoolCar} alt="" />
        <div className="header-road">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="absolute top-0 inset-x-0 z-50 mb-5 p-4">
          <p className="font-bold text-muted">
            Good morning, <span className="capitalize">{name ? name.split(' ')[0] : 'Parent'}!</span>
          </p>
          <h1 id="student-dashboard-heading" className="display-heading">
            Here's today's ride
          </h1>
        </div>
        <span className={`status-pill absolute bottom-12 left-1/2 -translate-x-1/2 capitalize ${statusClass}`}>
          {status}
        </span>
      </div>
    </section>
  );
}

export default StudentHeader;
