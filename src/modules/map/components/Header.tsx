import SiteTopNav from '../../../components/SiteTopNav';

interface HeaderProps {
  activePeriodTitle: string;
  activePeriodId: string;
}

export const Header = ({ activePeriodTitle, activePeriodId }: HeaderProps) => {
  return (
    <header className="map-page-header z-[60]">
      <SiteTopNav variant="map" behavior="sticky" />
    </header>
  );
};
