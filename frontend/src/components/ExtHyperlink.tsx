const ExtHyperlink = (props: React.HTMLProps<HTMLAnchorElement>) => (
  <a
    className="text-purple-500 dark:text-purple-400 font-bold hover:text-purple-400 dark:hover:text-purple-500"
    target="_blank"
    rel="noopener noreferer"
    {...props}
  />
);

export default ExtHyperlink;
