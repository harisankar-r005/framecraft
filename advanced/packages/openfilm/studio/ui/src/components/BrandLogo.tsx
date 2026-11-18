import logo from '../assets/framecraft.png';

export function BrandLogo({ size = 18, className }: { size?: number; className?: string }) {
  return <img src={logo} width={size} height={size} className={`block shrink-0 ${className ?? ""}`} alt="Framecraft" />;
}
