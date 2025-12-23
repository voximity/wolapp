import React, { useEffect, useState } from 'react';
import Box from '../components/Box';
import Button from '../components/Button';
import { Link } from 'react-router';

type Row = { ip: string; mac: string };

const Arp = () => {
  const [table, setTable] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/arp')
      .then((r) => r.json())
      .then((d) => setTable(d as Row[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Box primary>
        <b className="text-xl">arp table</b>
        {loading ? (
          <p>fetching the arp table...</p>
        ) : (
          <p>
            below is the current arp table for the machine running wolapp,
            mapping ip to hardware address. select{' '}
            <span className="text-purple-400 font-bold">add</span> to add a mac
            address as wakable to wolapp.
          </p>
        )}
      </Box>
      <div className="grid grid-cols-[1fr_auto_auto] gap-4">
        <Box primary>
          <b>ip address</b>
        </Box>
        <Box primary className="col-span-2">
          <b>mac address</b>
        </Box>
        {table.map((r) => (
          <React.Fragment key={r.ip + r.mac}>
            <Box>{r.ip}</Box>
            <Box>{r.mac}</Box>
            <Link to={`/add?mac=${r.mac}`} className="contents">
              <Button primary className="px-4">
                add
              </Button>
            </Link>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export default Arp;
