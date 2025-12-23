import { Link } from 'react-router';
import Button from './Button';
import { useMatch } from 'react-router';
import { useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

type NavEntry = { text: string; to: string };

const ENTRIES: NavEntry[] = [
  { text: 'machines', to: '/' },
  { text: 'add machine', to: '/add' },
  { text: 'arp table', to: '/arp' },
];

const NavButton = ({ text, to }: NavEntry) => {
  const isMatch = useMatch(to);
  return (
    <Link to={to}>
      <Button primary={!!isMatch} className="text-nowrap">
        {text}
      </Button>
    </Link>
  );
};

const Nav = () => {
  const [dark, setDark] = useState(() => {
    const v = localStorage.darkMode === 'true';
    document.documentElement.classList.toggle('dark', v);
    return v;
  });

  const toggleDark = () => {
    setDark((d) => {
      localStorage.darkMode = (!d).toString();
      document.documentElement.classList.toggle('dark', !d);
      return !d;
    });
  };

  return (
    <div className="flex gap-4 justify-between">
      <div className="flex gap-4">
        {ENTRIES.map((e) => (
          <NavButton key={e.to} {...e} />
        ))}
      </div>
      <Button primary={!dark} onClick={toggleDark}>
        {dark ? <FaMoon /> : <FaSun />}
      </Button>
    </div>
  );
};

export default Nav;
