import Image from 'next/image';

export default function KDashLogo({ className = '' }: { className?: string }) {
  return (
    <Image 
      src="/kdash-logo.svg" 
      alt="KDash Logo" 
      width={180} 
      height={48} 
      className={`w-auto h-8 md:h-12 object-contain object-left brightness-0 ${className}`}
      priority 
    />
  );
}
