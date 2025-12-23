import { Outlet } from 'react-router';
import ExtHyperlink from './ExtHyperlink';
import Nav from './Nav';

const Layout = () => {
  return (
    <div className="flex flex-col justify-between min-h-svh p-4 w-full max-w-4xl mx-auto gap-16">
      <div className="flex flex-col gap-4">
        <div className="relative w-full aspect-6/1 -z-10">
          <svg
            viewBox="0 0 450 150"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            className="absolute w-full select-none"
          >
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0" y2="100%">
                <stop offset="0%" className="header-text-effect-stop" />
                <stop offset="25%" className="header-text-effect-stop" />
                <stop offset="90%" className="header-text-effect-stop-end" />
              </linearGradient>
            </defs>
            <text
              x="0"
              y="0"
              textAnchor="start"
              dominantBaseline="hanging"
              fontSize="150"
              fontFamily="Iosevka, monospace"
              fontWeight="700"
              fill="url(#grad)"
            >
              wolapp
            </text>
          </svg>
        </div>
        <Nav />
        <Outlet />
      </div>
      <div className="text-stone-400 dark:text-stone-500 flex gap-8 items-baseline justify-between">
        <p>
          <ExtHyperlink href="https://github.com/voximity/wolapp">
            wolapp
          </ExtHyperlink>{' '}
          (<span className="text-stone-500 dark:text-stone-400">w</span>ake-
          <span className="text-stone-500 dark:text-stone-400">o</span>n-
          <span className="text-stone-500 dark:text-stone-400">l</span>an{' '}
          <span className="text-stone-500 dark:text-stone-400">app</span>) is a
          project by{' '}
          <ExtHyperlink href="https://zanderf.net/">voximity</ExtHyperlink>.
        </p>
        <div className="flex items-end text-nowrap flex-col sm:flex-row sm:gap-6">
          <ExtHyperlink href="https://github.com/voximity/wolapp">
            source code
          </ExtHyperlink>
          <ExtHyperlink href="https://github.com/voximity/wolapp/blob/master/LICENSE">
            license
          </ExtHyperlink>
        </div>
      </div>
    </div>
  );
};

export default Layout;
