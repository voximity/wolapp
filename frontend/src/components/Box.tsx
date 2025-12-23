import clsx from 'clsx';

export type BoxProps = React.PropsWithChildren<
  {
    primary?: boolean;
    error?: boolean;
    className?: string;
  } & React.HTMLAttributes<HTMLDivElement>
>;

const Box = ({ className, primary, error, children, ...props }: BoxProps) => (
  <div
    className={clsx(
      'backdrop-blur-md border py-2 px-4',
      primary
        ? 'bg-purple-200/20 border-purple-400 dark:text-purple-200 text-purple-950'
        : error
          ? 'bg-red-200/20 border-red-400 dark:text-red-200 text-red-950'
          : 'bg-stone-200/20 border-stone-400',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default Box;
