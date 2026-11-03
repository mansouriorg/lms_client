import { GraduationCap } from 'lucide-react';
import { brand } from '@/lib/brand';

type LogoProps = {
  // 'sm' for mobile headers, 'md' everywhere else
  size?: 'sm' | 'md';
  // optional second line under the name, for example "Student space"
  subtitle?: string;
  className?: string;
};

// The one logo of the platform: a graduation cap mark and the brand name.
export default function Logo({ size = 'md', subtitle, className = '' }: LogoProps) {
  const small = size === 'sm';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 ${
          small ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-xl'
        }`}
      >
        <GraduationCap aria-hidden="true" className={`text-white ${small ? 'h-5 w-5' : 'h-6 w-6'}`} />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-bold leading-tight tracking-tight text-white ${small ? 'text-base' : 'text-lg'}`}
        >
          {brand.name}
        </span>
        {subtitle ? <span className="text-xs font-medium text-indigo-300">{subtitle}</span> : null}
      </div>
    </div>
  );
}
