import { getInitials, generateColorFromString } from '../utils/common.utils';

export default function Avatar({ src, name, className = 'w-11 h-11' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${className} rounded-full object-cover`}
      />
    );
  } else {
    const initials = getInitials(name);
    const backgroundColor = generateColorFromString(name);

    return (
      <div
        className={`${className} rounded-full flex items-center justify-center text-white font-bold select-none`}
        style={{ backgroundColor }}
      >
        <span>{initials}</span>
      </div>
    );
  }
}