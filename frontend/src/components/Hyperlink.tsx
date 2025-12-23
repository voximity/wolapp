import { Link } from 'react-router';

const Hyperlink = (props: React.ComponentProps<typeof Link>) => (
  <Link
    className="text-purple-500 dark:text-purple-400 font-bold hover:text-purple-400 dark:hover:text-purple-500"
    {...props}
  />
);

export default Hyperlink;
