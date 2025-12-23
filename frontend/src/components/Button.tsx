import clsx from 'clsx';

export type ButtonProps = React.PropsWithChildren<
  {
    primary?: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>;

const Button = ({ primary, children, className, ...props }: ButtonProps) => (
  <button
    className={clsx(
      'px-2 py-1.5 leading-none font-bold',
      'disabled:opacity-60 not-disabled:cursor-pointer',
      primary
        ? 'bg-purple-600 text-white not-disabled:hover:bg-purple-700'
        : 'bg-purple-200 dark:bg-stone-800 outline outline-purple-600 not-disabled:hover:bg-purple-300 text-purple-600 dark:not-disabled:hover:bg-stone-700 dark:text-purple-400',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export default Button;
